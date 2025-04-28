import Link from 'next/link';
import { BookOpen, Code2, Server } from 'lucide-react';
import BlockHeader from './BlockHeader';

export default function WhatIsRxInfer() {
    return (
        <section id="what-is-rxinfer">
            <p className="text-xl text-center text-gray-700 leading-relaxed mt-8 mb-16">
                Welcome to RxInfer.jl - a powerful Julia package for fast and flexible Bayesian inference. By combining message passing algorithms with model's graph structure, RxInfer makes probabilistic programming both efficient and accessible. Whether you're working on machine learning, signal processing, or complex statistical models, RxInfer provides the tools you need to solve real-world inference problems.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                <Link href="https://docs.rxinfer.com"
                    className="flex flex-col border border-2 border-blue-200 items-center p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-100 relative before:absolute before:inset-0 before:p-[2px] before:bg-gradient-to-r before:from-blue-500 before:to-indigo-600 before:rounded-lg before:-z-10">
                    <div className="p-4 rounded-full bg-gradient-to-br from-blue-600 to-indigo-300 mb-4">
                        <BookOpen className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Documentation</h3>
                    <p className="text-gray-600 text-center">
                        Learn how to use RxInfer with our comprehensive guides and API reference
                    </p>
                </Link>

                <Link href="https://examples.rxinfer.com"
                    className="flex flex-col border border-2 border-green-200 items-center p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-100 relative before:absolute before:inset-0 before:p-[2px] before:bg-gradient-to-r before:from-green-500 before:to-emerald-600 before:rounded-lg before:-z-10">
                    <div className="p-4 rounded-full bg-gradient-to-br from-green-600 to-emerald-300 mb-4">
                        <Code2 className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Examples</h3>
                    <p className="text-gray-600 text-center">
                        Explore practical examples and tutorials to get started quickly
                    </p>
                </Link>
            </div>

            <div className="flex flex-col border border-2 border-purple-200 items-center p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-fuchsia-100 relative before:absolute before:inset-0 before:p-[2px] before:bg-gradient-to-r before:from-purple-500 before:to-fuchsia-600 before:rounded-lg before:-z-10">
                <div className="p-4 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-300 mb-4">
                    <Server className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">RxInfer In Other Languages</h3>
                <p className="text-gray-600 text-center mb-4">
                    Use RxInfer from your favorite programming language through our HTTP server
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center md:gap-8 w-full">
                    <Link
                        href="https://server.rxinfer.com"
                        className="flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                        <Server className="w-5 h-5 text-purple-600" />
                        <span className="text-purple-600 font-medium">RxInferServer</span>
                    </Link>
                    <Link
                        href="https://lazydynamics.github.io/RxInferClient.py/"
                        className="flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                        <Code2 className="w-5 h-5 text-purple-600" />
                        <span className="text-purple-600 font-medium">Python SDK</span>
                    </Link>
                    <Link
                        href="https://lazydynamics.github.io/RxInferClient.js/"
                        className="flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                        <Code2 className="w-5 h-5 text-purple-600" />
                        <span className="text-purple-600 font-medium">TypeScript SDK</span>
                    </Link>
                </div>
            </div>

        </section>
    );
}