'use client'

import Image from "next/image"
import Link from "next/link"
import { Github, Youtube, Twitter, GitBranch, Users, X, Bug } from "lucide-react"
import BlockHeader from "./BlockHeader"

interface Supporter {
    name: string
    href: string
    logo: string
}

const supporters: Supporter[] = [
    {
        name: "Technical University of Eindhoven",
        href: "https://www.tue.nl/en/",
        logo: "/images/TUe-logo-scarlet-S.png"
    },
    {
        name: "NWO",
        href: "https://www.nwo.nl/en",
        logo: "/images/NWO.png"
    },
    {
        name: "GN Hearing",
        href: "https://www.resound.com/nl-nl/",
        logo: "/images/gn.png"
    },
    {
        name: "Lazy Dynamics",
        href: "https://lazydynamics.com/",
        logo: "/images/lazydynamics_logo.png"
    },
    {
        name: "Active Inference Institute",
        href: "https://www.activeinference.org/",
        logo: "/images/actinf.png"
    }
]

const socialLinks = [
    { icon: Youtube, href: "https://youtube.com/channel/UCd1ftkOXIQ8MstIHosEDdaw", label: "YouTube", name: "YouTube" },
    { icon: Github, href: "https://github.com/reactivebayes/rxinfer.jl", label: "RxInfer GitHub", name: "GitHub" },
    { icon: GitBranch, href: "https://github.com/ReactiveBayes", label: "ReactiveBayes GitHub", name: "ReactiveBayes" },
    { icon: Users, href: "https://github.com/reactivebayes/rxinfer.jl/discussions", label: "RxInfer Discussions", name: "Discussions" },
    { icon: Bug, href: "https://github.com/reactivebayes/rxinfer.jl/issues", label: "RxInfer Issues", name: "Issues" },
    { icon: Twitter, href: "https://x.com/reactivebayes", label: "Twitter / X", name: "Twitter / X" }
]

export default function StayInTouch() {
    return (
        <section className="w-full gap-12 pt-20">
            <BlockHeader title="Let's stay in touch!" subtitle="Here are some of the ways you can follow us:" />
            <div className="flex flex-col gap-4 max-w-6xl mx-auto pt-8">
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-3 lg:grid-cols-6 gap-8 justify-center">
                        {socialLinks.map((link, index) => {
                            const Icon = link.icon
                            return (
                                <Link
                                    key={index}
                                    href={link.href}
                                    className="flex flex-col items-center gap-2 group"
                                    target="_blank"
                                    aria-label={link.label}
                                >
                                    <div className="p-6 rounded-xl bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:scale-110 transition-all duration-200">
                                        <Icon className="w-12 h-12 stroke-1 group-hover:animate-pulse" />
                                    </div>
                                    <span className="text-lg font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
                                        {link.name}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
