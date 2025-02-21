'use client'

import BlockHeader from "./BlockHeader"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import Link from "next/link"

interface FeatureCardProps {
    title: string
    description: string
    gradient: string
    borderColor: string
}

function FeatureCard({
    title,
    description,
    gradient,
    borderColor
}: FeatureCardProps) {
    return (
        <div className={`group p-4 rounded-xl bg-gradient-to-r ${gradient} border ${borderColor}
            shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
            <div className="flex items-center gap-3 px-2">
                <div className="flex flex-col">
                    <h4 className="font-semibold text-gray-700">{title}</h4>
                    <p className="text-gray-600">
                        {description}
                    </p>
                </div>
            </div>

        </div>
    )
}

const features = [
    {
        title: "Lightning Fast",
        description: "Optimized message passing",
        gradient: "from-green-50 to-blue-50",
        borderColor: "border-green-200"
    },
    {
        title: "Real-time Processing",
        description: "Process data with minimal latency",
        gradient: "from-blue-50 to-purple-50",
        borderColor: "border-blue-200"
    },
    {
        title: "Resource Efficient",
        description: "Optimized CPU utilization",
        gradient: "from-purple-50 to-pink-50",
        borderColor: "border-purple-200"
    }
]

const performanceData = [
    {
        name: 'Time to convergence',
        RxInfer: 103.33,
        HMC: 33388.15,
    }
]

export default function RxInferIsFast() {
    return (
        <section className="w-full gap-12 py-20">
            <BlockHeader
                title="RxInfer is Fast"
                subtitle="Optimized for performance and scalability"
                align="center"
            />
            <div className="flex flex-col">
                <div className="flex flex-col gap-4 p-8">
                    <p className="text-lg text-gray-600 leading-relaxed text-center mb-8">
                        Below is a benchmark comparison between RxInfer's message passing algorithm and Hamiltonian Monte Carlo (HMC) on a linear dynamical system.
                        The benchmark measures time to convergence for inferring the posterior distribution.
                        As shown, on this problem RxInfer's optimized message passing achieves over <span className="font-semibold text-green-600">300x faster inference</span> results compared to traditional HMC sampling.
                    </p>
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart
                            data={performanceData}
                            layout="vertical"
                            margin={{ top: 0, right: 120, left: 0, bottom: 0 }}
                        >
                            <XAxis
                                type="number"
                                tick={{ fill: '#666' }}
                                label={{
                                    value: 'Milliseconds',
                                    position: 'bottom',
                                    fill: '#666'
                                }}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                hide={true}
                            />
                            <Bar
                                dataKey="RxInfer"
                                fill="#22c55e"
                                radius={4}
                                label={{
                                    position: 'right',
                                    fill: '#22c55e',
                                    fontSize: 18,
                                    fontWeight: 'bold',
                                    formatter: (value: number) => `RxInfer ${value.toFixed(2)}ms`
                                }}
                            />
                            <Bar
                                dataKey="HMC"
                                fill="#cbd5e1"
                                radius={4}
                                label={{
                                    position: 'right',
                                    fill: '#94a3b8',
                                    fontSize: 12,
                                    fontWeight: 'bold',
                                    formatter: (value: number) => `HMC ${value.toFixed(2)}ms`
                                }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex flex-row items-center gap-2">
                        <p className="text-sm flex-1 text-gray-500">
                            Smaller time is better
                        </p>
                        <Link
                            href="https://github.com/ReactiveBayes/RxInfer.jl/tree/main/benchmarks"
                            target="_blank"
                            className="text-sm font-medium border border-gray-200 hover:border-blue-300 text-gray-400 hover:text-blue-800 flex items-center gap-2 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors duration-200"
                        >
                            View benchmark details
                        </Link>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {features.map((feature, index) => (
                    <FeatureCard key={index} {...feature} />
                ))}
            </div>
        </section>
    )
}
