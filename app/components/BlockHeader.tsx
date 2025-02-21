'use client'

import { useEffect, useRef, useState } from 'react'

interface BlockHeaderProps {
    title: string;
    subtitle?: string;
    align?: 'left' | 'center' | 'right';
}

export default function BlockHeader({
    title,
    subtitle,
    align = 'center'
}: BlockHeaderProps) {
    const [isVisible, setIsVisible] = useState(false)
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

    return (
        <div
            ref={headerRef}
            className={`flex flex-col gap-4 w-full ${
                align === 'center' ? 'text-center items-center' :
                align === 'right' ? 'text-right items-end' :
                'text-left items-start'
            }`}
        >
            <h2
                className={`text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-500 bg-clip-text text-transparent
                    transform transition-all duration-700 ease-out
                    opacity-0 translate-y-8 motion-reduce:translate-y-0
                    ${isVisible ? '!opacity-100 !translate-y-0' : ''}`}
            >
                {title}
            </h2>
            {subtitle && (
                <div className={`flex flex-col gap-2 ${
                    align === 'center' ? 'items-center' :
                    align === 'right' ? 'items-end' :
                    'items-start'
                }`}>
                    <div
                        className={`h-0.5 w-64 bg-gradient-to-r from-green-600 to-blue-500 rounded-full
                            transform transition-all duration-700 delay-200 ease-out
                            opacity-0 scale-x-0 motion-reduce:scale-x-100
                            ${isVisible ? '!opacity-100 !scale-x-100' : ''}`}
                    />
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
