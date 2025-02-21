'use client'

import Script from "next/script";

export default function AnimatedGraph() {
  return <>
    <Script 
      src="https://cdnjs.cloudflare.com/ajax/libs/antv-g6/4.5.5/g6.min.js"
      onLoad={() => {
        const script = document.createElement('script')
        script.src = '/js/graph.js'
        document.body.appendChild(script)
      }}
    />
    <div className="w-full min-h-[600px] relative left-0 overflow-hidden">
      <div id="landing-graph" className="landing-graph" style={{width: '100%', height: '100%', position: 'absolute', overflow: 'visible'}}></div>
    </div>
  </>
}
