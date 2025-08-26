'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { NewsItem, newsData as initialNewsData } from './newsData'

interface NewsContextType {
  newsData: NewsItem[]
  updateNewsData: (newData: NewsItem[]) => void
  getNewsBySlug: (slug: string) => NewsItem | null
  getAllNews: () => NewsItem[]
  getFeaturedNews: () => NewsItem | null
}

const NewsContext = createContext<NewsContextType | undefined>(undefined)

export function NewsProvider({ children }: { children: React.ReactNode }) {
  const [newsData, setNewsData] = useState<NewsItem[]>(initialNewsData)

  const updateNewsData = (newData: NewsItem[]) => {
    setNewsData(newData)
  }

  const getNewsBySlug = (slug: string): NewsItem | null => {
    return newsData.find(item => item.slug === slug) || null
  }

  const getAllNews = (): NewsItem[] => {
    return newsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  const getFeaturedNews = (): NewsItem | null => {
    return newsData[0] || null
  }

  return (
    <NewsContext.Provider value={{
      newsData,
      updateNewsData,
      getNewsBySlug,
      getAllNews,
      getFeaturedNews
    }}>
      {children}
    </NewsContext.Provider>
  )
}

export function useNews() {
  const context = useContext(NewsContext)
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider')
  }
  return context
}
