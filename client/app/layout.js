import './globals.css'
import { AuthProvider } from './context/AuthContext'

export const metadata = {
  title: 'ContractLens — AI Contract Analysis',
  description: 'Upload any contract and get instant AI-powered risk analysis',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}