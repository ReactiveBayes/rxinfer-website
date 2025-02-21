'use client'

import Image from 'next/image'

export default function MainLogo() {
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-[650px]">
                <Image
                    src="/images/rxinfer-logo.svg"
                    alt="RxInfer Logo"
                    className="object-contain w-full h-auto"
                    width={150}
                    height={144}
                    priority
                />
            </div>
        </div>
    )
}