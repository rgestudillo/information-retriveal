'use client'

import { Github } from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'

export default function Header() {
    return (
        <header className="border-b">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/" className="hover:opacity-80 transition-opacity">
                        <h1 className="text-2xl font-bold font-mono cursor-pointer">
                            NLP PROJECT
                        </h1>
                    </Link>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        Information Retrieval
                    </span>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => window.open('https://github.com/rgestudillo/information-retriveal', '_blank')}
                >
                    <Github className="h-4 w-4" />
                    Star on GitHub
                </Button>
            </div>
        </header>
    )
} 