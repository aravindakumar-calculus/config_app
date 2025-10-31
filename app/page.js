"use client";

import { Button } from "./components/ui/button";
import MainLayout from "./main_layout";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleStartDemo = () => {
    router.push("/login");
  };

  return (
    <div>
      <MainLayout />
      <div className="bg-gray-100 flex flex-col justify-center h-[100vh]">
        <div className="bg-white border border-gray-300 rounded-lg shadow-md w-[90vw] max-w-7xl mx-auto px-6 py-8 flex flex-col items-center">
          {/* Heading */}
          <h2 className="text-lg italic text-center mb-4 font-semibold">
            The future of fashion is here
          </h2>

          {/* Intro box */}
          <div className="bg-gray-50 border border-gray-200 rounded px-4 py-3 text-center mb-6">
            Calculus takes you from a fashion idea to industrial production in
            minutes, not months.
          </div>

          {/* Main description */}
          <p className="text-base text-center mb-6">
            Transform your handbag sketch, descriptive text, or a reference
            image into a real 3D model that can be further hyper-customized,
            while auto-generating advanced tech pack for seamless integration
            into sampling and production workflows.
          </p>

          {/* Emphasized line */}
          <p className="italic text-center mb-6 font-medium">
            – all this can be done in less than a minute!
          </p>

          {/* Algorithm paragraph */}
          <p className="text-base text-center mb-6">
            Our breakthrough fashion design algorithm is inspired by cellular
            mechanisms (yes!) that have evolved over millions of years to yield
            predictable error-free results.
          </p>

          {/* AI box */}
          <div className="bg-gray-50 border border-gray-200 rounded px-4 py-3 text-center mb-6">
            With a pinch of artificial intelligence incorporated in our
            architecture,
            <br />
            we harness nature’s logic to create fashion magic.
          </div>

          {/* Demo Button */}
          <Button className="mt-2 mb-6" onClick={handleStartDemo}>
            Demo
          </Button>

          {/* Contact info */}
          <div className="text-center text-sm text-gray-600">
            connect@calculus-ai.com to chat how we can fashion change
          </div>
        </div>
      </div>
    </div>
  );
}
