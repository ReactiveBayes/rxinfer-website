import Image from "next/image";
import MainLogo from "./components/MainLogo";
import AnimatedGraph from "./components/AnimatedGraph";
import WhyRxInfer from "./components/WhyRxInfer";
import HelloRxInfer from "./components/HelloRxInfer";
import RxInferIsFast from "./components/RxInferIsFast";
import ComplexProblems from "./components/ComplexProblems";
import YouTubeVideos from "./components/YouTubeVideos";
import Ecosystem from "./components/Ecosystem";
import StayInTouch from "./components/StayInTouch";
import Supporters from "./components/Supporters";
import WhatIsRxInfer from "./components/WhatIsRxInfer";
export default function Home() {
  return (
    <>
      <MainLogo />
      <AnimatedGraph />
      <div className="flex flex-col items-center justify-center max-w-6xl mx-auto px-8">
        <WhatIsRxInfer />
        <WhyRxInfer />
        <HelloRxInfer />
        <RxInferIsFast />
        <ComplexProblems />
        <YouTubeVideos />
        <Ecosystem />
        <Supporters />
        <StayInTouch />
      </div>
    </>

  );
}
