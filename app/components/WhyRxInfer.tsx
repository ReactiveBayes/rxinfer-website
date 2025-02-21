'use client'

import { useRef, useState, useEffect } from 'react'
import BlockHeader from './BlockHeader'
import {
    UserCheck, // User Friendly
    Waves, // Streaming
    GitMerge, // Hybrid
    Scale, // Scalable
    Puzzle, // Extensible
    Users // Community Driven
} from 'lucide-react'

// Julia colors
const colorSchemes = [
    {
        icon: 'text-green-600',
        gradient: 'from-green-200 to-green-50',
        titleGradient: 'from-green-600 to-blue-500',
        borderGradient: 'from-green-500/20 via-blue-500/20 to-green-500/20'
    },
    {
        icon: 'text-blue-600',
        gradient: 'from-blue-200 to-blue-50',
        titleGradient: 'from-blue-600 to-green-500',
        borderGradient: 'from-blue-500/20 via-green-500/20 to-blue-500/20'
    },
    {
        icon: 'text-purple-600',
        gradient: 'from-purple-200 to-purple-50',
        titleGradient: 'from-purple-600 to-red-500',
        borderGradient: 'from-purple-500/20 via-red-500/20 to-purple-500/20'
    },
    {
        icon: 'text-red-600',
        gradient: 'from-red-200 to-red-50',
        titleGradient: 'from-red-600 to-yellow-300',
        borderGradient: 'from-red-500/20 via-yellow-400/20 to-red-500/20'
    },
    {
        icon: 'text-yellow-600',
        gradient: 'from-yellow-200 to-yellow-50',
        titleGradient: 'from-yellow-600 to-red-500',
        borderGradient: 'from-yellow-500/20 via-red-500/20 to-yellow-500/20'
    },
    {
        icon: 'text-teal-600',
        gradient: 'from-teal-200 to-teal-50',
        titleGradient: 'from-teal-600 to-purple-500',
        borderGradient: 'from-teal-500/20 via-purple-500/20 to-teal-500/20'
    }
]

interface FeatureProps {
    title: string
    description: string
    icon: React.ElementType
    colorIndex: number
    align?: 'left' | 'right'
}

function Feature({ title, description, icon: Icon, colorIndex, align = 'left' }: FeatureProps) {
    const [isVisible, setIsVisible] = useState(false)
    const featureRef = useRef<HTMLDivElement>(null)
    const colors = colorSchemes[colorIndex % colorSchemes.length]

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            {
                threshold: 0.2,
                rootMargin: '-50px 0px'
            }
        )

        if (featureRef.current) {
            observer.observe(featureRef.current)
        }

        return () => observer.disconnect()
    }, [])

    return (
        <div
            ref={featureRef}
            className={`relative flex gap-4 items-start max-w-2xl ${align === 'right' ? 'flex-row-reverse text-right' : 'flex-row'} 
                px-4 py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-white
                opacity-0 translate-y-8 motion-reduce:translate-y-0
                ${isVisible ? '!opacity-100 !translate-y-0' : ''}`}
        >
            {/* Gradient border overlay */}
            <div
                className={`absolute inset-0 rounded-xl bg-gradient-to-r ${colors.borderGradient} -z-10`}
            />
            <div
                className="absolute inset-[1px] rounded-xl bg-white -z-10"
            />

            {/* Rest of the content */}
            <div
                className={`my-auto flex-shrink-0 ml-1 p-3 rounded-2xl bg-gradient-to-br ${colors.gradient}`}
            >
                <Icon className={`w-8 h-16 ${colors.icon}`} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
                <h3 className={`text-xl font-semibold mb-1 bg-gradient-to-r ${colors.titleGradient} bg-clip-text text-transparent`}>
                    {title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    )
}

export default function WhyRxInfer() {
    return (
        <section className="flex flex-col gap-8 w-full py-20">
            <BlockHeader
                title="Why RxInfer?"
                subtitle="Discover the power of reactive Bayesian inference"
                align="center"
            />
            <div className="">
                <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <Feature
                        icon={UserCheck}
                        title="User Friendly"
                        description="Clean specification of probabilistic models and inference constraints."
                        colorIndex={0}
                        align="left"
                    />
                    <Feature
                        icon={Waves}
                        title="Streaming Datasets"
                        description="Reactive message passing-based inference for streaming datasets."
                        colorIndex={1}
                        align="left"
                    />
                    <Feature
                        icon={GitMerge}
                        title="Hybrid Models"
                        description="Support for hybrid models combining discrete and continuous latent variables."
                        colorIndex={2}
                        align="left"
                    />
                    <Feature
                        icon={Scale}
                        title="Scalable"
                        description="Scalability for large models with millions of parameters and observations."
                        colorIndex={3}
                        align="left"
                    />
                    <Feature
                        icon={Puzzle}
                        title="Extensible"
                        description="Designed to be extended with custom operations."
                        colorIndex={4}
                        align="left"
                    />
                    <Feature
                        icon={Users}
                        title="Community Driven"
                        description="Join our vibrant community of developers and researchers."
                        colorIndex={5}
                        align="left"
                    />
                </div>
            </div>
        </section>
    )
}

