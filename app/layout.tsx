import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import Image from "next/image"
import { Home, MessageSquarePlus, Instagram, Twitter, Facebook } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Confessio",
  description: "An anonymous forum where users can create profiles and send messages",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen flex flex-col bg-background">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold">
                  <Image
                    src="/images/confessio-logo.png"
                    alt="Confessio Logo"
                    width={40}
                    height={40}
                    className="h-10 w-auto"
                  />
                  <span className="text-xl hidden sm:inline-block gradient-text">Confessio</span>
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                  <Link href="/" className="nav-link">
                    Home
                  </Link>
                  <Link href="/create-room" className="nav-link">
                    Create Room
                  </Link>
                </nav>

                <div className="flex items-center gap-2">
                  <ThemeToggle />
                </div>
              </div>
            </header>

            <main className="container py-6 px-4 flex-1">
              <div className="animate-fade-in">{children}</div>
            </main>

            {/* Fixed Mobile Navigation - Moved outside of header to avoid conflicts */}
            <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
              <div className="flex justify-around items-center h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
                <Link
                  href="/"
                  className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                >
                  <Home size={20} />
                  <span className="text-xs mt-1">Home</span>
                </Link>
                <Link
                  href="/create-room"
                  className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                >
                  <MessageSquarePlus size={20} />
                  <span className="text-xs mt-1">Create Room</span>
                </Link>
              </div>
            </div>

            <footer className="border-t py-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
                <p className="text-center text-sm text-muted-foreground md:text-left">
                  &copy; {new Date().getFullYear()} Confessio. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                  <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Terms
                  </Link>
                  <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Privacy
                  </Link>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Support this website
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    <Instagram size={20} />
                  </Link>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    <Twitter size={20} />
                  </Link>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    <Facebook size={20} />
                  </Link>
                </div>
              </div>
            </footer>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
