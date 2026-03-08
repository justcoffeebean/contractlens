import './globals.css'

export const metadata = {
  title: 'ContractLens — AI Contract Analysis',
  description: 'Upload any contract and get instant AI-powered risk analysis',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}