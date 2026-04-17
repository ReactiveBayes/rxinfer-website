'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Copy, Check, ExternalLink } from 'lucide-react'
import BlockHeader from './BlockHeader'

interface Citation {
    authors: string
    year: string
    title: string
    venue: string
    url: string
    bibtex: string
}

const citations: Citation[] = [
    {
        authors: "Bagaev, Dmitry and Podusenko, Albert and de Vries, Bert",
        year: "2023",
        title: "RxInfer: A Julia package for reactive real-time Bayesian inference",
        venue: "Journal of Open Source Software, 8(84), 5161",
        url: "https://doi.org/10.21105/joss.05161",
        bibtex: `@article{bagaev2023rxinfer,
  author  = {Bagaev, Dmitry and Podusenko, Albert and de Vries, Bert},
  title   = {{RxInfer: A Julia package for reactive real-time Bayesian inference}},
  journal = {Journal of Open Source Software},
  year    = {2023},
  volume  = {8},
  number  = {84},
  pages   = {5161},
  doi     = {10.21105/joss.05161}
}`
    },
    {
        authors: "Bagaev, Dmitry",
        year: "2023",
        title: "Reactive Probabilistic Programming for Scalable Bayesian Inference",
        venue: "PhD thesis, Eindhoven University of Technology",
        url: "https://research.tue.nl/en/publications/reactive-probabilistic-programming-for-scalable-bayesian-inferenc",
        bibtex: `@phdthesis{bagaev2023thesis,
  author = {Bagaev, Dmitry},
  title  = {{Reactive Probabilistic Programming for Scalable Bayesian Inference}},
  school = {Eindhoven University of Technology},
  year   = {2023},
  isbn   = {978-90-386-5904-6}
}`
    }
]

function CitationCard({ citation }: { citation: Citation }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(citation.bibtex)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex flex-col gap-4 p-6 rounded-2xl border-2 border-gray-100 bg-white hover:border-blue-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 shadow-sm shrink-0">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-bold text-gray-800 leading-snug">
                        {citation.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                        {citation.authors} ({citation.year}). <span className="italic">{citation.venue}</span>.
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3 mt-auto">
                <Link
                    href={citation.url}
                    target="_blank"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
                >
                    <ExternalLink className="w-4 h-4" />
                    View publication
                </Link>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4 text-green-600" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4" />
                            Copy BibTeX
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default function Citations() {
    return (
        <section id="citations" className="w-full py-20">
            <BlockHeader
                id="citations"
                title="Citing RxInfer"
                subtitle="RxInfer.jl is an MIT Licensed Open Source Project. If you use RxInfer.jl in your research, please consider citing our papers."
                align="center"
            />
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
                {citations.map((citation, index) => (
                    <CitationCard key={index} citation={citation} />
                ))}
            </div>
        </section>
    )
}
