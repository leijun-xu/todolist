import './globals.css'

export const metadata = {
  title: 'Todo List',
  description: 'A Todo List application built with Next.js',
}

export default function RootLayout({
  children,
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}