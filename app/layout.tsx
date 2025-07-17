import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'sharing app /@villan7667',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
