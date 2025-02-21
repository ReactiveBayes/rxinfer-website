import Link from 'next/link';
import { BookOpen, Code2 } from 'lucide-react';
import BlockHeader from './BlockHeader';

export default function WhatIsRxInfer() {
    return (
        <div>
            <p className="text-xl text-center text-gray-700 leading-relaxed mt-8 mb-16">
                Welcome to RxInfer.jl - a powerful Julia package for fast and flexible Bayesian inference. By combining message passing algorithms with model's graph structure, RxInfer makes probabilistic programming both efficient and accessible. Whether you're working on machine learning, signal processing, or complex statistical models, RxInfer provides the tools you need to solve real-world inference problems.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                <Link href="docs.rxinfer.ml" 
                      className="flex flex-col border border-2 border-blue-200 items-center p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-100 relative before:absolute before:inset-0 before:p-[2px] before:bg-gradient-to-r before:from-blue-500 before:to-indigo-600 before:rounded-lg before:-z-10">
                    <div className="p-4 rounded-full bg-gradient-to-br from-blue-600 to-indigo-300 mb-4">
                        <BookOpen className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Documentation</h3>
                    <p className="text-gray-600 text-center">
                        Learn how to use RxInfer with our comprehensive guides and API reference
                    </p>
                </Link>

                <Link href="examples.rxinfer.ml"
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
        </div>
    );
}