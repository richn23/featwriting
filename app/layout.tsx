import './globals.css';

export const metadata = {
  title: 'FEAT Writing Test',
  description: 'Free English Assessment Test — adaptive writing diagnostic.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
