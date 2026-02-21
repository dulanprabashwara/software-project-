 
  export const DATA = {

    articles : [
      { id: 1,
        authorName: "Emma Richardson", 
        authorAvatar: "https://i.pravatar.cc/150?img=1", 
        verified: false, date: "Dec 4, 2025",
        title: "How AI is Transforming Content Creation in 2025", 
        content: "<p> <i>Spring</i> is the season that bridges cold, quiet months and the warmth of summer.As daylight grows longer, many plants respond by producing new leaves, buds, and blossoms. Trees that looked empty in winter begin to turn green, and gardens quickly fill with color. This change isn’t just pretty—it’s also a sign that ecosystems are waking up and becoming more active again.</p> <p> For people, spring often feels like a reset. The weather becomes more comfortable for walking, exercising, and spending time outdoors. In many places, it’s a popular time for cleaning, organizing, and starting new routines. Farmers and home gardeners prepare soil and plant seeds, taking advantage of milder temperatures and regular rainfall. Animals also adjust: birds return or migrate through, and insects reappear, helping pollinate flowers. </p><p> Spring doesn’t look the same everywhere. Some regions experience heavy rains,others get dry winds, and some barely feel a change at all. But the idea is similar: growth, movement, and a sense that something new is beginning.</p>",
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop", 
        comments: 42,
        likes: 4.8 
        },
      { id: 2, authorName: "Guinevere Beck", authorAvatar: "https://i.pravatar.cc/150?img=5", verified: true, date: "Oct 17, 2025", title: "Best Books to Read on your Summer Holiday", content: "Summer always lies to us. It promises ease, sunlit afternoons, reinvention. We believe it every year...", thumbnail: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop", comments: 28, likes: 4.6 },
        { id: 3, authorName: "Sophia Martinez", authorAvatar: "https://i.pravatar.cc/150?img=9", verified: false, date: "Dec 2, 2025", title: "Design Thinking: From Concept to Reality", content: "A deep dive into the design thinking process and how it can help teams solve complex problems...", thumbnail: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400&h=300&fit=crop", comments: 35, likes: 4.9 },
        { id: 4, authorName: "Michael Chen", authorAvatar: "https://i.pravatar.cc/150?img=11", verified: true, date: "Dec 1, 2025", title: "The Complete Guide to Building Scalable APIs", content: "Learn the best practices for designing and implementing RESTful APIs that can handle millions of requests...", thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop", comments: 67, likes: 4.7 }
    
    ],

    trending: [
    { title: "The Future of Remote Work: What 2025 Holds", author: "Sarah Chen" },
    { title: "Building Better Products with AI", author: "Marcus Rivera" },
    { title: "Places to visit this Spring", author: "Lexi Hernes" },
    { title: "Magic eyes", author: "Silvester Wilde" },
    { title: "Trees of York", author: "Chester Abernathy" }
  ],
  topics: ["Technology", "AI", "Lifestyle", "Startup", "Design", "Programming","health","nature","beauty"],
  
  usersToFollow: [
    { name: "David Miller", bio: "Tech writer", avatar: "https://i.pravatar.cc/150?img=12" },
    { name: "Sophia Anderson", bio: "UX designer", avatar: "https://i.pravatar.cc/150?img=25" },
    { name: "Mage Reston", bio: "Nature lover", avatar: "https://i.pravatar.cc/150?img=13" },
    { name: "Silena Boulevard", bio: "Beauty", avatar: "https://i.pravatar.cc/150?img=5" },
  ],
  savedArticles : [
       
      { id: 5, authorName: "Guinevere Beck", authorAvatar: "https://i.pravatar.cc/150?img=5", verified: true, date: "Oct 17, 2025", title: "Best Books to Read on your Summer Holiday", content: "Summer always lies to us. It promises ease, sunlit afternoons, reinvention. We believe it every year...", thumbnail: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop", comments: 28, likes: 4.6 },
        { id: 6, authorName: "Sophia Martinez", authorAvatar: "https://i.pravatar.cc/150?img=9", verified: false, date: "Dec 2, 2025", title: "Design Thinking: From Concept to Reality", content: "A deep dive into the design thinking process and how it can help teams solve complex problems...", thumbnail: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400&h=300&fit=crop", comments: 35, likes: 4.9 },
        { id: 7, authorName: "Michael Chen", authorAvatar: "https://i.pravatar.cc/150?img=11", verified: true, date: "Dec 1, 2025", title: "The Complete Guide to Building Scalable APIs", content: "Learn the best practices for designing and implementing RESTful APIs that can handle millions of requests...", thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop", comments: 67, likes: 4.7 }
    
    ],

    reactedArticles: [
  {
    id: 8,
    authorName: "Liam Carter",
    authorAvatar: "https://i.pravatar.cc/150?img=12",
    verified: false,
    date: "Nov 5, 2025",
    title: "Minimalism in the Digital Age",
    content:
      "In a world overwhelmed by notifications and endless feeds, digital minimalism offers a refreshing alternative. By focusing only on tools that truly add value, we can reclaim time, clarity, and focus...",
    thumbnail:
      "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=400&h=300&fit=crop",
    comments: 19,
    likes: 4.3,
  },
  {
    id: 9,
    authorName: "Ava Thompson",
    authorAvatar: "https://i.pravatar.cc/150?img=14",
    verified: true,
    date: "Nov 22, 2025",
    title: "Mastering Async JavaScript Patterns",
    content:
      "Asynchronous programming is at the heart of modern web applications. From callbacks to promises and async/await, understanding these patterns is crucial for building fast and scalable apps...",
    thumbnail:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop",
    comments: 42,
    likes: 4.8,
  },
  {
    id: 10,
    authorName: "Ethan Reynolds",
    authorAvatar: "https://i.pravatar.cc/150?img=18",
    verified: false,
    date: "Dec 10, 2025",
    title: "The Psychology Behind Habit Formation",
    content:
      "Habits shape the majority of our daily behavior. By understanding cue, routine, and reward loops, we can intentionally design habits that align with long-term goals and personal growth...",
    thumbnail:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&h=300&fit=crop",
    comments: 31,
    likes: 4.5,
  },
],
historyArticles: [
  {
  id: 11,
  authorName: "Noah Bennett",
  authorAvatar: "https://i.pravatar.cc/150?img=21",
  verified: true,
  date: "Dec 14, 2025",
  title: "Understanding Edge Computing in 2026",
  content:
    "As data generation accelerates, edge computing is transforming how information is processed. By moving computation closer to the source, businesses can reduce latency and improve real-time performance...",
  thumbnail:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
  comments: 54,
  likes: 4.7,
  read:"Dec 22, 2025"
},
{
  id: 12,
  authorName: "Isabella Wright",
  authorAvatar: "https://i.pravatar.cc/150?img=24",
  verified: false,
  date: "Dec 18, 2025",
  title: "Creative Routines of Successful Designers",
  content:
    "Creativity isn’t random inspiration—it’s structured practice. Many top designers follow disciplined routines that balance exploration, rest, and focused production...",
  thumbnail:
    "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=400&h=300&fit=crop",
  comments: 23,
  likes: 4.4,
  read:"Dec 17, 2025"
},
{
  id: 13,
  authorName: "Daniel Foster",
  authorAvatar: "https://i.pravatar.cc/150?img=28",
  verified: true,
  date: "Dec 21, 2025",
  title: "Building Secure Authentication Systems",
  content:
    "Security is no longer optional. From JWT tokens to OAuth flows and multi-factor authentication, modern systems must be built with protection at their core...",
  thumbnail:
    "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop",
  comments: 61,
  likes: 4.9,
  read:"Dec 2, 2025"
},
{
  id: 14,
  authorName: "Mia Sullivan",
  authorAvatar: "https://i.pravatar.cc/150?img=30",
  verified: false,
  date: "Dec 28, 2025",
  title: "How to Stay Focused in a Distracted World",
  content:
    "With constant notifications and competing priorities, maintaining deep focus has become a skill. By designing intentional work sessions and reducing digital clutter, productivity can dramatically improve...",
  thumbnail:
    "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=400&h=300&fit=crop",
  comments: 37,
  likes: 4.6,
  read:"Nov 30, 2025"
}

],
draftArticles:[
  {
  id: 15,
  authorName: "Emma Richardson",
  authorAvatar: "https://i.pravatar.cc/150?img=47",
  verified: true,
  date: "Jan 3, 2026",
  title: "The Rise of AI-Powered Personal Assistants",
  content:
    "Artificial intelligence is redefining productivity through intelligent personal assistants. From scheduling meetings to summarizing documents, AI tools are becoming indispensable in modern workflows...",
  thumbnail:
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop",
  comments: 48,
  likes: 4.8,
},
{
  id: 16,
  authorName: "Emma Richardson",
  authorAvatar: "https://i.pravatar.cc/150?img=47",
  verified: true,
  date: "Jan 8, 2026",
  title: "<<Add title>>",
  content:
    "Sustainability is becoming a central concern in technology development. From energy-efficient data centers to eco-friendly.???",
  thumbnail:
    "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=400&h=300&fit=crop",
  comments: 29,
  likes: 4.5,
}

],
publishedArticles: [
  {
  id: 17,
  authorName: "Emma Richardson",
  authorAvatar:" https://i.pravatar.cc/150?img=47" ,
  verified: true,
  date: "Dec 14, 2025",
  title: "Understanding Edge Computing in 2026",
  content:
    "As data generation accelerates, edge computing is transforming how information is processed. By moving computation closer to the source, businesses can reduce latency and improve real-time performance...",
  thumbnail:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
  comments: 54,
  likes: 4.7,
},
{
  id: 18,
  authorName: "Emma Richardson",
  authorAvatar: "https://i.pravatar.cc/150?img=47",
  verified: true,
  date: "Dec 18, 2025",
  title: "Creative Routines of Successful Designers",
  content:
    "Creativity isn’t random inspiration—it’s structured practice. Many top designers follow disciplined routines that balance exploration, rest, and focused production...",
  thumbnail:
    "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=400&h=300&fit=crop",
  comments: 23,
  likes: 4.4,
},
{
  id: 19,
  authorName: "Emma Richardson",
  authorAvatar: "https://i.pravatar.cc/150?img=47",
  verified: true,
  date: "Dec 21, 2025",
  title: "Building Secure Authentication Systems",
  content:
    "Security is no longer optional. From JWT tokens to OAuth flows and multi-factor authentication, modern systems must be built with protection at their core...",
  thumbnail:
    "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop",
  comments: 61,
  likes: 4.9,
},
{
  id: 14,
  authorName: "Emma Richardson",
  authorAvatar: "https://i.pravatar.cc/150?img=47",
  verified: true,
  date: "Dec 28, 2025",
  title: "How to Stay Focused in a Distracted World",
  content:
    "With constant notifications and competing priorities, maintaining deep focus has become a skill. By designing intentional work sessions and reducing digital clutter, productivity can dramatically improve...",
  thumbnail:
    "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=400&h=300&fit=crop",
  comments: 37,
  likes: 4.6,
}

],

scheduledArticles:[{
  id: 17,
  authorName: "Emma Richardson",
  authorAvatar: "https://i.pravatar.cc/150?img=47",
  verified: true,
  date: "Jan 12, 2026",
  title: "Why Simplicity Wins in Modern UI Design",
  content:
    "As digital products become more complex, simplicity becomes a competitive advantage. Clean interfaces, intentional spacing, and focused functionality help users achieve their goals faster and with less friction...",
  thumbnail:
    "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=400&h=300&fit=crop",
  comments: 34,
  likes: 4.7,
},
{
  id: 18,
  authorName: "Emma Richardson",
  authorAvatar: "https://i.pravatar.cc/150?img=47",
  verified: true,
  date: "Jan 18, 2026",
  title: "The Hidden Costs of Overengineering",
  content:
    "While robust systems are important, overengineering can slow teams down and introduce unnecessary complexity. Smart architecture balances scalability with maintainability...",
  thumbnail:
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop",
  comments: 41,
  likes: 4.9,
},
{
  id: 19,
  authorName: "Emma Richardson",
  authorAvatar: "https://i.pravatar.cc/150?img=47",
  verified: true,
  date: "Jan 22, 2026",
  title: "Content Strategy That Actually Converts",
  content:
    "Great content is not just about writing well—it’s about guiding readers toward meaningful action. By aligning storytelling with audience intent, brands can significantly improve engagement and conversion...",
  thumbnail:
    "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=400&h=300&fit=crop",
  comments: 27,
  likes: 4.4,
},
{
  id: 20,
  authorName: "Emma Richardson",
  authorAvatar: "https://i.pravatar.cc/150?img=47",
  verified: true,
  date: "Jan 28, 2026",
  title: "Building Digital Products with Long-Term Vision",
  content:
    "Successful products are not built for trends—they are built for longevity. Establishing a clear product vision helps teams prioritize features, maintain consistency, and deliver sustainable growth...",
  thumbnail:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&h=300&fit=crop",
  comments: 52,
  likes: 4.8,
}


]


  };
 


