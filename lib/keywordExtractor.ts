import { removeStopwords, kor, eng } from 'stopword'

// 무료 키워드 추출 함수
export function extractKeywords(title: string, description: string): string[] {
  // 제목과 내용을 합치기
  const text = `${title} ${description}`.toLowerCase()
  
  // 한글과 영문 단어만 추출
  const words = text.match(/[가-힣a-zA-Z]+/g) || []
  
  // 불용어 제거 (한글, 영어)
  const filteredWords = removeStopwords(words, [...kor, ...eng])
  
  // 단어 빈도 계산
  const wordCount: { [key: string]: number } = {}
  filteredWords.forEach(word => {
    if (word.length > 1) { // 한 글자 단어 제외
      wordCount[word] = (wordCount[word] || 0) + 1
    }
  })
  
  // 빈도순으로 정렬하여 상위 키워드 추출
  const sortedWords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5) // 상위 5개 키워드
    .map(([word]) => word)
  
  // 기본 키워드 추가 (비즈니스, 기술 관련)
  const businessKeywords = ['business', 'technology', 'innovation', 'corporate', 'professional']
  
  // 키워드가 부족하면 기본 키워드 추가
  const finalKeywords = [...sortedWords]
  if (finalKeywords.length < 3) {
    finalKeywords.push(...businessKeywords.slice(0, 3 - finalKeywords.length))
  }
  
  return finalKeywords
}

// 한글 키워드를 영어로 매핑 (Unsplash 검색용)
export function translateToEnglish(koreanKeyword: string): string {
  const translations: { [key: string]: string } = {
    '물류': 'logistics',
    '배송': 'shipping',
    '운송': 'transportation',
    '기술': 'technology',
    '혁신': 'innovation',
    '디지털': 'digital',
    '스마트': 'smart',
    '플랫폼': 'platform',
    '솔루션': 'solution',
    '서비스': 'service',
    '시스템': 'system',
    '데이터': 'data',
    '분석': 'analytics',
    '관리': 'management',
    '효율': 'efficiency',
    '자동화': 'automation',
    '최적화': 'optimization',
    '글로벌': 'global',
    '파트너십': 'partnership',
    '협력': 'collaboration',
    '성장': 'growth',
    '발전': 'development',
    '미래': 'future',
    '트렌드': 'trend',
    '산업': 'industry',
    '기업': 'business',
    '회사': 'company',
    '팀': 'team',
    '프로젝트': 'project',
    '출시': 'launch',
    '베타': 'beta',
    '테스트': 'testing',
    '개발': 'development',
    '연구': 'research',
    '특허': 'patent',
    '투자': 'investment',
    '펀딩': 'funding',
    '수상': 'award',
    '인정': 'recognition'
  }
  
  return translations[koreanKeyword] || koreanKeyword
}

// 키워드를 영어로 변환하여 Unsplash 검색용 쿼리 생성
export function generateSearchQueries(keywords: string[]): string[] {
  const englishKeywords = keywords.map(translateToEnglish)
  
  // 조합 키워드도 생성
  const queries = [
    ...englishKeywords,
    'business meeting',
    'technology office',
    'modern workspace',
    'digital innovation',
    'professional team'
  ]
  
  return queries.slice(0, 8) // 최대 8개 쿼리
}
