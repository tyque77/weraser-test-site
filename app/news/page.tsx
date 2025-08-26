"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { getAllNews, getNewsByType } from "@/lib/newsData"

export default function NewsPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'news' | 'blog'>('news')
  const [currentPage, setCurrentPage] = useState(1)
  const [allNews, setAllNews] = useState(getAllNews())
  const itemsPerPage = 10
  
  const filteredNews = getNewsByType(activeTab)
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentNews = filteredNews.slice(startIndex, endIndex)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setCurrentPage(1) // 탭 변경 시 첫 페이지로 리셋
  }, [activeTab])

  useEffect(() => {
    // localStorage 변경 감지
    const handleStorageChange = () => {
      console.log('News page: Storage changed, reloading data')
      const freshData = getAllNews()
      console.log('News page: Fresh data length:', freshData.length)
      setAllNews([...freshData]) // 새 배열로 강제 업데이트
    }

    // 브라우저 탭 간 통신
    window.addEventListener('storage', handleStorageChange)
    
    // 같은 탭에서의 변경 감지 (500ms마다 체크)
    const interval = setInterval(() => {
      const lastUpdate = localStorage.getItem('newsUpdated')
      if (lastUpdate) {
        console.log('News page: Detected update signal')
        handleStorageChange()
        localStorage.removeItem('newsUpdated')
      }
    }, 500)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-white text-black font-['Pretendard',sans-serif]">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between" style={{ maxWidth: '1400px' }}>
          <Link href="/" className="flex items-center">
            <Image
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
      </header>

      {/* Main Content */}
      <main className="pt-16 md:pt-20">
        {/* Header Section - Title + Tabs */}
        <section className="pt-16 lg:pt-20">
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1400px' }}>
            <h1 className="text-4xl lg:text-6xl font-bold mb-10 tracking-[-0.01em]">
              Press Room
            </h1>
            
            {/* Tabs - Full Width Modern Pill Style */}
            <div className="flex bg-gray-100 rounded-full p-1 w-full" style={{ marginBottom: '60px' }}>
              <button 
                onClick={() => setActiveTab('news')}
                className={`flex-1 py-4 text-lg font-semibold rounded-full transition-all duration-300 ${
                  activeTab === 'news' 
                    ? 'bg-black text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                News
              </button>
              <button 
                onClick={() => setActiveTab('blog')}
                className={`flex-1 py-4 text-lg font-semibold rounded-full transition-all duration-300 ${
                  activeTab === 'blog' 
                    ? 'bg-black text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                Blog
              </button>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="pb-20">
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1400px' }}>
            {activeTab === 'news' ? (
              /* News List */
              <div className="space-y-8">
                {currentNews.map((news) => (
                  <Link key={news.id} href={`/news/${news.slug}`}>
                    <article className="border-b border-gray-200 pb-8 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 lg:gap-8 lg:items-center">
                        {/* Image */}
                        <div className="w-full lg:w-[300px] h-48 lg:h-[180px] bg-gray-200 rounded overflow-hidden">
                          {news.imageUrl ? (
                            <img 
                              src={news.imageUrl} 
                              alt={news.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.nextElementSibling!.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center" style={{ display: news.imageUrl ? 'none' : 'flex' }}>
                            <span className="text-gray-500 text-sm">Logistics Document Automation</span>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <h2 className="text-xl lg:text-2xl font-semibold text-black mb-3 leading-tight hover:text-blue-600 transition-colors">
                            {news.title}
                            {news.subtitle && (
                              <span className="block text-lg lg:text-xl text-gray-600 mt-1">
                                {news.subtitle}
                              </span>
                            )}
                          </h2>
                          <p 
                            className="text-gray-600 text-base leading-relaxed mb-4"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {news.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              Update {news.date}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
                
                {filteredNews.length === 0 && (
                  <div className="text-center text-gray-500 py-16">
                    <p>등록된 {activeTab === 'news' ? '뉴스' : '블로그'}가 없습니다.</p>
                  </div>
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-12 gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      이전
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            currentPage === page
                              ? 'bg-black text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      다음
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Blog Content */
              <div className="space-y-8">
                {currentNews.map((blog) => (
                  <Link key={blog.id} href={`/news/${blog.slug}`}>
                    <article className="border-b border-gray-200 pb-8 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 lg:gap-8 lg:items-center">
                        {/* Image */}
                        <div className="w-full lg:w-[300px] h-48 lg:h-[180px] bg-gray-200 rounded overflow-hidden">
                          {blog.imageUrl ? (
                            <img 
                              src={blog.imageUrl} 
                              alt={blog.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.nextElementSibling!.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center" style={{ display: blog.imageUrl ? 'none' : 'flex' }}>
                            <span className="text-gray-500 text-sm">Blog Image</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex flex-col h-full">
                            <div className="flex-1">
                              <h2 className="text-xl font-semibold text-gray-900 mb-2 leading-tight hover:text-blue-600 transition-colors">
                                {blog.title}
                              </h2>
                              <p 
                                className="text-gray-600 text-sm leading-relaxed mb-3"
                                style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {blog.description}
                              </p>
                            </div>
                            <div className="text-xs text-gray-500">
                              Update {blog.date} | {blog.category}
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
                
                {filteredNews.length === 0 && (
                  <div className="text-center text-gray-500 py-16">
                    <p>등록된 {activeTab === 'news' ? '뉴스' : '블로그'}가 없습니다.</p>
                  </div>
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-12 gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      이전
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            currentPage === page
                              ? 'bg-black text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      다음
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

