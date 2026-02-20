"use client";

import { useState } from "react";
import RightFeed from "../../../components/article/RightFeed";
import { DATA } from "../../../components/article/ArticleList";
import Published from "./published/Published";
import Unpublished from "./unpublished/Unpublished";
import Scheduled from "./scheduled/Scheduled";

export default function Layout({ children }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex h-full overflow-hidden mx-auto">
      {/* Left */}
<div className="h-full flex flex-col flex-1 min-w-0">
  
  {/* Header + Tabs (fixed area) */}
  <div className="  p-3 border-b border-[#e5e7eb] px-8">
    <h1 className="text-4xl font-bold mb-0 ">
      Stories
    </h1>

    <div className="flex gap-10">
      {["unpublished", "published","scheduled"].map((t, i) => (
        <button
          key={i}
          onClick={() => setActive(i)}
          className={`py-3 font-semibold ${
            active === i
              ? "text-black underline underline-offset-8"
              : "text-gray-500"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  </div>

  {/* Scrollable content ONLY */}
  <div className=" h-full flex-1 overflow-y-auto">
  {active === 0 && <Unpublished/>}
  {active === 1 && <Published/>}
  {active === 2 && <Scheduled/>}
   
</div>

</div>


      {/* Right */}
      <aside className="hidden lg:block w-80 overflow-y-auto ml-auto">
        <RightFeed
          trending={DATA.trending}
          topics={DATA.topics}
          usersToFollow={DATA.usersToFollow}
        />
      </aside>
    </div>
  );
}
