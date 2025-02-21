import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { NavBar } from './components/NavBar'
import GoogleTag from "./components/GoogleTag";

const lato = Lato({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lato',
});

export const metadata: Metadata = {
  title: "RxInfer.jl - Fast and Flexible Bayesian Inference",
  description: "RxInfer.jl is a Julia package for fast and flexible Bayesian inference, combining message passing and automatic differentiation for efficient probabilistic programming.",
  icons: {
    icon: [
      { url: '/images/favicon.svg' },  // SVG favicon
    ],
  },
  openGraph: {
    title: "RxInfer.jl - Fast and Flexible Bayesian Inference",
    description: "RxInfer.jl is a Julia package for fast and flexible Bayesian inference, combining message passing and automatic differentiation for efficient probabilistic programming.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RxInfer.jl - Fast and Flexible Bayesian Inference",
    description: "RxInfer.jl is a Julia package for fast and flexible Bayesian inference, combining message passing and automatic differentiation for efficient probabilistic programming.",
  },
  verification: {
    google: 'googlebd9cfe2856e26e83',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleTag />
      <body className={`${lato.variable} bg-white antialiased`} style={{ color: '#343a40' }}>
        <NavBar />
        <main className="pt-24 mb-24">
          {children}
        </main>
        <div className="pt-4 mb-4 text-center text-sm text-gray-600">
          <p>
            © BIASlab, 2022-2024, ReactiveBayes 2024-present
          </p>
        </div>
      </body>
    </html >
  );
}
