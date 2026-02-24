"use client";

import { useRouter, usePathname } from "next/navigation";

export default function Layout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = pathname.includes("/stats/public");
  const isPrivate = pathname.includes("/stats/private");

  return (
    <div className="mx-auto overflow-hidden bg-white min-h-0   scale-90">
      <div className="flex justify-between text-[1.75rem] px-50 py-4 h-full font-[Georgia] overflow-hidden">
        <button
          onClick={() => router.push("/stats/public")}
          className={isPublic ? "text-[#1abc9c] bg-[#f0fdf9] px-7 rounded-[2rem]"  : "text-[#6b6b6b] px-7 rounded-[2rem]"}
        >
          Public
        </button>

        <button
          onClick={() => router.push("/stats/private")}
          className={isPrivate ?"text-[#1abc9c] bg-[#f0fdf9] px-7 rounded-[2rem]": "text-[#6b6b6b] px-7 rounded-[2rem]"}
        >
          Private
        </button>
      </div>

      <div className="px-5 bg-white flex-1  min-h-screen h-full w-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}