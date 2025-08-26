'use client'

import { useState, useEffect } from "react"
import { NewsItem, getAllNews, addNewsItem, updateNewsItem, deleteNewsItem } from "@/lib/newsData"

export default function AdminPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'edit'>('list')
  const [contentType, setContentType] = useState<'news' | 'blog'>('news')
  const [allItems, setAllItems] = useState<NewsItem[]>([])
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
    imageUrl: '',
    originalUrl: '',
    slug: ''
  })
  const [isUploading, setIsUploading] = useState(false)
  const [suggestedImages, setSuggestedImages] = useState<any[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadData()
  }, [])

  const loadData = () => {
    const freshData = getAllNews()
    console.log('Loading fresh data:', freshData.length, 'items')
    setAllItems([...freshData]) // 새 배열로 강제 업데이트
  }

  const filteredItems = allItems.filter(item => item.type === contentType)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (activeTab === 'add') {
      addNewsItem({
        ...formData,
        type: contentType,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-')
      })
      
      // 성공 메시지 표시
      alert('뉴스가 성공적으로 추가되었습니다!')
    } else if (activeTab === 'edit' && editingItem) {
      updateNewsItem(editingItem.id, {
        ...formData,
        type: contentType,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-')
      })
      
      // 성공 메시지 표시
      alert('뉴스가 성공적으로 업데이트되었습니다!')
    }

    // 폼 초기화
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      imageUrl: '',
      originalUrl: '',
      slug: ''
    })
    setEditingItem(null)
    setActiveTab('list')
    loadData()
  }

  const handleEdit = (item: NewsItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description,
      date: item.date,
      imageUrl: item.imageUrl || '',
      originalUrl: item.originalUrl || '',
      slug: item.slug
    })
    setContentType(item.type)
    setActiveTab('edit')
  }

  const handleDelete = (id: string) => {
    console.log('Delete button clicked for id:', id)
    if (confirm('정말 삭제하시겠습니까?')) {
      console.log('User confirmed deletion')
      const result = deleteNewsItem(id)
      console.log('Delete result:', result)
      
      if (result) {
        loadData() // 로컬 상태 업데이트
        alert('삭제가 완료되었습니다!')
      } else {
        alert('삭제에 실패했습니다. 항목을 찾을 수 없습니다.')
      }
    }
  }

  // AI 썸네일 추천 함수
  const handleSuggestImages = async () => {
    if (!formData.title || !formData.description) {
      alert('제목과 내용을 먼저 입력해주세요.')
      return
    }

    setIsLoadingSuggestions(true)
    try {
      const response = await fetch('/api/suggest-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setSuggestedImages(data.images)
        setShowSuggestions(true)
        console.log('AI suggested images:', data.images)
        console.log('Extracted keywords:', data.keywords)
      } else {
        alert('이미지 추천에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error suggesting images:', error)
      alert('이미지 추천 중 오류가 발생했습니다.')
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  // 추천 이미지 선택 함수
  const handleSelectSuggestedImage = (imageUrl: string) => {
    setFormData({ ...formData, imageUrl })
    setShowSuggestions(false)
    alert('이미지가 선택되었습니다!')
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">콘텐츠 관리</h1>
            <a
              href="/"
              className="text-gray-500 hover:text-gray-900 text-sm"
            >
              ← 홈으로
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Content Type Selector */}
        <div className="mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setContentType('news')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                contentType === 'news'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              뉴스 ({allItems.filter(item => item.type === 'news').length})
            </button>
            <button
              onClick={() => setContentType('blog')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                contentType === 'blog'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              블로그 ({allItems.filter(item => item.type === 'blog').length})
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex gap-1">
            <button
              onClick={() => {
                setActiveTab('list')
                setEditingItem(null)
              }}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeTab === 'list'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              목록
            </button>
            <button
              onClick={() => {
                setActiveTab('add')
                setEditingItem(null)
                setFormData({
                  title: '',
                  description: '',
                  date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
                  imageUrl: '',
                  slug: ''
                })
              }}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeTab === 'add'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              새 글
            </button>
            {activeTab === 'edit' && (
              <button className="px-3 py-1 text-sm rounded bg-blue-600 text-white">
                수정 중
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'list' && (
          <div className="border border-gray-200 rounded">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                {contentType === 'news' ? '뉴스' : '블로그'} 목록 ({filteredItems.length}개)
              </h2>
            </div>
            <div>
              {filteredItems.map((item) => (
                <div key={item.id} className="p-4 border-b last:border-b-0 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      </div>

                      <p className="text-gray-700 mb-3 line-clamp-2">{item.description}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{item.date}</span>
                        <span>작성일: {item.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>등록된 {contentType === 'news' ? '뉴스' : '블로그'}가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {(activeTab === 'add' || activeTab === 'edit') && (
          <div className="border border-gray-200 rounded">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                {activeTab === 'add' 
                  ? `새 ${contentType === 'news' ? '뉴스' : '블로그'} 작성`
                  : `${contentType === 'news' ? '뉴스' : '블로그'} 수정`
                }
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-2">제목 *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  placeholder="제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">내용 *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  placeholder="내용을 입력하세요"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">날짜 *</label>
                <input
                  type="text"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  placeholder="2025.01.15"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-medium text-gray-700">이미지</label>
                  <button
                    type="button"
                    onClick={handleSuggestImages}
                    disabled={isLoadingSuggestions || !formData.title || !formData.description}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                  >
                    {isLoadingSuggestions ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        AI 분석 중...
                      </>
                    ) : (
                      <>
                        🤖 AI 썸네일 추천
                      </>
                    )}
                  </button>
                </div>
                
                <div className="space-y-3">
                  {/* AI 추천 이미지 갤러리 */}
                  {showSuggestions && suggestedImages.length > 0 && (
                    <div className="border border-purple-200 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-blue-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-800 flex items-center gap-2">
                          🎨 AI 추천 이미지
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowSuggestions(false)}
                          className="text-gray-400 hover:text-gray-600 text-xl"
                        >
                          ×
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {suggestedImages.map((image, index) => (
                          <div
                            key={image.id}
                            className="relative group cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all"
                            onClick={() => handleSelectSuggestedImage(image.url)}
                          >
                            <img
                              src={image.thumbnail}
                              alt={image.description}
                              className="w-full h-24 object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-white rounded-full p-2">
                                  <span className="text-lg">✓</span>
                                </div>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="truncate">{image.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        💡 클릭하여 이미지를 선택하세요. 모든 이미지는 Unsplash에서 제공되며 상업적 사용이 가능합니다.
                      </p>
                    </div>
                  )}
                
                  {/* 이미지 업로드 영역 */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setIsUploading(true)
                          try {
                            const formDataUpload = new FormData()
                            formDataUpload.append('file', file)
                            
                            const response = await fetch('/api/upload', {
                              method: 'POST',
                              body: formDataUpload
                            })
                            
                            const result = await response.json()
                            
                            if (result.success) {
                              setFormData({ ...formData, imageUrl: result.url })
                            } else {
                              alert(result.error || '이미지 업로드에 실패했습니다.')
                            }
                          } catch (error) {
                            console.error('업로드 에러:', error)
                            alert('이미지 업로드 중 오류가 발생했습니다.')
                          } finally {
                            setIsUploading(false)
                          }
                        }
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className={`cursor-pointer ${isUploading ? 'pointer-events-none' : ''}`}>
                      <div className="text-gray-500">
                        <div className="text-2xl mb-2">{isUploading ? '⏳' : '📷'}</div>
                        <p>{isUploading ? '업로드 중...' : '클릭하여 이미지 업로드'}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {isUploading ? '잠시만 기다려주세요' : 'JPG, PNG, GIF, WEBP 지원 (최대 5MB)'}
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  {/* 또는 URL 직접 입력 */}
                  <div className="text-center text-gray-500 text-sm">또는</div>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    placeholder="이미지 URL 직접 입력"
                  />
                  
                  {/* 이미지 미리보기 */}
                  {formData.imageUrl && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">미리보기:</p>
                      <div className="w-full h-40 bg-gray-100 rounded border flex items-center justify-center overflow-hidden">
                        <img 
                          src={formData.imageUrl} 
                          alt="미리보기" 
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const nextEl = e.currentTarget.nextElementSibling as HTMLElement
                            if (nextEl) nextEl.style.display = 'block'
                          }}
                        />
                        <div className="text-gray-400 text-sm hidden">이미지를 불러올 수 없습니다</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 원문 링크 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  원문 링크 (선택사항)
                </label>
                <input
                  type="url"
                  value={formData.originalUrl}
                  onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  placeholder="https://example.com/original-article"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">슬러그 (URL용)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  placeholder="자동 생성됩니다"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('list')
                    setEditingItem(null)
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
                >
                  {activeTab === 'add' ? '등록' : '수정'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
