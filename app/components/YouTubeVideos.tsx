'use client'

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import BlockHeader from "./BlockHeader"

interface YouTubeVideo {
    title: string
    description: string
    videoId: string
    author?: string
    tags?: string[]
    startTime?: number
}

const featuredTalk: YouTubeVideo = {
    title: "RxInfer: Reactive Message Passing Based Inference",
    description: "Learn about the core concepts behind RxInfer, its implementation, and how it enables reactive probabilistic programming with message passing-based inference. This talk from JuliaCon 2023 covers the fundamental principles and demonstrates real-world applications.",
    videoId: "qXrvDVm_fnE",
    author: "Dmitry Bagaev",
    tags: ["JuliaCon 2023", "Tutorial", "Message Passing", "Reactive Programming"]
}

const communityVideos: YouTubeVideo[] = [
    {
        title: "Fast Bayesian Inference with RxInfer.jl",
        description: "A comprehensive guide to performing fast Bayesian inference using RxInfer.jl",
        videoId: "KuluqEzFtm8"
    },
    {
        title: "Intro to RxInfer by Doggo.jl",
        description: "Get started with RxInfer through this beginner-friendly introduction",
        videoId: "_vVHWzK9NEI"
    },
    {
        title: "Variational inference with RxInfer",
        description: "Learn about variational inference techniques in RxInfer by Doggo.jl",
        videoId: "qnj0PKc734g"
    },
    {
        title: "Active Inference Symposium",
        description: "Explore RxInfer's applications in Active Inference",
        videoId: "PVeyvHSAwmk",
        startTime: 5484
    }
]

function FeaturedVideoCard({ video }: { video: YouTubeVideo }) {
    const videoUrl = `https://www.youtube.com/embed/${video.videoId}${video.startTime ? `?start=${video.startTime}` : ''}`

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
                <p className="text-gray-600 text-center">
                    {video.description}
                </p>
            </div>

            <div className="w-full max-w-4xl mx-auto">
                <div className="relative w-full pb-[56.25%]">
                    <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-xl"
                        src={videoUrl}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    />
                </div>
            </div>
        </div>
    )
}

function CommunityVideoCard({ video }: { video: YouTubeVideo }) {
    const videoUrl = `https://www.youtube.com/embed/${video.videoId}${video.startTime ? `?start=${video.startTime}` : ''}`

    return (
        <div className="flex flex-col gap-3">
            <div className="relative w-full pb-[56.25%]">
                <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    src={videoUrl}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
                {video.title}
            </h3>
        </div>
    )
}

export default function YouTubeVideos() {
    return (
        <section className="w-full flex flex-col gap-16 py-20">
            <BlockHeader
                title="Watch JuliaCon Talk"
                subtitle="Deep dive into RxInfer's architecture and capabilities"
                align="center"
            />
            <FeaturedVideoCard video={featuredTalk} />

            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Community Videos
                </h1>
                <p className="text-gray-600 text-center mb-8">
                    Join our growing community and explore more videos from Julia developers. Share your own experiences and connect with fellow RxInfer users!
                </p>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {communityVideos.map((video, index) => (
                        <CommunityVideoCard key={index} video={video} />
                    ))}
                </div>
            </div>
        </section>
    )
}
