"use client";

import { Button } from "./components/ui/button";
import MainLayout from "./main_layout";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  const handleStartDemo = () => {
    router.push("/login");
  };

  return (
    <div>
      <MainLayout />
      <div className="bg-gray-200">
        <div className="container mx-auto flex flex-col bg-white items-center pb-7 w-full text-lg leading-relaxed">
          <video
            src="/video/home_vid.mp4"
            loop
            autoPlay
            muted
            className="pt-5"
            playsInline
          />
          {/* Top paragraph */}
          <p className="mt-[30px] px-[5%]">
            Calculus transforms any handbag sketch or image into
            production-ready assets instantly, delivering both photorealistic 3D
            models and complete manufacturing tech packs in real-time. Our
            intuitive design tools enable further hyper-customizations to design
            and manufacture any configuration imaginable, from materials and
            dimensions to hardware and personalization &mdash; all with complete
            production specifications generated instantly. Starting with
            handbags, our technology will expand across all apparel and
            accessory categories, transforming the entire fashion industry. From
            picture to production in 60 seconds is now possible, welcome to the
            future of fashion.
          </p>
          {/* Second paragraph - align left */}
          <p className="mt-[15px] px-[5%] self-start">
            From picture to production in 60 seconds is now possible, welcome to
            the future of fashion.
          </p>
          {/* Highlighted benefit section */}
          <div className="grid md:grid-cols-2 items-center mt-[15px] px-[5%]">
            {/* Left image */}
            <div className="">
              <Image
                src="/video/pic1.jpg"
                alt="Benefits"
                className="max-w-[260px] w-full h-auto rounded-lg"
                width={260}
                height={180}
              />
            </div>
            {/* Right: Text */}
            <div>
              <p>
                This breakthrough fundamentally reconstructs the fashion
                industry&apos;s DNA by enabling brands to design 100x faster,
                move between collections rapidly without traditional lead times,
                and offer optional hyper-customization to end customers while
                maintaining both traditional manufacturing workflows, and yet
                integrate mass-customization for a truly sustainable
                manufacturing process. Large fashion houses can now test
                infinite design variations instantly, reduce sample costs by
                95%, and accelerate time-to-market from months to days, while
                manufacturers receive complete production specifications that
                eliminate costly iterations and communication delays.
              </p>
            </div>
          </div>
          {/* Bottom paragraph*/}
          <p className="mt-[15px] px-[5%]">
            At the core of this technological revolution is our proprietary
            intellectual property: we use AI to harness our novel DNA
            combinatorial algorithm that mimics the dual-stranded DNA kinetics
            in biology that creates limitless unique characteristics. In our
            case, that translates to the dual-strands of efficient designing and
            smart manufacturing &mdash; creating virtually infinite unique
            designs, and information to produce them as efficiently as possible.
          </p>
          <video
            src="/video/home_vid.mp4"
            loop
            autoPlay
            muted
            className="mt-3"
            playsInline
          />
          <Button className="mt-4" onClick={handleStartDemo}>
            Start Demo
          </Button>
        </div>
      </div>
    </div>
  );
}
