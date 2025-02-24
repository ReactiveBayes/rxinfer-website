'use client'

import { useEffect, useRef, useState } from 'react'

interface BlockHeaderProps {
    title: string;
    subtitle?: string;
    id?: string;
    align?: 'left' | 'center' | 'right';
}

export default function BlockHeader({
    title,
    subtitle,
    id,
    align = 'center'
}: BlockHeaderProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [showCopied, setShowCopied] = useState(false)
    const headerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        )

        if (headerRef.current) {
            observer.observe(headerRef.current)
        }

        return () => observer.disconnect()
    }, [])

    const handleClick = () => {
        if (id) {
            const element = document.getElementById(id)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
                // Update URL with hash
                window.history.pushState({}, '', `#${id}`)
                // Copy link to clipboard
                navigator.clipboard.writeText(window.location.href)
                
                // Show the copied notification
                setShowCopied(true)
                setTimeout(() => setShowCopied(false), 2000) // Hide after 2 seconds
            }
        }
    }

    return (
        <div
            ref={headerRef}
            className={`flex flex-col gap-4 w-full ${align === 'center' ? 'text-center items-center' :
                align === 'right' ? 'text-right items-end' :
                    'text-left items-start'
                }`}
        >
            <h2
                className={`text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-500 bg-clip-text text-transparent
                    transform transition-all duration-700 ease-out
                    opacity-0 translate-y-8 motion-reduce:translate-y-0
                    cursor-pointer
                    ${isVisible ? '!opacity-100 !translate-y-0' : ''}`}
                onClick={handleClick}
            >
                {title}
            </h2>
            {subtitle && (
                <div className={`flex flex-col gap-2 relative ${align === 'center' ? 'items-center' :
                    align === 'right' ? 'items-end' :
                        'items-start'
                    }`}>
                    <div className="relative">
                        <div
                            className={`absolute -top-4 left-1/2 -translate-x-1/2 w-full bg-white/80 z-10 text-green-700 px-3 py-1 rounded-md
                                transform transition-all duration-300 ease-out font-semibold
                                ${showCopied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                        >
                            Copied to your clipboard!
                        </div>
                        <div
                            className={`h-0.5 w-64 lg:w-96 bg-gradient-to-r from-green-600 to-blue-500 rounded-full
                                transform transition-all duration-700 delay-200 ease-out
                                opacity-0 scale-x-0 motion-reduce:scale-x-100
                                ${isVisible ? '!opacity-100 !scale-x-100' : ''}`}
                        />
                    </div>
                    <p
                        className={`text-2xl text-gray-500 leading-snug max-w-2xl
                            transform transition-all duration-700 delay-400 ease-out
                            opacity-0 translate-y-8 motion-reduce:translate-y-0
                            ${isVisible ? '!opacity-100 !translate-y-0' : ''}`}
                    >
                        {subtitle}
                    </p>
                </div>
            )}
        </div>
    )
}

