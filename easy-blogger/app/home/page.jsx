"use client";

import { DATA } from "../../components/article/ArticleList";
import MainFeed from "../../components/article/MainFeed";
import RightFeed from "../../components/article/RightFeed";

export default function HomePage() {
  return (
    <>
      {/* Main Feed */}
      <div className=" flex h-full overflow-hidden">
        <div className=" p-8 mx-auto h-full overflow-y-auto flex-1">
        <MainFeed articles={DATA.articles} />
      </div>

      {/* Right Feed */}
      <div className="w-80 flex-none h-full overflow-y-auto">
        <RightFeed
          trending={DATA.trending}
          topics={DATA.topics}
          usersToFollow={DATA.usersToFollow}
        />
      </div>

      </div>
      
    </>
  );
}
