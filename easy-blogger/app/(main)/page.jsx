"use client";

import { useState } from "react";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import ArticleCard from "../../components/article/ArticleCard";
import EngagementModal from "../../components/EngagementModal";

// This page will render the home feed UI based on Figma design
export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [engagementModalOpen, setEngagementModalOpen] = useState(false);
  const [engagementActiveTab, setEngagementActiveTab] = useState("followers");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  // Dummy data for articles
  const articles = [
    {
      id: 1,
      authorName: "Emma Richardson",
      authorAvatar: "https://i.pravatar.cc/150?img=1",
      verified: false,
      date: "Dec 4, 2025",
      title: "How AI is Transforming Content Creation in 2025",
      description:
        "Explore the latest developments in artificial intelligence and how they are revolutionizing the way we create, curate, and consume content across digital platforms.",
      thumbnail:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop",
      comments: 42,
      likes: 4.8,
    },
    {
      id: 2,
      authorName: "Guinevere Beck",
      authorAvatar: "https://i.pravatar.cc/150?img=5",
      verified: true,
      date: "Oct 17, 2025",
      title: "Best Books to Read on your Summer Holiday",
      description:
        "Summer always lies to us. It promises ease, sunlit afternoons, reinvention. We believe it every year. We imagine ourselves becoming softer, happier, more interesting.",
      thumbnail:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop",
      comments: 28,
      likes: 4.6,
    },
    {
      id: 3,
      authorName: "Sophia Martinez",
      authorAvatar: "https://i.pravatar.cc/150?img=9",
      verified: false,
      date: "Dec 2, 2025",
      title: "Design Thinking: From Concept to Reality",
      description:
        "A deep dive into the design thinking process and how it can help teams solve complex problems, innovate faster, and create products that truly resonate with users.",
      thumbnail:
        "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400&h=300&fit=crop",
      comments: 35,
      likes: 4.9,
    },
    {
      id: 4,
      authorName: "Michael Chen",
      authorAvatar: "https://i.pravatar.cc/150?img=11",
      verified: true,
      date: "Dec 1, 2025",
      title: "The Complete Guide to Building Scalable APIs",
      description:
        "Learn the best practices for designing and implementing RESTful APIs that can handle millions of requests while maintaining performance and reliability.",
      thumbnail:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop",
      comments: 67,
      likes: 4.7,
    },
    {
      id: 5,
      authorName: "Olivia Thompson",
      authorAvatar: "https://i.pravatar.cc/150?img=20",
      verified: false,
      date: "Nov 28, 2025",
      title: "Mindfulness in the Digital Age: Finding Balance",
      description:
        "In a world of constant notifications and endless scrolling, discover practical strategies to maintain mental clarity and cultivate presence in your daily life.",
      thumbnail:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      comments: 89,
      likes: 4.9,
    },
    {
      id: 6,
      authorName: "James Wilson",
      authorAvatar: "https://i.pravatar.cc/150?img=15",
      verified: true,
      date: "Nov 25, 2025",
      title: "Web3 and the Future of Decentralized Applications",
      description:
        "An exploration of blockchain technology beyond cryptocurrency, examining how decentralized apps are reshaping industries from finance to entertainment.",
      thumbnail:
        "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop",
      comments: 124,
      likes: 4.5,
    },
    {
      id: 7,
      authorName: "Sarah Kim",
      authorAvatar: "https://i.pravatar.cc/150?img=23",
      verified: false,
      date: "Nov 22, 2025",
      title: "The Art of Minimalist Web Design",
      description:
        "Less is more. Discover how stripping away unnecessary elements can create more powerful, user-friendly, and memorable digital experiences.",
      thumbnail:
        "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=400&h=300&fit=crop",
      comments: 51,
      likes: 4.8,
    },
    {
      id: 8,
      authorName: "David Park",
      authorAvatar: "https://i.pravatar.cc/150?img=33",
      verified: true,
      date: "Nov 20, 2025",
      title: "From Junior to Senior Developer: A Roadmap",
      description:
        "A comprehensive guide to advancing your software development career, covering technical skills, soft skills, and the mindset shifts required for growth.",
      thumbnail:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop",
      comments: 203,
      likes: 4.9,
    },
    {
      id: 9,
      authorName: "Emily Zhang",
      authorAvatar: "https://i.pravatar.cc/150?img=29",
      verified: false,
      date: "Nov 18, 2025",
      title: "Sustainable Tech: Building for a Greener Future",
      description:
        "How technology companies are reducing their environmental impact and how developers can write more energy-efficient code for a sustainable digital ecosystem.",
      thumbnail:
        "https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=400&h=300&fit=crop",
      comments: 76,
      likes: 4.6,
    },
    {
      id: 10,
      authorName: "Alex Rivera",
      authorAvatar: "https://i.pravatar.cc/150?img=52",
      verified: true,
      date: "Nov 15, 2025",
      title: "The Psychology of User Experience Design",
      description:
        "Understanding how cognitive biases, emotional triggers, and behavioral patterns influence user decisions can help create more intuitive and engaging products.",
      thumbnail:
        "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop",
      comments: 92,
      likes: 4.7,
    },
  ];

  // Dummy data for trending articles
  const trendingArticles = [
    {
      title: "The Future of Remote Work: What 2025 Holds",
      author: "Sarah Chen",
    },
    { title: "Building Better Products with AI", author: "Marcus Rivera" },
    { title: "Design Systems That Actually Work", author: "Emma Thompson" },
    { title: "The Rise of No-Code Development", author: "James Park" },
    { title: "Sustainable Tech: A New Era", author: "Olivia Martinez" },
  ];

  // Dummy data for recommended topics
  const topics = [
    "Technology",
    "AI",
    "Lifestyle",
    "Startup",
    "Productivity",
    "Design",
    "Programming",
    "Health",
  ];

  // Dummy data for who to follow
  const usersToFollow = [
    {
      name: "David Miller",
      bio: "Tech writer & entrepreneur",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    {
      name: "Sophia Anderson",
      bio: "UX designer & storyteller",
      avatar: "https://i.pravatar.cc/150?img=25",
    },
    {
      name: "Alex Chen",
      bio: "AI researcher & blogger",
      avatar: "https://i.pravatar.cc/150?img=33",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar
        isOpen={sidebarOpen}
        onOpenEngagement={() => setEngagementModalOpen(true)}
      />

      {/* Main content area - offset for fixed header and sidebar */}
      <main
        className={`pt-16 bg-white h-screen overflow-hidden transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-60" : "ml-0"
        }`}
      >
        <div className="flex h-full max-w-285">
          {/* Center: Article Feed - scrolls independently */}
          <div className="flex-1 px-8 py-8 border-r border-[#E5E7EB] overflow-y-auto h-[calc(100vh-64px)] scrollbar-hide">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {/* Right Sidebar - 300px, scrolls independently */}
          <aside className="w-75 shrink-0 bg-white px-6 py-8 overflow-y-auto h-[calc(100vh-64px)] scrollbar-hide">
            <div className="space-y-8">
              {/* Trending Articles */}
              <section>
                <h3 className="text-base font-bold text-[#111827] mb-4 font-serif">
                  Trending Articles
                </h3>
                <div className="space-y-4">
                  {trendingArticles.map((article, index) => (
                    <div
                      key={index}
                      className="flex gap-3 group cursor-pointer"
                    >
                      <span className="text-2xl font-bold text-[#E5E7EB] group-hover:text-[#1ABC9C] transition-colors duration-150">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[#111827] leading-tight group-hover:text-[#1ABC9C] transition-colors duration-150 line-clamp-2">
                          {article.title}
                        </h4>
                        <p className="text-xs text-[#6B7280] mt-1">
                          {article.author}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recommended Topics */}
              <section>
                <h3 className="text-base font-bold text-[#111827] mb-4 font-serif">
                  Recommended Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <button
                      key={topic}
                      className="px-4 py-2 bg-[#F8FAFC] hover:bg-[#1ABC9C] hover:text-white hover:border-[#1ABC9C] rounded-full text-sm text-[#111827] border border-[#E5E7EB] transition-colors duration-150"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </section>

              {/* Who to Follow */}
              <section>
                <h3 className="text-base font-bold text-[#111827] mb-4 font-serif">
                  Who to Follow
                </h3>
                <div className="space-y-4">
                  {usersToFollow.map((user, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[#111827]">
                          {user.name}
                        </h4>
                        <p className="text-xs text-[#6B7280] truncate">
                          {user.bio}
                        </p>
                      </div>
                      <button className="px-4 py-1.5 border border-[#1ABC9C] text-[#1ABC9C] rounded-full text-xs font-medium hover:bg-[#1ABC9C] hover:text-white transition-colors duration-150">
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </aside>
        </div>
      </main>

      {/* Engagement Modal */}
      <EngagementModal
        isOpen={engagementModalOpen}
        onClose={() => setEngagementModalOpen(false)}
        activeTab={engagementActiveTab}
        setActiveTab={setEngagementActiveTab}
      />
    </div>
  );
}
