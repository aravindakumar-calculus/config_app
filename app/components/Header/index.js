"use client";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { useRouter, usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

export default function Header() {
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  const logout = useStore((s) => s.logout);
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  // Determine active page
  const isDesign = pathname === "/designmodule";
  const isProd = pathname === "/productionmodule";

  return (
    <nav className="bg-white px-8 py-4 shadow flex items-center border-1 border-gray-300">
      {/* Left: Design Module Button */}
      <div className="flex items-center basis-1/4">
        <button
          className={`px-4 py-2 rounded-lg font-medium mr-2 ${
            isDesign
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          disabled={isDesign}
          onClick={() => !isDesign && router.push("/designmodule")}
        >
          Design Module
        </button>
      </div>
      {/* Center: Logo */}
      <div className="flex-1 flex justify-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-4xl tracking-widest font-sans text-black">
            CALCULUS DEMO
          </span>
        </Link>
      </div>
      {/* Right: Production Module Button & Logout */}
      <div className="flex items-center space-x-4 justify-end basis-1/4">
        <button
          className={`px-4 py-2 rounded-lg font-medium ${
            isProd
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          disabled={isProd}
          onClick={() => !isProd && router.push("/productionmodule")}
        >
          Production Module
        </button>
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="flex items-center px-1 py-1 text-red-600 hover:text-red-500 rounded"
            title="Logout"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
          </button>
        )}
      </div>
    </nav>
  );
}
