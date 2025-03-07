'use client'

import BlockHeader from "./BlockHeader"
import { useState } from "react"
import { ArrowRight, ChevronRight } from "lucide-react"
import Link from "next/link"
import { VideoComponent } from "./LazyVideo"

interface DemoCase {
    title: string
    description: string
    videoUrl: string
    tags: string[]
}

const demoCases: DemoCase[] = [
    {
        title: "Track Hidden States in Real-time",
        description: "Unveil real-time insights into dynamic systems with our software's prowess in tracking hidden states. By providing continuous monitoring and analysis, our tool empowers you to gain a deeper understanding of complex processes, enabling informed decision-making and proactive responses.",
        videoUrl: "/videos/nlds.webm",
        tags: ["Dynamic Systems", "Real-time", "State Tracking"]
    },
    {
        title: "Smart Navigation & Collision Avoidance",
        description: "Stay in control, prevent collisions, and streamline routes effortlessly with RxInfer. Streamline your navigation experience and enhance safety.",
        videoUrl: "/videos/collision.webm",
        tags: ["Navigation", "Safety", "Automation"]
    },
    {
        title: "Reactive Reasoning with Active Inference",
        description: "Enhance your decision-making process with the Active Inference framework. Designed to help you analyze incoming information in real-time, this tool enables you to make well-informed choices and adapt to changing situations effectively.",
        videoUrl: "/videos/aif.webm",
        tags: ["Active Inference", "Decision Making", "Adaptive"]
    }
]

function DemoCard({ demo, align }: { demo: DemoCase, align: "left" | "right" }) {
    return (
        <div className="flex flex-col gap-6">
            <div className={`flex flex-col gap-4 ${align === "left" ? "text-left" : "text-right"}`}>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    {demo.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                    {demo.description}
                </p>
                <div className={`flex flex-wrap gap-2 ${align === "left" ? "justify-start" : "justify-end"}`}>
                    {demo.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-gradient-to-r from-green-50 to-blue-50 text-gray-700 border rounded-full text-sm font-medium"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
            <div className="w-full rounded-xl overflow-hidden bg-black">
                <VideoComponent src={demo.videoUrl} />
            </div>
        </div>
    )
}

export default function ComplexProblems() {
    return (
        <section id="complex-problems" className="w-full py-20">
            <BlockHeader
                id="complex-problems"
                title="Solve Complex Problems"
                subtitle="See RxInfer in action with real-world applications"
                align="center"
            />
            <div className="mt-16 flex flex-col gap-4">
                {demoCases.map((demo, index) => (
                    <DemoCard key={index} demo={demo} align={index % 2 === 0 ? "left" : "right"} />
                ))}
            </div>
            <div className="flex flex-col gap-4 items-center mt-12">
                <p className="text-lg text-gray-600 leading-relaxed text-center mb-4">
                    Discover more examples and see how RxInfer can help solve your inference problems.
                </p>
                <Link
                    href="https://examples.rxinfer.com"
                    className="inline-flex items-center gap-2 px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-green-600 rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                    Explore More Examples
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </section>
    )
}
