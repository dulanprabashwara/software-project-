import { NextResponse } from 'next/server';

// --- SERVER MEMORY STORAGE ---
let users = [
  { id: "RID0024", name: "Emma Richardson", email: "emma.richardson@gmail.com", type: "Premium", status: "Active" },
  { id: "RID0012", name: "Michael Chen", email: "michael.chen@gmail.com", type: "Premium", status: "Active" },
  { id: "RID0060", name: "Sophia Martinez", email: "sophia.martinez@gmail.com", type: "Regular", status: "Banned" },
  { id: "RID0021", name: "Love Quinn", email: "love.quinn@gmail.com", type: "Premium", status: "Active" },
  { id: "RID0030", name: "John Smith", email: "john.smith@gmail.com", type: "Premium", status: "Active" },
  { id: "RID0005", name: "Alison Dilaurentis", email: "alison.dilaurentis@gmail.com", type: "Regular", status: "Active" },
  { id: "RID0034", name: "Guinevere Beck", email: "guinevere.beck@gmail.com", type: "Regular", status: "Active" },
  { id: "RID0016", name: "David Rose", email: "david.rose@gmail.com", type: "Regular", status: "Banned" }
];

let posts = [
  {
    id: 1,
    title: "How AI is Transforming Content Creation",
    reason: "Spam",
    reporter: "System_Bot_99",
    timeReported: "7:30 PM",
    timeAgo: "2h ago",
    status: "pending", 
    tags: ["AI", "Crypto", "Money"],
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop",
    content: "Artificial Intelligence is changing the game. But why work hard when you can let the bot do it? I made $50,000 last month using this one simple trick. CLICK HERE TO CLAIM YOUR FREE BITCOIN: http://scam-link-crypto.com/register."
  },
  {
    id: 2,
    title: "Best Books to Read on your Summer Holiday",
    reason: "Harassment",
    reporter: "Karen_Reader",
    timeReported: "6:15 PM",
    timeAgo: "5h ago",
    status: "pending",
    tags: ["Books", "Summer", "Opinion"],
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop",
    content: "Summer is here. But let's be honest. If you are one of those pathetic people who reads romance novels on the beach, please do us all a favor and stay home."
  },
  {
    id: 3,
    title: "Design Thinking: From Concept to Reality",
    reason: "False Report",
    reporter: "Competitor_X",
    timeReported: "5:00 PM",
    timeAgo: "1d ago",
    status: "reviewed",
    tags: ["Design", "UX", "Product"],
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=300&h=200",
    content: "A deep dive into the design thinking process and how it can help teams solve complex problems."
  },
  {
    id: 4,
  title: "Understanding Modern Architecture in Urban Spaces",
  reason: "False Report",
  reporter: "User_9921",
  timeReported: "10:15 AM",
  timeAgo: "3h ago",
  status: "pending", 
  tags: ["Architecture", "Urban", "Design"],
  image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop",
  content: "An exploration of how modern architectural trends are reshaping city skylines and improving sustainable living in dense urban environments."
  }
];

let auditLogs = [
  { id: 1, admin: "Admin Sarah", action: "Banned User", target: "user_bob_wilson", details: "Repeated policy violations", endpoint: "POST /api/users/{id}/ban", timestamp: "2026-01-05 14:32:15" },
  { id: 2, admin: "Admin Mike", action: "Deleted Article", target: "article_2254", details: "Spam content- Confirmed violations", endpoint: "DELETE /api/articles/{id}", timestamp: "2026-01-05 13:21:08" }
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const adminFilter = searchParams.get('admin');

  if (type === 'logs') {
    // SERVER-SIDE FILTERING LOGIC
    const filtered = adminFilter && adminFilter !== "Admin" 
      ? auditLogs.filter(log => log.admin === adminFilter) 
      : auditLogs;
    return NextResponse.json(filtered);
  }
  
  if (type === 'posts') return NextResponse.json(posts);
  return NextResponse.json(users);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const actionType = searchParams.get('action');

    if (actionType === 'updateUser') {
      users = users.map(u => u.id === body.userId ? { ...u, status: body.newStatus } : u);
    } 
    if (actionType === 'reviewPost') {
      posts = posts.map(p => p.id === body.postId ? { ...p, status: 'reviewed' } : p);
    }
    if (actionType === 'deletePost') {
      posts = posts.filter(p => p.id !== body.postId);
    }

    const newLog = {
      id: Date.now(),
      admin: body.admin || "Admin Dulsi",
      action: body.action,
      target: body.target,
      details: body.details || body.reason,
      endpoint: body.endpoint,
      timestamp: body.timestamp || new Date().toLocaleString()
    };
    auditLogs.unshift(newLog);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}