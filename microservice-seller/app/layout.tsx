import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })
// đây là layout gốc, nó sẽ bao quanh tất cả các trang con như dashboard, orders, products, ... 
// Nó có thể chứa header, footer, sidebar chung nếu cần  
export const metadata: Metadata = {
  title: 'Seller Dashboard',
  description: 'Quản lý bán hàng',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={geist.className}>
        {children}
      </body>
    </html>
  )
}