'use client'

import Image from "next/image"
import Link from "next/link"
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

export default function Supporters() {
    return (
        <section className="w-full py-20">
            <BlockHeader
                title="Thanks to Our Supporters"
                subtitle="We're grateful to these amazing organizations for their continued support and contributions"
                align="center"
            />
            <div className="grid md:grid-cols-5 grid-cols-2 gap-6 pt-16">
                {supporters.map((supporter, index) => (
                    <Link
                        key={index}
                        href={supporter.href}
                        className="p-6 transition-all duration-300 group flex flex-col items-center gap-4 hover:-translate-y-1"
                        target="_blank"
                    >
                        <div className="relative w-20 h-20">
                            <Image
                                src={supporter.logo}
                                alt={supporter.name}
                                fill
                                className="object-contain filter group-hover:brightness-110 transition-all"
                            />
                        </div>
                        <span className="text-sm font-medium text-center text-gray-700 group-hover:text-blue-600 transition-colors">
                            {supporter.name}
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    )
}
