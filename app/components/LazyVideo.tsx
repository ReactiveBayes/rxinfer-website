'use client'

import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";

import { useIsVisible } from "@/app/hooks/useIsVisible";

type VideoComponentProps = {
    src: string;
    poster?: string;
    alt?: string;
    style?: CSSProperties;
};
export const VideoComponent = ({
    src,
    poster,
    style,
    alt,
}: VideoComponentProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const { isVisible, targetRef } = useIsVisible(
        {
            root: null,
            rootMargin: "200px",
            threshold: 0.1,
        },
        false,
    );

    const videoRef = useRef<HTMLVideoElement>(null);

    const startVideoOnMouseMove = useCallback(async () => {
        try {
            if (videoRef.current) {
                await videoRef.current.play();
                setIsPlaying(true);
            }
        } catch (e) {
            // do nothing
        }
    }, []);

    const stopVideoOnMove = useCallback(() => {
        try {
            if (videoRef.current) {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        } catch (e) {
            // do nothing
        }
    }, []);

    useEffect(() => {
        if (isVisible) {
            startVideoOnMouseMove();
        } else {
            stopVideoOnMove();
        }
    }, [isVisible, startVideoOnMouseMove, stopVideoOnMove]);

    return (
        <span
            ref={targetRef as any}
            className="relative min-h-[50px] h-full"
        >
            <div className={`absolute inset-0 bg-white border border-4 border-blue-500/20 rounded-lg transition-opacity duration-300 ${isPlaying ? "opacity-0" : "opacity-100"}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500/80 rounded-full animate-spin"></div>
                </div>
            </div>
            <video
                ref={videoRef}
                loop
                muted
                autoPlay={false}
                preload="none"
                playsInline
                poster={poster}
                aria-label={alt}
                style={{
                    objectFit: "contain",
                    display: "block",
                    width: "100%",
                    height: "100%",
                    ...style,
                }}
            >
                <source src={src} type="video/webm" />
                Your browser does not support the video tag. Please try viewing this
                page in a modern browser.
            </video>
        </span>
    );
};