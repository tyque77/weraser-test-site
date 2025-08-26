'use client'

import Link from "next/link"
import { getNewsBySlug, getAllNews } from "@/lib/newsData"
import { useState, useEffect } from "react"

interface NewsDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function NewsDetailPage({ params }: NewsDetailPageProps) {
  const [newsItem, setNewsItem] = useState<any>(null)
  const [allNews, setAllNews] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [currentSlug, setCurrentSlug] = useState<string>('')

  useEffect(() => {
    // params를 resolve하고 데이터 로드
    const initializeData = async () => {
      const resolvedParams = await params
      const slug = resolvedParams.slug
      setCurrentSlug(slug)
      
      const item = getNewsBySlug(slug)
      const news = getAllNews()
      setNewsItem(item)
      setAllNews(news)
      setMounted(true)
    }
    
    initializeData()
  }, [])

  useEffect(() => {
    if (!currentSlug) return
    
    // localStorage 변경 감지
    const handleStorageChange = () => {
      console.log('News detail: Storage changed, reloading data')
      const item = getNewsBySlug(currentSlug)
      const news = getAllNews()
      console.log('News detail: Fresh item:', item?.title)
      console.log('News detail: Fresh news count:', news.length)
      setNewsItem(item)
      setAllNews([...news]) // 새 배열로 강제 업데이트
    }

    // 브라우저 탭 간 통신
    window.addEventListener('storage', handleStorageChange)
    
    // 같은 탭에서의 변경 감지 (500ms마다 체크)
    const interval = setInterval(() => {
      const lastUpdate = localStorage.getItem('newsUpdated')
      if (lastUpdate) {
        console.log('News detail: Detected update signal')
        handleStorageChange()
        localStorage.removeItem('newsUpdated')
      }
    }, 500)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [currentSlug])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }
  
  if (!newsItem) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/">
                <img
                  src="/header_logo_scroll.svg"
                  alt="Weraser Logo"
                  width={109}
                  height={19}
                  className="w-24 md:w-[109px] h-auto"
                />
              </Link>
              
