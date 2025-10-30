"use client";
import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/store/useStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function Page() {
  const [username, setUsername] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const router = useRouter();
  const login = useStore((s) => s.login);

  const validuser = "123";
  const validpwd = "123";

  const handleLogIn = (e) => {
    e.preventDefault();
    if (username === validuser && pwd === validpwd) {
      setError("");
      login();
      router.push("/designmodule");
    } else {
      setError("Username or password is wrong");
    }
  };

  return (
    <div className="h-screen bg-gray-300 flex justify-center items-center">
      <form
        className="flex flex-col gap-6 w-full max-w-sm rounded-lg bg-white border border-gray-300 shadow-lg p-8"
        onSubmit={handleLogIn}
      >
        <h1 className="text-2xl font-bold text-center mb-2">Login Page</h1>
        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="font-medium">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="passwrd" className="font-medium">
            Password
          </label>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              id="passwrd"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 w-full pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowPwd((v) => !v)}
              tabIndex={-1}
            >
              <FontAwesomeIcon icon={showPwd ? faEye : faEyeSlash} />
            </button>
          </div>
        </div>
        <Button type="submit" className="mt-2">
          Log In
        </Button>
        {error && (
          <p className="text-red-500 text-sm text-center mt-2">{error}</p>
        )}
      </form>
    </div>
  );
}
