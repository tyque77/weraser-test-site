"use client"

import { useState, useEffect } from "react"
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getLatestNews, getFeaturedNews, getNewsByType } from "@/lib/newsData"

export default function WeraserWebsite() {
  const [scrollY, setScrollY] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(true) // 즉시 true로 시작
  const [videoError, setVideoError] = useState(false)
  const [videoCanPlay, setVideoCanPlay] = useState(false)
  const [showFallback, setShowFallback] = useState(false) // 폴백 표시 제어
  const [mounted, setMounted] = useState(false) // Hydration 안전성
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0) // 서비스 슬라이더 인덱스
  const [progressWidth, setProgressWidth] = useState(0) // 로딩바 진행률
  const [backgroundTransition, setBackgroundTransition] = useState(0) // 배경 전환 진행률 (0-1)
  const [headerTransition, setHeaderTransition] = useState(0) // 헤더 전환 진행률 (0-1)
  const [ctaVideoLoaded, setCtaVideoLoaded] = useState(false) // CTA 비디오 로드 상태
  const [featuredNews, setFeaturedNews] = useState(getFeaturedNews())
  const [latestNews, setLatestNews] = useState(getNewsByType('news').slice(0, 3))

  // 모바일은 자연스러운 스크롤, 데스크톱만 fullpage
  useEffect(() => {
    let isScrolling = false
    let currentSection = 0
    
    const isMobile = () => typeof window !== "undefined" && window.innerWidth < 768
    
    const scrollToSection = (sectionIndex: number) => {
      if (isMobile()) return // 모바일에서는 fullpage 비활성화
      
      const totalSections = 3
      
      if (sectionIndex < 0 || sectionIndex >= totalSections || isScrolling) return
      
      isScrolling = true
      currentSection = sectionIndex
      
      let targetY = 0
      const vh = typeof window !== "undefined" ? window.innerHeight : 800
      
      // 데스크톱만 fullpage
      if (sectionIndex === 0) {
        targetY = 0 // 히어로
      } else if (sectionIndex === 1) {
        targetY = vh // 텍스트
      } else if (sectionIndex === 2) {
        targetY = vh * 2 // 카드영역 시작
      }
      
      if (typeof window !== "undefined") {
        window.scrollTo({
          top: targetY,
          behavior: 'smooth'
        })
      }
      
      setTimeout(() => {
        isScrolling = false
      }, 1000)
    }
    
    const handleWheel = (e: WheelEvent) => {
      if (typeof window === "undefined") return
      
      if (isMobile()) {
        return // 모바일에서는 자연스러운 스크롤
      }
      
      // 데스크톱 fullpage 로직
      const currentScrollY = window.scrollY
      const vh = window.innerHeight
      const textSectionEnd = vh * 2
      
      if (currentScrollY >= textSectionEnd - 50) {
        return // 자연스러운 스크롤 허용
      }
      
      if (isScrolling) {
        e.preventDefault()
        return
      }
      
      if (currentSection === 0 && e.deltaY > 0) {
        e.preventDefault()
        scrollToSection(1)
      } else if (currentSection === 1 && e.deltaY < 0) {
        e.preventDefault()
        scrollToSection(0)
      } else if (currentSection === 1 && e.deltaY > 0) {
        return
      }
    }
    
    const handleScroll = () => {
      if (typeof window === "undefined") return
      const currentScrollY = window.scrollY
      setScrollY(currentScrollY)
      
      // 배경 전환 계산 (What's New 섹션만 고려)
      const whatsNewElement = document.querySelector('[data-section="whats-new"]')
      
      if (whatsNewElement) {
        const whatsNewRect = whatsNewElement.getBoundingClientRect()
        const vh = window.innerHeight
        const whatsNewHeight = whatsNewRect.height
        const whatsNewTop = whatsNewRect.top
        
        // What's New 섹션이 화면에 30% 이상 보이는지 확인
        const visibleHeight = Math.max(0, Math.min(vh - whatsNewTop, whatsNewHeight))
        const visibilityPercentage = (visibleHeight / whatsNewHeight) * 100
        
        if (visibilityPercentage >= 30) {
          // 30% 이상 보이면 즉시 흰색 배경으로 전환
          setBackgroundTransition(1)
        } else if (visibilityPercentage > 20) {
          // 20~30% 사이에서 빠른 점진적 전환 (10% 구간)
          const progress = (visibilityPercentage - 20) / 10
          setBackgroundTransition(progress)
        } else {
          // 20% 미만이면 검은색 배경
          setBackgroundTransition(0)
        }
      } else {
        // fallback: 스크롤 위치 기반
        const vh = window.innerHeight
        const estimatedWhatsNewStart = vh * 3.5
        
        if (currentScrollY >= estimatedWhatsNewStart) {
          setBackgroundTransition(1)
        } else if (currentScrollY >= estimatedWhatsNewStart - vh * 0.1) {
          // 10% 구간에서 빠른 점진적 전환 (30% 지점 기준)
          const progress = (currentScrollY - (estimatedWhatsNewStart - vh * 0.1)) / (vh * 0.1)
          setBackgroundTransition(Math.min(Math.max(progress, 0), 1))
        } else {
          setBackgroundTransition(0)
        }
      }

      // 헤더 전환 계산 (What's New와 CTA 섹션 고려)
      const ctaElement = document.querySelector('[data-section="cta"]')
      
      if (whatsNewElement && ctaElement) {
        const whatsNewRect = whatsNewElement.getBoundingClientRect()
        const ctaRect = ctaElement.getBoundingClientRect()
        const vh = window.innerHeight
        
        // CTA 섹션이 화면에 보이는지 확인
        const ctaVisible = ctaRect.top < vh && ctaRect.bottom > 0
        
        if (ctaVisible) {
          // CTA 섹션이 보이면 검정색 헤더로 전환
          setHeaderTransition(0)
        } else {
          // What's New 섹션 처리
          const whatsNewHeight = whatsNewRect.height
          const whatsNewTop = whatsNewRect.top
          
          // What's New 섹션이 화면에 30% 이상 보이는지 확인
          const visibleHeight = Math.max(0, Math.min(vh - whatsNewTop, whatsNewHeight))
          const visibilityPercentage = (visibleHeight / whatsNewHeight) * 100
          
          if (visibilityPercentage >= 30) {
            // 30% 이상 보이면 즉시 흰색 헤더로 전환
            setHeaderTransition(1)
          } else if (visibilityPercentage > 20) {
            // 20~30% 사이에서 빠른 점진적 전환 (10% 구간)
            const progress = (visibilityPercentage - 20) / 10
            setHeaderTransition(progress)
          } else {
            // 20% 미만이면 검은색 헤더
            setHeaderTransition(0)
          }
        }
      } else {
        // fallback: 배경 전환과 동일하게 처리
        setHeaderTransition(backgroundTransition)
      }
      
      if (!isScrolling && !isMobile()) {
        const vh = window.innerHeight
        
        // 데스크톱 섹션 감지
        if (currentScrollY < vh * 0.5) {
          currentSection = 0 // 히어로
        } else if (currentScrollY < vh * 1.5) {
          currentSection = 1 // 텍스트
        } else {
          currentSection = 2 // 카드영역
        }
      }
    }
    
    if (typeof window !== "undefined") {
      window.addEventListener('wheel', handleWheel, { passive: false })
      window.addEventListener('scroll', handleScroll, { passive: true })
    }
    
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener('wheel', handleWheel)
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  // 뉴스 데이터 실시간 업데이트
  useEffect(() => {
    // localStorage 변경 감지
    const handleStorageChange = () => {
      console.log('Main page: Storage changed, reloading news data')
      const freshFeatured = getFeaturedNews()
      const freshLatest = getNewsByType('news').slice(0, 3)
      console.log('Main page: Fresh featured:', freshFeatured?.title)
      console.log('Main page: Fresh latest count:', freshLatest.length)
      setFeaturedNews(freshFeatured)
      setLatestNews([...freshLatest]) // 새 배열로 강제 업데이트
    }

    // 브라우저 탭 간 통신
    window.addEventListener('storage', handleStorageChange)
    
    // 같은 탭에서의 변경 감지 (500ms마다 체크)
    const interval = setInterval(() => {
      const lastUpdate = localStorage.getItem('newsUpdated')
      if (lastUpdate) {
        console.log('Main page: Detected update signal')
        handleStorageChange()
        localStorage.removeItem('newsUpdated')
      }
    }, 500)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // 섹션별 애니메이션 진행률 계산 (Hydration 안전)
  const heroProgress = mounted && typeof window !== "undefined" ? Math.min(scrollY / (window.innerHeight * 0.8), 1) : 0
  
  // 두 번째 섹션 애니메이션 (스냅 시 완전히 보이도록)
  const vh = mounted && typeof window !== "undefined" ? window.innerHeight : 800
  const secondSectionStart = vh * 0.8 // 첫 번째 섹션 80% 지점부터 시작
  const secondSectionEnd = vh * 1.0   // 두 번째 섹션 시작점에서 완료
  const secondSectionProgress = mounted ? Math.max(
    0,
    Math.min(
      (scrollY - secondSectionStart) / (secondSectionEnd - secondSectionStart),
      1
    )
  ) : 1 // 서버 렌더링 시에는 완전히 보이도록

  // 하단 텍스트 섹션 애니메이션 (카드 영역 이후)
  const bottomSectionStart = vh * 5.8 // 카드 영역 끝 근처부터 시작
  const bottomSectionEnd = vh * 6.0   // 하단 섹션 시작점에서 완료
  const bottomSectionProgress = mounted ? Math.max(
    0,
    Math.min(
      (scrollY - bottomSectionStart) / (bottomSectionEnd - bottomSectionStart),
      1
    )
  ) : 1

  // Ultra-aggressive preloading strategy
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    const initializeVideo = () => {
      const video = document.querySelector('video') as HTMLVideoElement
      if (video) {
        // 즉시 로딩 시작
        video.load()
        
        // 3초 후에도 로딩되지 않으면 폴백 표시
        timeoutId = setTimeout(() => {
          if (!videoCanPlay && !videoError) {
            console.log('Video loading timeout, showing fallback')
            setShowFallback(true)
            setVideoLoaded(false)
          }
        }, 3000)
        
        // 즉시 재생 시도 (메타데이터 없이도)
        const forcePlay = () => {
          video.play().catch(e => {
            console.log('Initial auto-play failed:', e)
          })
        }
        
        // 다양한 시점에서 재생 시도
        video.addEventListener('loadstart', forcePlay)
        video.addEventListener('loadedmetadata', forcePlay)
        video.addEventListener('canplay', () => {
          setVideoCanPlay(true)
          clearTimeout(timeoutId)
          forcePlay()
        })
        
        // 즉시 재생 시도
        setTimeout(forcePlay, 100)
        setTimeout(forcePlay, 500)
        
        // 모바일에서 사용자 인터랙션 후 비디오 재생 보장
        const enableVideoOnTouch = () => {
          const videos = document.querySelectorAll('video') as NodeListOf<HTMLVideoElement>
          videos.forEach(v => {
            if (v.paused) {
              v.play().catch(e => console.log('Touch-triggered play failed:', e))
            }
          })
        }
        
        // 터치/클릭 이벤트 리스너 추가
        document.addEventListener('touchstart', enableVideoOnTouch, { once: true })
        document.addEventListener('click', enableVideoOnTouch, { once: true })
        
        // 정기적으로 비디오 재생 상태 체크 (무한재생 보장)
        const checkVideoLoop = setInterval(() => {
          const videos = document.querySelectorAll('video') as NodeListOf<HTMLVideoElement>
          videos.forEach(video => {
            if (video.ended || video.paused) {
              console.log('Video stopped, restarting...')
              video.currentTime = 0
              video.play().catch(e => console.log('Periodic restart failed:', e))
            }
          })
        }, 2000) // 2초마다 체크
        
        return () => {
          clearTimeout(timeoutId)
          clearInterval(checkVideoLoop)
        }
      }
    }
    
    // 즉시 실행
    initializeVideo()
    
    // DOM이 완전히 로드된 후에도 한 번 더 시도
    const timer = setTimeout(initializeVideo, 100)
    
    return () => {
      clearTimeout(timer)
      clearTimeout(timeoutId)
    }
  }, [])

  // 마운트 상태 설정
  useEffect(() => {
    setMounted(true)
  }, [])

  // 서비스 데이터
  const services = [
    {
      id: 1,
      title: "AI 스캐닝",
      description: "AI 스캐닝은 선적 서류에서 텍스트를 추출하여 현재 ERP 시스템에 필요한 형식으로 변환합니다.",
      image: "/con_card01.jpg"
    },
    {
      id: 2,
      title: "데이터 관리",
      description: "AI 데이터 관리는 실시간 화물 추적 및 핵심 물류 지표 요약을 제공합니다.",
      image: "/con_card02.jpg"
    },
    {
      id: 3,
      title: "코어 챗",
      description: "AI 에이전트 & 코어챗은 다양한 물류 업무를 효율적으로 처리하는 전문 AI 에이전트를 배포합니다.",
      image: "/con_card03.jpg"
    },
    {
      id: 4,
      title: "코어 레코딩",
      description: "코어 레코딩 AI는 음성을 문서와 보고서로 변환합니다.",
      image: "/con_card04.jpg"
    },
    {
      id: 5,
      title: "AI 기반 HS 코드 분류",
      description: "Weraser의 AI 시스템은 98.5% 정확도로 HS 코드를 분류하고 법적 참조를 제공합니다.",
      image: "/Cont02_slide_01.jpg"
    },
    {
      id: 6,
      title: "전문 업무용 AI 에이전트",
      description: "WiseAgent AI 어시스턴트는 HS 코드, 위험물 및 규정 준수 검사를 처리합니다.",
      image: "/Cont02_slide_02.jpg"
    }
  ]

  // 서비스 슬라이더 함수
  const nextService = () => {
    setCurrentServiceIndex((prev) => (prev + 1) % services.length)
  }

  const prevService = () => {
    setCurrentServiceIndex((prev) => (prev - 1 + services.length) % services.length)
  }

  // 자동 슬라이드 기능 (5초마다)
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentServiceIndex((prev) => (prev + 1) % services.length)
    }, 5000)

    return () => {
      clearInterval(slideInterval)
    }
  }, [services.length])

  // 현재 슬라이드가 변경될 때마다 진행률 리셋 및 재시작
  useEffect(() => {
    let progressInterval: NodeJS.Timeout
    let startTime: number

    const startProgress = () => {
      setProgressWidth(0)
      startTime = Date.now()
      
      progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const progress = Math.min((elapsed / 5000) * 100, 100)
        setProgressWidth(progress)
        
        if (progress >= 100) {
          clearInterval(progressInterval)
        }
      }, 16)
    }

    // 슬라이드가 변경될 때마다 진행률 시작
    startProgress()

    return () => {
      clearInterval(progressInterval)
    }
  }, [currentServiceIndex]) // currentServiceIndex가 변경될 때마다 실행

  // 수동 슬라이드 변경
  const handleManualSlide = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setCurrentServiceIndex((prev) => (prev + 1) % services.length)
    } else {
      setCurrentServiceIndex((prev) => (prev - 1 + services.length) % services.length)
    }
  }
  
  // 화면 중앙에서 카드 fade 효과 (sticky 구조에 맞게) - 데스크톱 전용
  const getCardClass = (cardIndex: number) => {
    if (!mounted || typeof window === "undefined") return "card-visible"
    
    const vh = window.innerHeight
    const cardsStartY = vh * 2
    const scrollInCards = Math.max(0, scrollY - cardsStartY)
    
    // sticky 구조에서 각 카드가 화면 중앙에 오는 시점
    const cardCenterPoint = cardIndex * vh + (vh / 2) // 각 카드의 중앙 지점
    const currentViewCenter = scrollInCards + (vh / 2) // 현재 화면 중앙
    
    // 화면 중앙 기준으로 fade 범위 설정
    const fadeRange = vh * 0.4 // 화면 높이의 40% 범위에서 fade
    const distanceFromCenter = Math.abs(currentViewCenter - cardCenterPoint)
    
    console.log(`🎯 카드 ${cardIndex}: 중앙점=${cardCenterPoint}, 현재중앙=${currentViewCenter}, 거리=${distanceFromCenter.toFixed(0)}`)
    
    // 화면 중앙 근처에서만 보임
    return distanceFromCenter < fadeRange ? "card-visible" : "card-hidden"
  }

  return (
    <div 
      className="bg-black font-['Pretendard',sans-serif] overflow-x-hidden relative transition-colors duration-200"
      style={{
        color: `rgb(${255 - (255 * backgroundTransition)}, ${255 - (255 * backgroundTransition)}, ${255 - (255 * backgroundTransition)})`
      }}
    >
      
      {/* 배경 전환 오버레이 */}
      <div 
        className="fixed inset-0 pointer-events-none z-[1] transition-all duration-200 ease-out"
        style={{
          backgroundColor: `rgba(255, 255, 255, ${backgroundTransition})`,
        }}
      />
      {/* Fixed Header */}
      <header 
        className="fixed top-0 left-0 w-full z-50 backdrop-blur-md transition-all duration-300"
        style={{
          backgroundColor: headerTransition > 0.5 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.2)'
        }}
      >
        <div 
          className="w-full h-16 md:h-20 border-b transition-all duration-300" 
          style={{ 
            borderColor: headerTransition > 0.5 ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.15)" 
          }}
        >
          <div className="mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between" style={{ maxWidth: '1400px' }}>
                        {/* Logo */}
            <div className="flex-shrink-0">
              <Image
                src={headerTransition > 0.5 ? "/header_logo_scroll.svg" : "/header_logo.svg"}
                alt="Weraser Logo"
                width={109}
                height={19}
                className="w-24 md:w-[109px] h-auto transition-all duration-300"
              />
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center space-x-8 xl:space-x-10">
              <a
                href="#company"
                className="text-sm xl:text-base font-semibold tracking-[-0.03em] transition-all duration-300"
                style={{
                  color: headerTransition > 0.5 ? '#000000' : '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = headerTransition > 0.5 ? '#666666' : '#cccccc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = headerTransition > 0.5 ? '#000000' : '#ffffff';
                }}
              >
                Company
              </a>
              <a
                href="#service"
                className="text-sm xl:text-base font-semibold tracking-[-0.03em] transition-all duration-300"
                style={{
                  color: headerTransition > 0.5 ? '#000000' : '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = headerTransition > 0.5 ? '#666666' : '#cccccc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = headerTransition > 0.5 ? '#000000' : '#ffffff';
                }}
              >
                Service
              </a>
              <a
                href="#ai-agents"
                className="text-sm xl:text-base font-semibold tracking-[-0.03em] transition-all duration-300"
                style={{
                  color: headerTransition > 0.5 ? '#000000' : '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = headerTransition > 0.5 ? '#666666' : '#cccccc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = headerTransition > 0.5 ? '#000000' : '#ffffff';
                }}
              >
                AI agents
              </a>
              <Link
                href="/news"
                className="text-sm xl:text-base font-semibold tracking-[-0.03em] transition-all duration-300"
                style={{
                  color: headerTransition > 0.5 ? '#000000' : '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = headerTransition > 0.5 ? '#666666' : '#cccccc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = headerTransition > 0.5 ? '#000000' : '#ffffff';
                }}
              >
                News
              </Link>
              <a
                href="#blog"
                className="text-sm xl:text-base font-semibold tracking-[-0.03em] transition-all duration-300"
                style={{
                  color: headerTransition > 0.5 ? '#000000' : '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = headerTransition > 0.5 ? '#666666' : '#cccccc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = headerTransition > 0.5 ? '#000000' : '#ffffff';
                }}
              >
                Blog
              </a>
              <a
                href="#contact"
                className="text-sm xl:text-base font-semibold tracking-[-0.03em] transition-all duration-300"
                style={{
                  color: headerTransition > 0.5 ? '#000000' : '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = headerTransition > 0.5 ? '#666666' : '#cccccc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = headerTransition > 0.5 ? '#000000' : '#ffffff';
                }}
              >
                Contact
              </a>
              <a
                href="#lab"
                className="text-sm xl:text-base font-semibold tracking-[-0.03em] transition-all duration-300"
                style={{
                  color: headerTransition > 0.5 ? '#000000' : '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = headerTransition > 0.5 ? '#666666' : '#cccccc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = headerTransition > 0.5 ? '#000000' : '#ffffff';
                }}
              >
                Weraser Lab
              </a>
            </nav>

            {/* Right side items */}
            <div className="flex items-center space-x-4">
            {/* Language Toggle */}
              <div 
                className="hidden md:flex w-16 lg:w-20 h-8 lg:h-10 rounded-full items-center justify-center gap-2 transition-all duration-300"
                style={{
                  border: `1px solid ${headerTransition > 0.5 ? '#000000' : '#ffffff'}`
                }}
              >
                <Image
                  src={headerTransition > 0.5 ? "/globe_scroll.svg" : "/globe.svg"}
                  alt="Globe Icon"
                  width={16}
                  height={16}
                  className="w-3 lg:w-4 h-3 lg:h-4 transition-all duration-300"
                />
                <span 
                  className="text-sm lg:text-base font-semibold transition-all duration-300"
                  style={{
                    color: headerTransition > 0.5 ? '#000000' : '#ffffff'
                  }}
                >EN</span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 transition-all duration-300"
              style={{
                color: headerTransition > 0.5 ? '#000000' : '#ffffff'
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div 
              className="lg:hidden border-t transition-all duration-300"
              style={{
                backgroundColor: headerTransition > 0.5 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.95)',
                borderColor: headerTransition > 0.5 ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.15)"
              }}
            >
              <nav className="flex flex-col py-4">
                <a 
                  href="#company" 
                  className="px-6 py-3 font-semibold transition-all duration-300"
                  style={{
                    color: headerTransition > 0.5 ? '#000000' : '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = headerTransition > 0.5 ? '#666666' : '#cccccc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = headerTransition > 0.5 ? '#000000' : '#ffffff';
                  }}
                >
                  Company
                </a>
                <a 
                  href="#service" 
                  className="px-6 py-3 font-semibold transition-all duration-300"
                  style={{
                    color: headerTransition > 0.5 ? '#000000' : '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = headerTransition > 0.5 ? '#666666' : '#cccccc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = headerTransition > 0.5 ? '#000000' : '#ffffff';
                  }}
                >
                  Service
                </a>
                <a
                  href="#ai-agents"
                  className="px-6 py-3 font-semibold transition-all duration-300"
                  style={{
                    color: headerTransition > 0.5 ? '#000000' : '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = headerTransition > 0.5 ? '#666666' : '#cccccc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = headerTransition > 0.5 ? '#000000' : '#ffffff';
                  }}
                >
                  AI agents
                </a>
                <Link 
                  href="/news" 
                  className="px-6 py-3 font-semibold transition-all duration-300"
                  style={{
                    color: headerTransition > 0.5 ? '#000000' : '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = headerTransition > 0.5 ? '#666666' : '#cccccc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = headerTransition > 0.5 ? '#000000' : '#ffffff';
                  }}
                >
                  News
                </Link>
                <a 
                  href="#blog" 
                  className="px-6 py-3 font-semibold transition-all duration-300"
                  style={{
                    color: headerTransition > 0.5 ? '#000000' : '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = headerTransition > 0.5 ? '#666666' : '#cccccc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = headerTransition > 0.5 ? '#000000' : '#ffffff';
                  }}
                >
                  Blog
                </a>
                <a 
                  href="#contact" 
                  className="px-6 py-3 font-semibold transition-all duration-300"
                  style={{
                    color: headerTransition > 0.5 ? '#000000' : '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = headerTransition > 0.5 ? '#666666' : '#cccccc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = headerTransition > 0.5 ? '#000000' : '#ffffff';
                  }}
                >
                  Contact
                </a>
                <a 
                  href="#lab" 
                  className="px-6 py-3 font-semibold transition-all duration-300"
                  style={{
                    color: headerTransition > 0.5 ? '#000000' : '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = headerTransition > 0.5 ? '#666666' : '#cccccc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = headerTransition > 0.5 ? '#000000' : '#ffffff';
                  }}
                >
                  Weraser Lab
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>



      {/* Section 1: Hero Visual */}
      <section className="w-full h-screen relative overflow-hidden" style={{
        background: 'linear-gradient(180deg, #000000 0%, #000000 70%, #020202 100%)'
      }}>
        {/* Background Video */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* 모바일 전용 비디오 컨테이너 */}
          <div className="md:hidden absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center pt-16">
            <video
              className={`w-full h-full object-cover object-center transition-all duration-500 ease-out ${
                videoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                transform: `translateY(${scrollY * 0.3}px) scale(${1 + heroProgress * 0.1})`,
                transformOrigin: 'center center',
                minWidth: '100%',
                minHeight: '100%',
                filter: 'contrast(1.25) saturate(1.3) brightness(1.18) sharpness(1.2)',
                aspectRatio: '16/20', // 모바일에서 16:20 비율 (4:5, 세로가 더 긴 비율)
              }}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              controls={false}
              disablePictureInPicture
              webkit-playsinline="true"
              crossOrigin="anonymous"
              poster=""
              onLoadStart={() => {
                console.log('Mobile Video loading started')
                setVideoLoaded(true)
              }}
              onLoadedMetadata={() => {
                console.log('Mobile Video metadata loaded - READY!')
                setVideoLoaded(true)
                setVideoError(false)
                setShowFallback(false)
              }}
              onLoadedData={() => {
                console.log('Mobile Video data loaded - PLAYING!')
                setVideoLoaded(true)
                setVideoError(false)
                setShowFallback(false)
              }}
              onCanPlay={() => {
                console.log('Mobile Video can play')
                setVideoCanPlay(true)
                // 모바일에서 강제 재생 시도
                const video = document.querySelector('video') as HTMLVideoElement
                if (video && video.paused) {
                  video.play().catch(e => console.log('Mobile autoplay prevented:', e))
                }
              }}
              onEnded={() => {
                console.log('Mobile Video ended - restarting loop')
                // 무한재생을 위해 비디오가 끝나면 다시 재생
                const video = document.querySelector('.md\\:hidden video') as HTMLVideoElement
                if (video) {
                  video.currentTime = 0
                  video.play().then(() => {
                    console.log('Mobile video loop restarted successfully')
                  }).catch(e => {
                    console.log('Mobile loop restart failed:', e)
                    // 재생 실패 시 다시 시도
                    setTimeout(() => {
                      video.currentTime = 0
                      video.play().catch(e2 => console.log('Mobile retry failed:', e2))
                    }, 100)
                  })
                }
              }}
              onPause={() => {
                console.log('Mobile Video paused - attempting to resume')
                // 의도하지 않은 일시정지 시 다시 재생 시도
                setTimeout(() => {
                  const video = document.querySelector('video') as HTMLVideoElement
                  if (video && video.paused) {
                    video.play().catch(e => console.log('Mobile resume failed:', e))
                  }
                }, 100)
              }}
              onError={(e) => {
                console.error('Mobile Video error:', e)
                setVideoError(true)
                setVideoLoaded(false)
                setShowFallback(true)
              }}
            >
              <source src="/visual.mp4" type="video/mp4" />
            </video>
          </div>

          {/* 데스크톱 전용 비디오 컨테이너 */}
          <div className="hidden md:block absolute inset-0 w-full h-full flex items-center justify-center">
          <video
            className={`w-full h-full object-cover object-center transition-all duration-500 ease-out ${
              videoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: `translateY(${scrollY * 0.3}px) scale(${1 + heroProgress * 0.1})`,
              transformOrigin: 'center center',
              minWidth: '100%',
              minHeight: '100%',
              filter: 'contrast(1.25) saturate(1.3) brightness(1.18) sharpness(1.2)',
            }}

            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            controls={false}
            disablePictureInPicture
            webkit-playsinline="true"
            crossOrigin="anonymous"
            poster=""
            onLoadStart={() => {
              console.log('Video loading started')
              // 로딩 시작 시에도 동영상 표시 유지
            }}
            onLoadedMetadata={() => {
              console.log('Video metadata loaded - READY!')
              setVideoLoaded(true)
              setVideoError(false)
              setShowFallback(false)
            }}
            onLoadedData={() => {
              console.log('Video data loaded - PLAYING!')
              setVideoLoaded(true)
              setVideoError(false)
              setShowFallback(false)
            }}
            onCanPlay={() => {
              console.log('Video can play - INSTANT!')
              setVideoCanPlay(true)
              setVideoLoaded(true)
              setShowFallback(false)
            }}
            onCanPlayThrough={() => {
              console.log('Video can play through - PERFECT!')
              setVideoLoaded(true)
              setShowFallback(false)
            }}
            onPlaying={() => {
              console.log('Video is playing - SUCCESS!')
              setVideoLoaded(true)
              setShowFallback(false)
            }}
            onProgress={() => {
              const video = document.querySelector('video') as HTMLVideoElement
              if (video && video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1)
                const duration = video.duration
                if (bufferedEnd / duration > 0.05) { // 5% 버퍼링되면 즉시 표시
                  setVideoLoaded(true)
                  setShowFallback(false)
                }
              }
            }}
            onEnded={() => {
              console.log('Desktop Video ended - restarting loop')
              // 무한재생을 위해 비디오가 끝나면 다시 재생
              const video = document.querySelector('.md\\:block video') as HTMLVideoElement
              if (video) {
                video.currentTime = 0
                video.play().then(() => {
                  console.log('Desktop video loop restarted successfully')
                }).catch(e => {
                  console.log('Desktop loop restart failed:', e)
                  // 재생 실패 시 다시 시도
                  setTimeout(() => {
                    video.currentTime = 0
                    video.play().catch(e2 => console.log('Desktop retry failed:', e2))
                  }, 100)
                })
              }
            }}
            onError={(e) => {
              console.error('Video loading error:', e)
              setVideoError(true)
              setShowFallback(true)
            }}
          >
            <source src="/visual.mp4" type="video/mp4" />
            {/* Fallback for browsers that don't support video */}
            Your browser does not support the video tag.
          </video>
          </div>

          {/* Fallback background - only show when explicitly needed */}
          {showFallback || videoError ? (
            <>
              <div
                className="absolute top-4 md:top-[27px] left-1/2 transform -translate-x-1/2 w-[90%] md:w-[1249px] h-[60vh] md:h-[971px] bg-gray-600 opacity-70 transition-transform duration-75 ease-out"
                style={{
                  transform: `translateX(-50%) translateY(${scrollY * 0.3}px) scale(${1 + heroProgress * 0.1})`,
            }}
          ></div>
          <div
                className="absolute top-5 md:top-[28px] left-1/2 transform -translate-x-1/2 w-[95%] md:w-[1296px] h-[65vh] md:h-[1008px] bg-gray-700 transition-transform duration-75 ease-out"
            style={{
                  transform: `translateX(-50%) translateY(${scrollY * 0.5}px) scale(${1 + heroProgress * 0.05})`,
            }}
          ></div>
            </>
          ) : null}

          {/* Dark Overlay - 제거하여 동영상 본래 밝기 유지 */}
          {/* <div className="absolute inset-0 bg-[#101010] opacity-10"></div> */}
        </div>

        <div className="absolute inset-0 flex items-center justify-center px-4 z-10 pt-16 md:pt-0">
        <div
            className="text-center transition-all duration-75 ease-out w-full max-w-6xl mx-auto"
          style={{
            transform: `translateY(${scrollY * -0.8}px)`,
            opacity: 1 - heroProgress * 1.2,
          }}
        >
            <h1 className="text-4xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[70px] font-semibold leading-tight text-white font-['Pretendard'] mx-auto text-center">
              AI 에이전트의
              <br className="block sm:hidden" />
              <span className="sm:inline"> </span>미래를 설계하다
          </h1>
            

          </div>
        </div>
      </section>

      {/* Section 2: Description Text */}
      <section className="w-full h-screen flex items-center justify-center relative px-4" style={{
        background: 'linear-gradient(180deg, #020202 0%, #0f0f0f 50%, #020202 100%)'
      }}>

        
        <div className="max-w-5xl mx-auto transition-all duration-300 ease-out">
          {/* 모바일용 텍스트 (자연스러운 표시) */}
          <div className="block md:hidden">
            <p className="text-[26px] font-semibold leading-relaxed text-white text-center tracking-[-0.01em] font-['Pretendard']">
              최첨단 AI 기술과 도메인 전문성이 만나 복잡한 전문 업무의
              <br />
              <span style={{color: '#5C57DD'}}>자동화 서비스를 제공</span>합니다.
            </p>
          </div>

          {/* 데스크톱용 텍스트 (애니메이션 적용) */}
          <div 
            className="hidden md:block"
          style={{
            transform: `translateY(${(1 - secondSectionProgress) * 200}px) scale(${0.8 + secondSectionProgress * 0.2})`,
            opacity: Math.pow(secondSectionProgress, 0.7),
            filter: `blur(${(1 - secondSectionProgress) * 8}px)`,
          }}
        >
            <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[48px] font-semibold leading-relaxed text-white text-center tracking-[-0.01em] font-['Pretendard']">
              최첨단 AI 기술과 도메인 전문성이 만나 복잡한 전문 업무의 <span style={{color: '#5C57DD'}}>자동화 서비스를 제공</span>합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Cards Area - Mobile Grid + Desktop Sticky */}
      <section className="relative bg-[#020202] px-4" data-section="cards">
        {/* 모바일용 카드 */}
        <div className="block md:hidden py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 gap-6">
              {/* Card 1 - OpenAI Partnership */}
              <div className="w-full h-[200px] relative rounded-lg overflow-hidden">
                <img 
                  src="/con_card01.jpg" 
                  alt="OpenAI Partnership"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <h2 className="text-xl font-semibold leading-tight text-white text-center tracking-[-0.01em] font-['Pretendard'] px-4 drop-shadow-2xl">
                    OpenAI
                    <br />
                    공식 협업 파트너
                  </h2>
                </div>
              </div>

              {/* Card 2 - NVIDIA Inception */}
              <div className="w-full h-[200px] relative rounded-lg overflow-hidden">
                <img 
                  src="/con_card02.jpg" 
                  alt="NVIDIA Inception"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <h2 className="text-xl font-semibold leading-tight text-white text-center tracking-[-0.01em] font-['Pretendard'] px-4 drop-shadow-2xl">
                    NVIDIA
                    <br />
                    Inception 프로그램
                  </h2>
                </div>
              </div>

              {/* Card 3 - Core Innovation Award */}
              <div className="w-full h-[200px] relative rounded-lg overflow-hidden">
                <img 
                  src="/con_card03.jpg" 
                  alt="Core Innovation Award"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <h2 className="text-xl font-semibold leading-tight text-white text-center tracking-[-0.01em] font-['Pretendard'] px-4 drop-shadow-2xl">
                    코어이노베이션
                    <br />
                    어워즈 최우수상
                  </h2>
                </div>
              </div>

              {/* Card 4 - TIPS Program */}
              <div className="w-full h-[200px] relative rounded-lg overflow-hidden">
                <img 
                  src="/con_card04.jpg" 
                  alt="TIPS Program"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <h2 className="text-xl font-semibold leading-tight text-white text-center tracking-[-0.01em] font-['Pretendard'] px-4 drop-shadow-2xl">
                    중소벤처기업부
                    <br />
                    TIPS 프로그램 선정
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 데스크톱용 기존 sticky 효과 */}
        <div className="hidden md:block md:h-[400vh] relative card-container">
          {/* Card 1 - OpenAI Partnership */}
          <div className="sticky top-0 h-screen flex items-center justify-center z-10">
            <div
              className={`w-full max-w-7xl h-[80vh] lg:h-[800px] relative rounded-lg overflow-hidden ${getCardClass(0)}`}
            >
              {/* Background Image */}
              <img 
                src="/con_card01.jpg" 
                alt="OpenAI Partnership"
                className="absolute inset-0 w-full h-full object-cover"
                onLoad={() => console.log('✅ con_card01.jpg 로드 성공')}
                onError={(e) => {
                  console.error('❌ con_card01.jpg 로드 실패:', e);
                  e.currentTarget.style.backgroundColor = '#ff0000';
                }}
                style={{ backgroundColor: '#333' }}
              />
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <h2 className="text-2xl md:text-3xl lg:text-[34px] font-semibold leading-tight md:leading-[48px] text-white text-center tracking-[-0.01em] font-['Pretendard'] px-4 drop-shadow-2xl">
                  OpenAI
                  <br />
                  공식 협업 파트너
                </h2>
              </div>
            </div>
          </div>

          {/* Card 2 - NVIDIA Inception */}
          <div className="sticky top-0 h-screen flex items-center justify-center z-20">
            <div
              className={`w-full max-w-7xl h-[80vh] lg:h-[800px] relative rounded-lg overflow-hidden ${getCardClass(1)}`}
            >
              {/* Background Image */}
              <img 
                src="/con_card02.jpg" 
                alt="NVIDIA Inception"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <h2 className="text-2xl md:text-3xl lg:text-[32px] font-semibold leading-tight md:leading-[48px] text-white text-center tracking-[-0.01em] font-['Pretendard'] px-4 drop-shadow-2xl">
                  NVIDIA
                  <br />
                  Inception 프로그램
                </h2>
              </div>
            </div>
          </div>

          {/* Card 3 - Core Innovation Award */}
          <div className="sticky top-0 h-screen flex items-center justify-center z-30">
            <div
              className={`w-full max-w-7xl h-[80vh] lg:h-[800px] relative rounded-lg overflow-hidden ${getCardClass(2)}`}
            >
              {/* Background Image */}
              <img 
                src="/con_card03.jpg" 
                alt="Core Innovation Award"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <h2 className="text-2xl md:text-3xl lg:text-[32px] font-semibold leading-tight md:leading-[48px] text-white text-center tracking-[-0.01em] font-['Pretendard'] px-4 drop-shadow-2xl">
                  코어이노베이션
                  <br />
                  어워즈 최우수상
                </h2>
              </div>
            </div>
          </div>

          {/* Card 4 - TIPS Program */}
          <div className="sticky top-0 h-screen flex items-center justify-center z-40">
            <div
              className={`w-full max-w-7xl h-[80vh] lg:h-[800px] relative rounded-lg overflow-hidden ${getCardClass(3)}`}
            >
              {/* Background Image */}
              <img 
                src="/con_card04.jpg" 
                alt="TIPS Program"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <h2 className="text-2xl md:text-3xl lg:text-[32px] font-semibold leading-tight md:leading-[48px] text-white text-center tracking-[-0.01em] font-['Pretendard'] px-4 drop-shadow-2xl">
                  TIPS
                  <br />
                  프로그램 선정
                </h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Bottom Text Area - Mobile + Desktop */}
      <section className="w-full h-screen flex items-center justify-center relative px-4" style={{
        background: 'linear-gradient(180deg, #020202 0%, #0f0f0f 50%, #020202 100%)'
      }}>
        <div className="max-w-5xl mx-auto transition-all duration-300 ease-out">
          {/* 모바일용 텍스트 (자연스러운 표시) */}
          <div className="block md:hidden">
            <p className="text-[26px] font-semibold leading-relaxed text-white text-center tracking-[-0.01em] font-['Pretendard']">
              검증된 AI 에이전트와 현장 중심의 전문 지식을 결합해 업무 효율성을
              <br />
              <span style={{color: '#5C57DD'}}>극대화하는 AI 서비스를 구축</span>합니다.
            </p>
          </div>

          {/* 데스크톱용 텍스트 (애니메이션 적용) */}
          <div 
            className="hidden md:block"
            style={{
              transform: `translateY(${(1 - bottomSectionProgress) * 200}px) scale(${0.8 + bottomSectionProgress * 0.2})`,
              opacity: Math.pow(bottomSectionProgress, 0.7),
              filter: `blur(${(1 - bottomSectionProgress) * 8}px)`,
            }}
          >
            <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[52px] font-semibold leading-tight md:leading-relaxed lg:leading-[78px] text-white text-center tracking-[-0.01em] font-['Pretendard']">
              검증된 AI 에이전트와
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>현장 중심의 전문 지식을 결합해 업무 효율성을
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span><span style={{color: '#5C57DD'}}>극대화하는 AI 서비스를 구축</span>합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Service Section - With Background */}
      <section className="w-full min-h-screen bg-[#020202] text-white relative overflow-hidden">
        {/* Background Energy Flow Image - 1320x835px */}
        <div className="absolute inset-0 z-0">
          {/* 실제 이미지 배경 - Our Service 제목 하단 위치 */}
                    <div
            className="absolute top-32 left-0 w-full h-[835px] bg-cover bg-left-bottom bg-no-repeat opacity-60"
            style={{
              backgroundImage: "url('/service-background.png')",
              backgroundSize: 'auto 100%', // 높이에 맞춰 크기 조정
              transform: 'translateX(-10%) translateY(0%)', // 덜 이동
            }}
          ></div>
          
          {/* 컨텐츠와 블렌딩을 위한 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020202]/30 via-transparent to-[#020202]/10"></div>
        </div>

        <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24" style={{ maxWidth: '1400px' }}>
          
          {/* Our Service Section */}
          <div className="mb-16 md:mb-24 lg:mb-32">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[52px] font-bold leading-tight lg:leading-[78px] tracking-[-0.01em] font-['Pretendard']">
                Our Service
              </h2>
              <button className="w-8 h-8 flex items-center justify-center hover:opacity-70 transition-all">
                <Image
                  src="/plus_button.svg"
                  alt="더보기"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
              </button>
            </div>
            
            {/* Service Content Area */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Image Container */}
              <div className="w-full lg:w-1/2 h-64 md:h-80 lg:h-96 bg-[#18191B] rounded border border-[#2D2D31] flex items-center justify-center overflow-hidden relative">
                <Image
                  src={services[currentServiceIndex].image}
                  alt={services[currentServiceIndex].title}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover transition-all duration-500 ease-in-out"
                  onError={(e) => {
                    // 이미지 로드 실패 시 폴백
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.image-fallback');
                    if (fallback) {
                      (fallback as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <div className="image-fallback absolute inset-0 flex items-center justify-center text-gray-500 text-sm md:text-lg" style={{ display: 'none' }}>
                  {services[currentServiceIndex].title} Image
                </div>
              </div>
              
              {/* Service Description */}
              <div className="flex-1 lg:pt-16">
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-[-0.01em] mb-6 lg:mb-8 font-['Pretendard'] transition-all duration-500 ease-in-out">
                  {services[currentServiceIndex].title}
                </h3>
                <div className="min-h-[140px] lg:min-h-[120px] flex items-start">
                  <p className="text-sm sm:text-base lg:text-lg leading-relaxed tracking-[-0.01em] opacity-50 font-['Pretendard'] transition-all duration-500 ease-in-out">
                    {services[currentServiceIndex].description}
                  </p>
                </div>
                
                {/* Pagination - Fixed Position */}
                <div className="flex items-center justify-between">
                  {/* Navigation Controls */}
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleManualSlide('prev')}
                      className="w-10 h-10 lg:w-12 lg:h-12 border border-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all"
                    >
                      <ChevronLeft size={16} className="lg:w-5 lg:h-5" />
                    </button>
                    
                    {/* Progress Bar between buttons */}
                    <div className="w-20 lg:w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#5C57DD] rounded-full"
                        style={{ 
                          width: `${progressWidth}%`,
                          transition: 'width 0.05s linear'
                        }}
                      ></div>
                    </div>
                    
                    <button 
                      onClick={() => handleManualSlide('next')}
                      className="w-10 h-10 lg:w-12 lg:h-12 border border-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all"
                    >
                      <ChevronRight size={16} className="lg:w-5 lg:h-5" />
                    </button>
                  </div>
                  
                  {/* Page Counter */}
                  <div className="flex items-center gap-2 ml-6">
                    <span className="text-sm lg:text-lg font-normal">
                      {String(currentServiceIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm lg:text-lg opacity-50">
                      / {String(services.length).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wise Series Section */}
          <div className="mt-8 md:mt-16 lg:mt-[200px]" data-section="wise-series">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[52px] font-bold leading-tight lg:leading-[78px] tracking-[-0.01em] font-['Pretendard']">
                Wise Series
              </h2>
              <button className="w-8 h-8 flex items-center justify-center hover:opacity-70 transition-all">
                <Image
                  src="/plus_button.svg"
                  alt="더보기"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-4 lg:gap-4">
              {[
                {
                  title: "WiseConvey",
                  subtitle: "AI 물류 관리 플랫폼",
                  description: "150개국 통관과 60개 AI 에이전트로 국제물류 60%를 자동화하는 글로벌 물류 혁신 플랫폼",
                  icon: "/Series_01.svg",
                  label: "물류·운송"
                },
                {
                  title: "WiseDocs",
                  subtitle: "AI 의료 문서 관리",
                  description: "국제 의료 표준 지원으로 환자 안전과 의료진 효율성을 동시에 향상시키는 AI 문서 관리 시스템",
                  icon: "/Series_02.svg",
                  label: "의료·헬스케어"
                },
                {
                  title: "WiseSpec",
                  subtitle: "AI 특허 관리 시스템",
                  description: "검색 범위 10배 확대·처리 시간 90% 단축하는 특허 전문가 업무 지원 AI Agent",
                  icon: "/Series_03.svg",
                  label: "지적재산·특허"
                },
                {
                  title: "WiseTariff",
                  subtitle: "AI 관세 최적화",
                  description: "FTA 활용·품목 분류 최적화로 평균 30% 관세 절감·연 1.2억원 이상 환급 발굴하는 AI 시스템",
                  icon: "/Series_04.svg",
                  label: "관세관리"
                },
                {
                  title: "WiseMeeting",
                  subtitle: "AI 회의 도우미",
                  description: "회의 효율성 3배 향상·100% 후속조치 보장하는 실시간 인사이트 제공 AI 회의 도우미",
                  icon: "/Series_05.svg",
                  label: "회의관리"
                },
                {
                  title: "WiseChat",
                  subtitle: "AI 대화형 플렛폼",
                  description: "5년 전 프로젝트까지 즉시 검색 가능한 조직 지식 통합 관리 대화형 AI 플랫폼",
                  icon: "/Series_06.svg",
                  label: "기업 커뮤니케이션"
                },
                {
                  title: "WiseRecruit",
                  subtitle: "AI 채용 시스템",
                  description: "채용 성공률 2배 향상·이직률 50% 감소시키는 성공 패턴 분석 기반 AI 채용 시스템",
                  icon: "/Series_07.svg",
                  label: "인재채용"
                },
                {
                  title: "WiseLawyer",
                  subtitle: "AI 법률 전문가 시스템",
                  description: "50만 판례 학습으로 95% 정확도를 자랑하는 개인회생/파산 전문 AI 법률 상담 플랫폼",
                  icon: "/Series_08.svg",
                  label: "법률·법무"
                }
              ].map((product, index) => (
                <div
                  key={index}
                  className="w-full h-auto min-h-[280px] md:min-h-[320px] lg:min-h-[380px] bg-[rgba(24,24,26,0.9)] border border-[#2D2D31] backdrop-blur-[20px] px-10 py-15 relative transition-all duration-300 cursor-pointer"
                  style={{
                    borderRadius: '4px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(39, 39, 41, 0.9)';
                    e.currentTarget.style.border = '1px solid #5C57DD';
                    e.currentTarget.style.boxShadow = '0px 8px 40px rgba(92, 87, 221, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    // 아이콘 배경 제거 - hover 시에도 배경 없음
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(24,24,26,0.9)';
                    e.currentTarget.style.border = '1px solid #2D2D31';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0px)';
                    // 아이콘 배경 제거 - leave 시에도 배경 없음
                  }}
                >
                  {/* Icon Container */}
                  <div className="w-12 h-12 lg:w-[60px] lg:h-[60px] flex items-center justify-center" style={{ marginBottom: '28px' }}>
                    <img 
                      src={product.icon} 
                      alt={product.title}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Tag Container */}
                  <div className="inline-flex items-center px-2 lg:px-[10px] bg-[#373740] rounded mb-4 lg:mb-[22px]" style={{ paddingBlock: 'calc(var(--spacing) * 2)' }}>
                    <span className="text-xs lg:text-sm text-white/80 font-['Pretendard']">
                      {product.label}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg sm:text-xl lg:text-[24px] font-bold leading-tight lg:leading-[34px] tracking-[-0.01em] font-['Pretendard']" style={{ marginBottom: '12px' }}>
                    {product.title}
                  </h3>
                  
                  <p className="text-sm sm:text-base lg:text-[18px] leading-relaxed lg:leading-[28px] tracking-[-0.01em] font-['Pretendard']" style={{ marginBottom: '4px' }}>
                    {product.subtitle}
                  </p>
                  
                  <p className="text-xs sm:text-sm lg:text-[18px] leading-relaxed lg:leading-[28px] tracking-[-0.01em] opacity-50 font-['Pretendard']">
                    {product.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What's New Section */}
      <section className="w-full pt-[200px] pb-16 lg:pb-20 relative z-10" data-section="whats-new">
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1400px' }}>
                  <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl lg:text-[52px] font-bold tracking-[-0.01em] font-['Pretendard']">
            What's New
          </h2>
          <Link 
            href="/news" 
            className="w-8 h-8 flex items-center justify-center hover:opacity-70 transition-all"
          >
            <Image
              src="/plus_button_black.svg"
              alt="더보기"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </Link>
        </div>
          
          <div className="lg:grid lg:grid-cols-[460px_820px] lg:gap-[120px] relative">
            {/* Vertical Divider - Desktop Only */}
            <div className="hidden lg:block absolute left-[520px] top-0 w-px h-[504px] bg-gray-200"></div>
            
            {/* Featured News */}
            <div className="w-full">
              <div className="w-full h-48 lg:h-[300px] bg-gray-400 rounded mb-6 lg:mb-10 overflow-hidden">
                {featuredNews?.imageUrl ? (
                  <img 
                    src={featuredNews.imageUrl} 
                    alt={featuredNews.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling!.style.display = 'block'
                    }}
                  />
                ) : null}
                <div className="w-full h-full bg-gray-400 rounded flex items-center justify-center" style={{ display: featuredNews?.imageUrl ? 'none' : 'block' }}>
                  <span className="text-white text-sm">Featured Image</span>
                </div>
              </div>
              {featuredNews ? (
                <>
                  <h3 className="text-xl lg:text-2xl font-semibold text-black tracking-[-0.01em] mb-2 font-['Pretendard']" style={{ lineHeight: '34px' }}>
                    {featuredNews.title}
                    {featuredNews.subtitle && (
                      <>
                        <br className="hidden lg:block" />
                        {featuredNews.subtitle}
                      </>
                    )}
                  </h3>
                  <p className="text-base lg:text-lg text-gray-600 leading-relaxed tracking-[-0.01em] mb-5 font-['Pretendard']">
                    {featuredNews.description}
                  </p>
                  <span className="text-sm lg:text-base text-gray-500 font-['Pretendard']">
                    {featuredNews.date}
                  </span>
                </>
              ) : (
                <>
                  <h3 className="text-xl lg:text-2xl font-semibold text-black tracking-[-0.01em] mb-2 font-['Pretendard']" style={{ lineHeight: '34px' }}>
                    최신 소식을 준비중입니다
                  </h3>
                  <p className="text-base lg:text-lg text-gray-600 leading-relaxed tracking-[-0.01em] mb-5 font-['Pretendard']">
                    곧 새로운 소식으로 찾아뵙겠습니다.
                  </p>
                  <span className="text-sm lg:text-base text-gray-500 font-['Pretendard']">
                    Coming Soon
                  </span>
                </>
              )}
            </div>

            {/* News List */}
            <div className="flex flex-col gap-10">
              {latestNews.filter(news => news.id !== featuredNews?.id).slice(0, 3).map((news) => (
                <article key={news.id} className="grid grid-cols-1 sm:grid-cols-[215px_1fr] gap-4 lg:gap-7 items-start">
                  <div className="w-full sm:w-[215px] h-32 lg:h-[140px] bg-gray-400 rounded overflow-hidden">
                    {news.imageUrl ? (
                      <img 
                        src={news.imageUrl} 
                        alt={news.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling!.style.display = 'block'
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full bg-gray-400 rounded flex items-center justify-center" style={{ display: news.imageUrl ? 'none' : 'block' }}>
                      <span className="text-white text-sm">News Image</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 lg:gap-2">
                    <h4 className="text-lg lg:text-xl font-semibold text-black leading-relaxed tracking-[-0.01em] font-['Pretendard']">
                      {news.title.length > 45 ? `${news.title.substring(0, 45)}..` : news.title}
                    </h4>
                    <p className="text-sm lg:text-base text-gray-600 leading-relaxed tracking-[-0.01em] mb-1 lg:mb-2 font-['Pretendard']">
                      {news.description.length > 80 ? `${news.description.substring(0, 80)}...` : news.description}
                    </p>
                    <span className="text-xs lg:text-sm text-gray-500 font-['Pretendard']">
                      {news.date}
                    </span>
                  </div>
                </article>
              ))}
              {latestNews.filter(news => news.id !== featuredNews?.id).length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <p>아직 등록된 뉴스가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="w-full py-16 lg:py-20 relative z-10" style={{ paddingBottom: '200px' }}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1920px' }}>
          <div className="max-w-[1407px] mx-auto">
            <h2 className="text-3xl lg:text-[52px] font-bold text-left mb-10 tracking-[-0.01em] font-['Pretendard']">
              Our partner
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-16 items-center justify-items-center">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="w-[180px] h-[80px] flex items-center justify-center transition-all duration-200 hover:transform hover:-translate-y-1"
              >
                <img
                  src={`/partner_logo_${String(i + 1).padStart(2, '0')}.svg`}
                  alt={`Partner ${i + 1}`}
                  className="max-w-[180px] max-h-[80px] object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full text-white relative overflow-hidden pt-[200px]" style={{ height: '1024px', backgroundColor: 'transparent' }} data-section="cta">
        {/* Fallback background in case video doesn't load */}
        <div className="absolute inset-0 bg-[#1a1a2e] z-0"></div>
        
        {/* Background Video */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-1"
          autoPlay
          muted
          loop
          playsInline
          onLoadStart={() => console.log('CTA Video loading started')}
          onLoadedData={() => console.log('CTA Video data loaded')}
          onCanPlay={() => console.log('CTA Video can play')}
          onPlay={() => console.log('CTA Video playing')}
          onError={(e) => console.error('CTA Video error:', e)}
        >
          <source src="/cta_video.mp4" type="video/mp4" />
        </video>
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40 z-5"></div>
        
        <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center h-full flex flex-col justify-center items-center" style={{ maxWidth: '1400px' }}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-8 lg:mb-12 tracking-[-0.01em] font-['Pretendard']">
            차세대 인공지능 솔루션,<br />
            위레이저와 함께하세요
          </h2>
          
          <button className="inline-flex items-center justify-center px-12 py-4 bg-[#5C57DD] text-white font-semibold text-lg rounded-lg hover:bg-[#4A45CC] transition-all duration-300 transform hover:scale-105 hover:shadow-xl font-['Pretendard']">
            문의하기
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="w-full text-white py-16 lg:py-20 relative"
        style={{ 
          backgroundColor: '#000000',
          zIndex: 50,
          position: 'relative'
        }}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1400px' }}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Left Content */}
            <div className="flex flex-col gap-4">
              <div className="text-sm lg:text-base font-semibold font-['Pretendard'] flex items-center gap-2">
                <a 
                  href="/terms" 
                  className="text-white hover:text-[#5C57DD] transition-colors duration-200 cursor-pointer"
                >
                  이용약관
                </a>
                <span className="text-gray-500">·</span>
                <a 
                  href="/privacy" 
                  className="text-white hover:text-[#5C57DD] transition-colors duration-200 cursor-pointer"
                >
                  개인정보 처리방침
                </a>
              </div>
              <div className="space-y-1 text-xs lg:text-sm text-gray-400 font-['Pretendard']">
                <div>Call. +82 2 20388952 | E-mail. contact@weraser.com</div>
                <div>5th floor, 48, Bulgdang 14-ro, Seobuk-gu, Cheonan-si, Republic of Korea</div>
              </div>
            </div>

            {/* Right Content - Logo */}
            <div className="flex-shrink-0">
              <div className="text-xl lg:text-2xl font-bold font-['Pretendard']">
                Weraser
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll Progress Indicator */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className={`w-2 h-8 rounded-full transition-all duration-300 ${
                Math.floor(scrollY / (typeof window !== "undefined" ? window.innerHeight : 800)) === index
                  ? "bg-white"
                  : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}