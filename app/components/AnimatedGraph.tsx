'use client'

import Script from "next/script";

export default function AnimatedGraph() {
  return <>
    <Script
      src="https://cdnjs.cloudflare.com/ajax/libs/antv-g6/4.5.5/g6.min.js"
      strategy="beforeInteractive"
    />
    <Script
      src="/js/graph.js"
      strategy="afterInteractive"
    />
    <div className="w-full min-h-[600px] relative left-0 overflow-hidden">
      <div className="absolute inset-0">
        <Placeholder />
      </div>
      <div id="landing-graph" className="landing-graph" style={{ width: '100%', height: '100%', position: 'absolute', overflow: 'visible', opacity: 0 }}>

      </div>
    </div>
  </>
}

function Placeholder() {
  return (
    <div id="landing-graph-placeholder" className="flex items-center justify-center w-full h-full">
      <div className="grid grid-cols-8 gap-4 sm:gap-8 lg:gap-12 relative">
        {/* Row 1 */}
        <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-blue-100 border-2 border-blue-300 rounded-lg lg:rounded-xl animate-pulse"></div>
        <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-red-100 border-2 border-red-300 rounded-lg lg:rounded-xl animate-pulse delay-75"></div>
        <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-green-100 border-2 border-green-300 rounded-lg lg:rounded-xl animate-pulse delay-150"></div>
        <div className="w-10 h-10 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-purple-100 border-2 border-purple-300 rounded-lg lg:rounded-xl animate-pulse delay-100"></div>

        {/* Row 2 */}
        <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-purple-100 border-2 border-purple-300 rounded-lg lg:rounded-xl animate-pulse delay-75"></div>
        <div className="w-10 h-10 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-blue-100 border-2 border-blue-300 rounded-lg lg:rounded-xl animate-pulse delay-150"></div>
        <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-red-100 border-2 border-red-300 rounded-lg lg:rounded-xl animate-pulse delay-100"></div>
        <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-green-100 border-2 border-green-300 rounded-lg lg:rounded-xl animate-pulse delay-75"></div>

        {/* Row 3 */}
        <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-green-100 border-2 border-green-300 rounded-lg lg:rounded-xl animate-pulse delay-150"></div>
        <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-purple-100 border-2 border-purple-300 rounded-lg lg:rounded-xl animate-pulse delay-100"></div>
        <div className="w-10 h-10 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-blue-100 border-2 border-blue-300 rounded-lg lg:rounded-xl animate-pulse delay-75"></div>
        <div className="w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-red-100 border-2 border-red-300 rounded-lg lg:rounded-xl animate-pulse"></div>

        {/* Row 4 */}
        <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-red-100 border-2 border-red-300 rounded-lg lg:rounded-xl animate-pulse delay-100"></div>
        <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-green-100 border-2 border-green-300 rounded-lg lg:rounded-xl animate-pulse delay-75"></div>
        <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-purple-100 border-2 border-purple-300 rounded-lg lg:rounded-xl animate-pulse"></div>
        <div className="w-10 h-10 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-blue-100 border-2 border-blue-300 rounded-lg lg:rounded-xl animate-pulse delay-150"></div>

      </div>
    </div>
  )
}