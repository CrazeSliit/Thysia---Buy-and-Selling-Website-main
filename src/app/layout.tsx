import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Thysia - Your Premium E-commerce Marketplace',
  description: 'Discover amazing products from verified sellers. Buy, sell, and deliver with confidence on Thysia marketplace.',
  keywords: 'ecommerce, marketplace, online shopping, buy, sell, products',
  authors: [{ name: 'Thysia Team' }],
  openGraph: {
    title: 'Thysia - Your Premium E-commerce Marketplace',
    description: 'Discover amazing products from verified sellers.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full flex flex-col`}>
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
