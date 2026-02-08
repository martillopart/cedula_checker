import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Cédula de Habitabilitat Checker',
  description: 'Eina de pre-validació per a la cédula de habitabilitat a Catalunya',
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ca">
      <body>
        <Providers>
          <ErrorBoundary>
            <Navbar />
            {children}
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  )
}
