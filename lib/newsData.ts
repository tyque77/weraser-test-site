export interface NewsItem {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'news' | 'blog'; // 뉴스와 블로그 구분
  imageUrl?: string | null;
  originalUrl?: string | null; // 원문 링크
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

// localStorage 키
const NEWS_DATA_KEY = 'weraser_news_data'

// 기본 뉴스 데이터 (최초 실행 시에만 사용)
const defaultNewsData: NewsItem[] = [
  {
    id: "1",
    title: "위레이저, AI로 물류 서류 처리 시간 90% 단축",
    description: "위레이저는 국민일보와 쿠키뉴스가 주최한 '코어이노베이션코리아 2024'에서 물류 관리 및 데이터 처리 혁신을 인정받아 대상을 수상했습니다.",
    date: "2025.01.15",
    type: "news",
    imageUrl: "/uploads/1756177983919.jpg",
    originalUrl: "https://www.example.com/news/weraser-award-2024",
    slug: "weraser-ai-logistics-award-2024",
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15")
  },
  {
    id: "2",
    title: "위레이저, 물류 AI 솔루션으로 업계 혁신 주도",
    description: "AI 기반 물류 관리 시스템을 통해 기업들의 물류 효율성을 크게 향상시키고 있습니다.",
    date: "2025.01.10",
    type: "news",
    imageUrl: null,
    originalUrl: null,
    slug: "weraser-logistics-ai-innovation",
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-10")
  },
  {
    id: "3",
    title: "스마트 물류 플랫폼 베타 서비스 출시",
    description: "차세대 물류 관리 솔루션의 베타 버전이 출시되어 선별된 고객사들과 함께 테스트를 진행하고 있습니다.",
    date: "2024.12.15",
    type: "news",
    imageUrl: null,
    originalUrl: null,
    slug: "smart-logistics-platform-beta",
    createdAt: new Date("2024-12-15"),
    updatedAt: new Date("2024-12-15")
  },
  {
    id: "4",
    title: "글로벌 물류 기업과 파트너십 체결",
    description: "해외 진출을 위한 전략적 파트너십을 통해 글로벌 시장 확장의 발판을 마련했습니다.",
    date: "2024.11.28",
    type: "news",
    imageUrl: null,
    originalUrl: null,
    slug: "global-logistics-partnership",
    createdAt: new Date("2024-11-28"),
    updatedAt: new Date("2024-11-28")
  },
  {
    id: "5",
    title: "AI 기술 특허 출원 완료",
    description: "핵심 AI 알고리즘에 대한 특허 출원을 완료하여 기술적 경쟁력을 더욱 강화했습니다.",
    date: "2024.10.10",
    type: "news",
    imageUrl: null,
    originalUrl: null,
    slug: "ai-technology-patent-application",
    createdAt: new Date("2024-10-10"),
    updatedAt: new Date("2024-10-10")
  },
  // 블로그 샘플 데이터
  {
    id: "blog-1",
    title: "AI 물류 최적화의 미래",
    description: "인공지능 기술이 물류 산업에 가져올 변화와 미래 전망에 대해 살펴봅니다.",
    date: "2025.01.12",
    type: "blog",
    imageUrl: null,
    originalUrl: null,
    slug: "ai-logistics-optimization-future",
    createdAt: new Date("2025-01-12"),
    updatedAt: new Date("2025-01-12")
  },
  {
    id: "blog-2",
    title: "스마트 물류 도입 가이드",
    description: "기업에서 스마트 물류 시스템을 도입할 때 고려해야 할 핵심 요소들을 정리했습니다.",
    date: "2025.01.08",
    type: "blog",
    imageUrl: null,
    originalUrl: null,
    slug: "smart-logistics-implementation-guide",
    createdAt: new Date("2025-01-08"),
    updatedAt: new Date("2025-01-08")
  }
];

// localStorage에서 뉴스 데이터 가져오기
const getNewsDataFromStorage = (): NewsItem[] => {
  if (typeof window === 'undefined') return defaultNewsData; // 서버 사이드에서는 기본 데이터 반환
  
  try {
    const stored = localStorage.getItem(NEWS_DATA_KEY);
    if (!stored) {
      // 최초 실행 시 기본 데이터를 localStorage에 저장
      saveNewsDataToStorage(defaultNewsData);
      return defaultNewsData;
    }
    
    const parsed = JSON.parse(stored);
    // Date 객체 복원
    return parsed.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt)
    }));
  } catch (error) {
    console.error('Error loading news data from localStorage:', error);
    return defaultNewsData;
  }
};

// localStorage에 뉴스 데이터 저장하기
const saveNewsDataToStorage = (data: NewsItem[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(NEWS_DATA_KEY, JSON.stringify(data));
    // 다른 탭들에게 업데이트 신호 보내기
    localStorage.setItem('newsUpdated', Date.now().toString());
    console.log('News data saved to localStorage, signal sent');
  } catch (error) {
    console.error('Error saving news data to localStorage:', error);
  }
};

// 뉴스 데이터 유틸리티 함수들
export const getLatestNews = (limit: number = 5): NewsItem[] => {
  const newsData = getNewsDataFromStorage();
  return newsData
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
};

export const getFeaturedNews = (): NewsItem | null => {
  const newsData = getNewsDataFromStorage();
  return newsData[0] || null; // 첫 번째 뉴스를 featured로 사용
};

export const getNewsById = (id: string): NewsItem | null => {
  const newsData = getNewsDataFromStorage();
  return newsData.find(item => item.id === id) || null;
};

export const getNewsBySlug = (slug: string): NewsItem | null => {
  const newsData = getNewsDataFromStorage();
  return newsData.find(item => item.slug === slug) || null;
};

export const getAllNews = (): NewsItem[] => {
  const newsData = getNewsDataFromStorage();
  return newsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const getNewsByType = (type: 'news' | 'blog'): NewsItem[] => {
  const newsData = getNewsDataFromStorage();
  return newsData
    .filter(item => item.type === type)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// CRUD 함수들 (관리자 페이지용)
export const addNewsItem = (item: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>): NewsItem => {
  const newsData = getNewsDataFromStorage();
  const newItem: NewsItem = {
    ...item,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const updatedData = [...newsData, newItem];
  saveNewsDataToStorage(updatedData);
  console.log('Added new item:', newItem.title);
  return newItem;
};

export const updateNewsItem = (id: string, updates: Partial<Omit<NewsItem, 'id' | 'createdAt'>>): NewsItem | null => {
  const newsData = getNewsDataFromStorage();
  const index = newsData.findIndex(item => item.id === id);
  if (index === -1) return null;
  
  const updatedItem = {
    ...newsData[index],
    ...updates,
    updatedAt: new Date()
  };
  
  const updatedData = [...newsData];
  updatedData[index] = updatedItem;
  saveNewsDataToStorage(updatedData);
  console.log('Updated item:', updatedItem.title);
  return updatedItem;
};

export const deleteNewsItem = (id: string): boolean => {
  const newsData = getNewsDataFromStorage();
  console.log('deleteNewsItem called with id:', id);
  console.log('Current newsData length:', newsData.length);
  console.log('All item IDs:', newsData.map(item => item.id));
  
  const index = newsData.findIndex(item => item.id === id);
  console.log('Found index:', index);
  
  if (index === -1) {
    console.log('Item not found!');
    return false;
  }
  
  const itemToDelete = newsData[index];
  console.log('Deleting item:', itemToDelete.title);
  
  const updatedData = newsData.filter(item => item.id !== id);
  saveNewsDataToStorage(updatedData);
  console.log('After deletion, newsData length:', updatedData.length);
  return true;
};