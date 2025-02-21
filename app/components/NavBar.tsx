'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
    BookOpenText, // Documentation
    NotebookPen, // Get Started
    Code2, // Examples
    MessageCircle, // Discussions
    Users, // Team
    Github, // GitHub
    Menu, // Hamburger menu icon
    X // Close icon
} from 'lucide-react'

interface NavItem {
    label: string
    href: string
    icon: React.ElementType
}

const navItems: NavItem[] = [
    {
        label: 'Get Started',
        href: 'https://docs.rxinfer.ml/stable/manuals/getting-started/',
        icon: NotebookPen
    },
    {
        label: 'Documentation',
        href: 'https://docs.rxinfer.ml/stable/',
        icon: BookOpenText
    },
    {
        label: 'Examples',
        href: 'https://examples.rxinfer.ml',
        icon: Code2
    },
    {
        label: 'Discussions',
        href: 'https://github.com/reactivebayes/RxInfer.jl/discussions',
        icon: MessageCircle
    },
    {
        label: 'Team',
        href: 'https://github.com/reactivebayes/RxInfer.jl/graphs/contributors',
        icon: Users
    },
    {
        label: 'GitHub',
        href: 'https://github.com/reactivebayes/RxInfer.jl',
        icon: Github
    }
]

export function NavBar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <nav className="fixed top-0 w-full bg-white border-b z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center">
                            <Image
                                src="/images/rxinfer-header-logo.svg"
                                alt="RxInfer Logo"
                                width={100}
                                height={100}
                                className="mr-2"
                            />
                        </Link>
                    </div>

                    {/* Desktop menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {navItems.map((item) => (
                            <NavLink key={item.label} item={item} />
                        ))}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-b">
                        {navItems.map((item) => (
                            <NavLink key={item.label} item={item} />
                        ))}
                    </div>
                </div>
            )}
        </nav>
    )
}

function NavLink({ item }: { item: NavItem }) {
    return (
        <Link
            href={item.href}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-blue-600 transition-all duration-200 ease-in-out relative group"
        >
            <item.icon className="w-4 h-4 mr-2 transform group-hover:scale-110 transition-transform duration-200 ease-in-out" />
            <span className="relative">
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300 ease-in-out"></span>
            </span>
        </Link>
    )
}