              <nav className="hidden md:flex items-center gap-8">
                <Link href="/" className="text-gray-600 hover:text-black transition-colors">
                  Home
                </Link>
                <Link href="/news" className="text-black font-semibold">
                  Press Room
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="pt-16 md:pt-20">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16" style={{ maxWidth: '1400px' }}>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">기사를 찾을 수 없습니다</h1>
              <Link href="/news" className="text-blue-600 hover:text-blue-800">
                뉴스 목록으로 돌아가기
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <img
                src="/header_logo_scroll.svg"
                alt="Weraser Logo"
                width={109}
                height={19}
                className="w-24 md:w-[109px] h-auto"
              />
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-600 hover:text-black transition-colors">
                Home
              </Link>
              <Link href="/news" className="text-black font-semibold">
                Press Room
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="pt-16 md:pt-20">
        {/* Article Content */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1400px' }}>
            <article>
              {/* Article Title */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
                {newsItem.title}
              </h1>
              
              {/* Date */}
              <p className="text-gray-500 mb-8">
                업데이트 {newsItem.date}
              </p>
            </article>
          </div>

          {/* Featured Image - Original Size, Center Aligned */}
          <div className="mx-auto px-4 sm:px-6 lg:px-8 mb-8" style={{ maxWidth: '1400px' }}>
            {newsItem.imageUrl ? (
              <div className="flex flex-col items-center">
                <img
                  src={newsItem.imageUrl}
                  alt={newsItem.title}
                  className="h-auto"
                  style={{ width: 'auto', height: 'auto' }}
                />
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Logistics Document Automation
                </p>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-full bg-gray-200 flex items-center justify-center" style={{ height: '300px', maxWidth: '800px' }}>
                  <span className="text-gray-500">Logistics Document Automation</span>
                </div>
              </div>
            )}
          </div>

          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1400px' }}>
            <article>
              {/* Article Body */}
              <div className="text-gray-700 leading-7 space-y-6">
                <p>
                  위레이저는 국민일보와 쿠키뉴스가 주최한 '코어이노베이션코리아 2024'에서 물류 관리 및 데이터 처리 혁신을 인정받아 대상을 수상했습니다.
                </p>
                
                <p>
                  위레이저의 대표 플랫폼 '와이즈컨베이'는 물류 산업에 특화된 AI 데이터 관리 솔루션으로, 문서 처리와 데이터 통합을 자동화하여 업무 효율성을 향상시킵니다. 와이즈컨베이는 AI 비전 기술과 전문 AI 에이전트를 활용해 모든 문서를 10초 내에 처리하며, 다국어 지원과 실시간 통합 데이터 관리 기능을 제공합니다. 이를 통해 문서 처리 시간을 90% 단축하고 데이터 정확도를 99.9%까지 높였습니다.
                </p>
                
                <p>
                  기존 물류 시장에서는 문서 처리량이 급증하면서도 수작업으로 인한 오류와 지연이 지속되고 있었습니다. 위레이저의 솔루션은 이러한 한계를 극복하고 인건비를 60-80% 절감하며 오류 처리 비용을 90% 이상 감소시켜 중소 물류 업체에도 적합한 효율성을 제공합니다. 이는 종이 없는 물류 환경 구축도 가속화합니다.
                </p>
                
                <p>
                  위레이저는 컴퍼니디, JB벤처스, TIPS(Tech Incubator Program for Startup) 프로그램을 통해 기술력을 인정받았으며, 노틸러스 인베스트먼트 참여와 OpenAI의 글로벌 협력 프로그램 참여를 통해 글로벌 시장에서도 주목받고 있습니다. 또한 충남창업마루나비에 본사를 두고 지역 물류 스타트업 육성, 멘토링, AI 기술 인재 양성, 청년 일자리 창출을 통해 지역사회와 상생하는 기업으로 자리매김하고 있습니다.
                </p>
                
                <p>
                  위레이저는 이번 수상을 발판으로 물류 산업의 디지털 혁신을 선도하고, 중소 물류 업체의 경쟁력 강화를 위한 디지털 전환 솔루션을 더욱 확대할 계획입니다. 또한 스마트 물류 데이터 허브 구축을 통해 지역 경제 활성화와 환경 보호에도 기여할 예정입니다.
                </p>
                
                <p>
                  김현종 위레이저 대표는 "선박회사에서 쌓은 풍부한 물류 산업 경험을 바탕으로 AI 기술로 전통 물류 산업의 문제를 해결하고자 위레이저를 설립했다"며 "30년 이상의 물류 전문성을 바탕으로 글로벌 물류의 디지털 전환을 이끄는 선도 기업이 되겠다"고 말했습니다.
                </p>
                
                <p>
                  이번 시상식은 전국 17개 시도 사업지원기관의 추천과 개별 지원을 통해 진행되었습니다. 지난달 28일 학계, 언론, 투자기관, 변리사 등 외부 전문가 8명이 참여해 공정한 평가 과정을 거쳤습니다.
                </p>
              </div>

              {/* Next Article Section */}
              <div className="mt-16 pt-8 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">다음 글 보기</h3>
                {allNews
                  .filter(item => item.id !== newsItem.id && item.type === newsItem.type)
                  .slice(0, 1)
                  .map((nextItem) => (
                    <Link key={nextItem.id} href={`/news/${nextItem.slug}`}>
                      <div className="flex gap-6 p-4 border border-gray-200 rounded hover:bg-gray-50 transition-colors cursor-pointer" style={{ borderRadius: '4px' }}>
                        {/* Thumbnail */}
                        <div className="w-[120px] h-[72px] bg-gray-200 rounded flex-shrink-0 overflow-hidden" style={{ borderRadius: '4px' }}>
                          {nextItem.imageUrl ? (
                            <img 
                              src={nextItem.imageUrl} 
                              alt={nextItem.title}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center" style={{ display: nextItem.imageUrl ? 'none' : 'flex' }}>
                            <span className="text-gray-500 text-sm">Logistics Document Automation</span>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                            {nextItem.title}
                          </h4>
                          <span className="text-sm text-gray-500">{nextItem.date}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                {allNews.filter(item => item.id !== newsItem.id && item.type === newsItem.type).length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <p>다음 글이 없습니다.</p>
                  </div>
                )}
              </div>

              {/* Footer Navigation */}
              <div className="mt-8 pt-8 flex justify-between items-center">
                <div>
                  {newsItem.originalUrl && (
                    <a 
                      href={newsItem.originalUrl}
                      className="border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
                      style={{ borderRadius: '4px', width: '100px', height: '48px' }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      원문 보기
                    </a>
                  )}
                </div>
                <Link 
                  href="/news"
                  className="text-white font-medium transition-colors flex items-center justify-center"
                  style={{ backgroundColor: '#5C57DD', borderRadius: '4px', width: '100px', height: '48px' }}
                >
                  목록
                </Link>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  )
}