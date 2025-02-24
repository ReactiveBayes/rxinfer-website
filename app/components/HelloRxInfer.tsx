'use client'

import BlockHeader from "./BlockHeader";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { ArrowRight, Sparkles, Zap, RefreshCw } from 'lucide-react'
import Link from 'next/link'

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
        title: "Generative Models",
        description: "Define probabilistic models with intuitive syntax",
        gradient: "from-green-50 to-blue-50",
        borderColor: "border-green-200"
    },
    {
        title: "Variational Constraints",
        description: "Customize inference with flexible constraints",
        gradient: "from-blue-50 to-purple-50",
        borderColor: "border-blue-200"
    },
    {
        title: "Graphical Models",
        description: "Let RxInfer choose the best inference procedure",
        gradient: "from-purple-50 to-pink-50",
        borderColor: "border-purple-200"
    }
]

const exampleCode = `using RxInfer

@model function generative_model(y)
    μ  ~ Normal(mean = 0.0, variance = 1.0)
    τ  ~ Gamma(shape = 1.0, rate = 1.0)
    y .~ Normal(mean = μ, precision = τ)
end

@constraints function mean_field()
    q(μ, τ) = q(μ)q(τ)
end

result = infer(
    model = generative_model(),
    data = load_dataset(),
    constraints = mean_field(),
    iterations = 10
)`;

export default function HelloRxInfer() {
    return (
        <section id="hello-rxinfer" className="w-full gap-12 py-20">
            <BlockHeader
                id="hello-rxinfer"
                title="Hello World with RxInfer"
                subtitle="Probabilistic programming made simple"
                align="center"
            />
            <div className="flex flex-col gap-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16">
                    <div className="flex flex-col gap-4">
                        <p className="text-lg text-gray-600 leading-relaxed">
                            RxInfer makes it easy to specify both generative models and variational constraints using familiar mathematical notation.
                            The flexible design lets you control exactly how inference should be performed.
                        </p>

                        {/* Feature Cards */}
                        <div className="space-y-4 mt-4">
                            {features.map((feature, index) => (
                                <FeatureCard key={index} {...feature} />
                            ))}
                        </div>
                    </div>

                    <div className="border border-gray-100 rounded-xl shadow-xl">
                        <SyntaxHighlighter
                            language="julia"
                            style={oneLight}
                            showLineNumbers
                            className="my-auto h-full"
                            customStyle={{
                                margin: 0,
                                borderRadius: '0.75rem',
                                fontSize: '0.875rem',
                            }}
                        >
                            {exampleCode}
                        </SyntaxHighlighter>
                    </div>
                </div>
                <div className="flex flex-col gap-4 items-center">
                    <p className="text-lg text-gray-600 leading-relaxed text-center mb-4">
                        Explore more interactive examples and discover the full potential of reactive Bayesian inference.
                    </p>
                    <Link 
                        href="https://examples.rxinfer.ml"
                        className="inline-flex items-center gap-2 px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-green-600 rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    >
                        View Examples
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
