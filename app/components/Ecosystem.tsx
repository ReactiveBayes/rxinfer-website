'use client'

import BlockHeader from "./BlockHeader"
import Link from "next/link"
import { Rocket, Mail, GitBranch, Database, Box, Github, ArrowRight, Package, Server } from 'lucide-react'

interface EcosystemPackage {
    name: string
    description: string
    icon: React.ElementType
    url: string
}

const packages: EcosystemPackage[] = [
    {
        name: "RxInferServer.jl",
        description: "RESTful HTTP server for deploying RxInfer models as web services with OpenAPI support.",
        icon: Server,
        url: "https://github.com/lazydynamics/RxInferServer"
    },
    {
        name: "RxInferClient.py",
        description: "Python client for interacting with RxInferServer, providing a clean API for model deployment and inference.",
        icon: Server,
        url: "https://github.com/lazydynamics/RxInferClient.py"
    },
    {
        name: "Rocket.jl",
        description: "Enables reactive programming in Julia for processing of asynchronous data streams.",
        icon: Rocket,
        url: "https://github.com/reactivebayes/Rocket.jl"
    },
    {
        name: "ReactiveMP.jl",
        description: "Efficient, easily extensible and schedule-free reactive message passing-based inference engine.",
        icon: Mail,
        url: "https://github.com/reactivebayes/ReactiveMP.jl"
    },
    {
        name: "GraphPPL.jl",
        description: "Powerful, user-friendly, graph-based specification of both model and inference constraints.",
        icon: GitBranch,
        url: "https://github.com/reactivebayes/GraphPPL.jl"
    },
    {
        name: "ExponentialFamily.jl",
        description: "A package that implements the rich family of probability distributions.",
        icon: Database,
        url: "https://github.com/reactivebayes/ExponentialFamily.jl"
    },
    {
        name: "BayesBase.jl",
        description: "A package that serves as an umbrella, defining methods essential for Bayesian statistics.",
        icon: Box,
        url: "https://github.com/reactivebayes/BayesBase.jl"
    }
]

function PackageCard({ pkg }: { pkg: EcosystemPackage }) {
    const Icon = pkg.icon

    return (
        <Link
            href={pkg.url}
            target="_blank"
            className="flex flex-col h-full p-8 shadow-lg bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group"
        >
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 transition-all duration-300 shadow-sm">
                    <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {pkg.name}
                </h3>
            </div>
            <p className="text-gray-600 flex-grow leading-relaxed">
                {pkg.description}
            </p>
            <div className="flex items-center gap-3 mt-8 w-full mx-auto justify-center border rounded-lg p-2 group-hover:bg-blue-50 transition-all duration-300">
                <span className="text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                    GitHub repository
                </span>
                <Github className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-all duration-300" />
            </div>
        </Link>
    )
}

function CommunityCard() {
    return (
        <div className="flex flex-col h-full p-8 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group text-center bg-white cursor-pointer">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 transition-all duration-300 shadow-sm">
                    <Package className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Julia Ecosystem
                </h3>
            </div>
            <p className="text-gray-600 flex-grow leading-relaxed">
                RxInfer is built upon the incredible Julia ecosystem - its powerful packages for statistics and scientific computing make RxInfer possible.
            </p>
            <Link 
                href="https://julialang.org/packages/"
                target="_blank"
                className="flex items-center gap-3 mt-8 w-full mx-auto justify-center border rounded-lg p-2 group-hover:bg-blue-50 transition-all duration-300"
            >
                <span className="text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                    Explore Julia Packages
                </span>
                <ArrowRight className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-all duration-300" />
            </Link>
        </div>
    )
}

export default function Ecosystem() {
    return (
        <section id="ecosystem" className="w-full py-20">
            <BlockHeader
                id="ecosystem"
                title="Stable Ecosystem"
                subtitle="Unleash the power of Bayesian inference with our robust ecosystem of Julia packages"
                align="center"
            />
            
            <div className="mt-8 flex flex-col gap-12">
                <div className="text-center">
                    <p className="text-gray-600 text-lg">
                        If you like what we're doing, consider giving us a star! ⭐️
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map((pkg, index) => (
                        <PackageCard key={index} pkg={pkg} />
                    ))}
                    <CommunityCard />
                </div>
            </div>
        </section>
    )
}
