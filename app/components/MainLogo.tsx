'use client'

import Image from 'next/image'

export default function MainLogo() {
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="w-[400px] sm:w-[350px] md:w-[500px] lg:w-[650px]">
                <Image
                    src="/images/rxinfer-logo.svg"
                    alt="RxInfer Logo"
                    className="object-contain w-full h-auto"
                    width={450}
                    height={144}
                    priority
                />
            </div>
            <p className="mt-2 text-gray-600 sm:text-sm md:text-md lg:text-lg">
                Automatic Bayesian Inference through <span className="font-bold">Reactive Message Passing</span>
            </p>
        </div>
    )
}