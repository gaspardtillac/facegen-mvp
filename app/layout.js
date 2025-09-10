import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'FaceGen AI',
  description: 'Générateur de visages IA',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
