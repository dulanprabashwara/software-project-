import { NextResponse } from 'next/server';

// --- SERVER MEMORY STORAGE ---
let users = [
  { id: "RID0024", name: "Emma Richardson", email: "emma.richardson@gmail.com", type: "Premium", status: "Active", startDate: "01/02/2026", endDate: "02/01/2026", paymentMethod: "Credit Card" },
  { id: "RID0012", name: "Michael Chen", email: "michael.chen@gmail.com", type: "Premium", status: "Active", startDate: "15/01/2026", endDate: "15/02/2026", paymentMethod: "PayPal" },
  { id: "RID0060", name: "Sophia Martinez", email: "sophia.martinez@gmail.com", type: "Regular", status: "Banned", startDate: "10/12/2025", endDate: "10/01/2026", paymentMethod: "Debit Card" },
  { id: "RID0021", name: "Love Quinn", email: "love.quinn@gmail.com", type: "Premium", status: "Active", startDate: "20/01/2026", endDate: "20/02/2026", paymentMethod: "Credit Card" },
  { id: "RID0030", name: "John Smith", email: "john.smith@gmail.com", type: "Premium", status: "Active", startDate: "05/02/2026", endDate: "05/03/2026", paymentMethod: "Apple Pay" },
  { id: "RID0005", name: "Alison Dilaurentis", email: "alison.dilaurentis@gmail.com", type: "Regular", status: "Active", startDate: "12/01/2026", endDate: "12/02/2026", paymentMethod: "Credit Card" },
  { id: "RID0034", name: "Guinevere Beck", email: "guinevere.beck@gmail.com", type: "Regular", status: "Active", startDate: "18/01/2026", endDate: "18/02/2026", paymentMethod: "Credit Card" },
  { id: "RID0016", name: "David Rose", email: "david.rose@gmail.com", type: "Regular", status: "Banned", startDate: "01/01/2026", endDate: "01/02/2026", paymentMethod: "Debit Card" }
];

let posts = [
  { id: 1, title: "How AI is Transforming Content Creation", reason: "Spam", reporter: "System_Bot_99", timeReported: "7:30 PM", timeAgo: "2h ago", status: "pending", tags: ["AI", "Crypto", "Money"], image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop", content: "Artificial Intelligence is changing the game..." },
  { id: 2, title: "Best Books to Read on your Summer Holiday", reason: "Harassment", reporter: "Karen_Reader", timeReported: "6:15 PM", timeAgo: "5h ago", status: "pending", tags: ["Books", "Summer", "Opinion"], image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop", content: "Summer is here. But let's be honest..." },
  { id: 3, title: "Design Thinking: From Concept to Reality", reason: "False Report", reporter: "Competitor_X", timeReported: "5:00 PM", timeAgo: "1d ago", status: "reviewed", tags: ["Design", "UX", "Product"], image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=300&h=200", content: "A deep dive into the design thinking process..." },
  { id: 4, title: "Understanding Modern Architecture in Urban Spaces", reason: "False Report", reporter: "User_9921", timeReported: "10:15 AM", timeAgo: "3h ago", status: "pending", tags: ["Architecture", "Urban", "Design"], image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop", content: "An exploration of how modern architectural trends..." }
];

let auditLogs = [
  { id: 1, admin: "Admin Sarah", action: "Banned User", target: "user_bob_wilson", details: "Repeated policy violations", endpoint: "POST /api/users/{id}/ban", timestamp: "2026-01-05 14:32:15" },
  { id: 2, admin: "Admin Mike", action: "Deleted Article", target: "article_2254", details: "Spam content- Confirmed violations", endpoint: "DELETE /api/articles/{id}", timestamp: "2026-01-05 13:21:08" }
];

let adminProfile = {
  name: "Alex Johnson",
  role: "Super Admin",
  email: "alex.johnson@easyblogger.com",
  bio: "Product Designer & Writer. Passionate about UX design, systems, and the future of design creativity. Sharing insights on building better products.",
  lastLogin: "March 16, 2026, 08:15 AM", // In a real app, this updates on POST /login
  avatar: null, // NEW: Stores the uploaded profile picture
  stats: { actions: "0", resolved: "0", followers: "2.4K", following: "142" },
  permissions: ["Full Content Moderation", "User Data Access", "System API Management", "Audit Log Review", "AI Model Config"],
  sessions: [
    { id: 1, device: "Chrome / Windows 11", location: "Colombo, SL", status: "Active Now" },
    { id: 2, device: "Safari / iPhone 15", location: "Kandy, SL", status: "Last active 2 hours ago" }
  ],
  settings: { notifications: true, criticalAlerts: true, weeklyExport: false, lockedIp: null }
};

let offers = [
  { 
    id: 1, name: "Free Community", price: "0.00", duration: "Lifetime", status: "active", stripeId: "price_free", visibility: true,
    features: [
      { name: "3 AI Topic Suggestions / day", enabled: true },
      { name: "Basic SEO Check", enabled: true },
      { name: "Community Support", enabled: true },
      { name: "Full AI Article Generator", enabled: false }
    ]
  },
  { 
    id: 2, name: "Starter Writer", price: "4.99", duration: "Monthly", status: "active", stripeId: "price_starter", visibility: true,
    features: [
      { name: "Unlimited AI Topic Suggestions", enabled: true },
      { name: "Advanced SEO Tools", enabled: true },
      { name: "Ad-Free Reading", enabled: true },
      { name: "Full AI Article Generator", enabled: false }
    ]
  }
];

let scrapingSources = [
  { id: 1, name: "TechCrunch", url: "https://techcrunch.com/", category: "Technology", frequency: "Daily", minWordCount: 300, excludedKeywords: ["sponsored"], status: "active", topicsFound: 24, lastScraped: "2026-01-05 14:00:00" },
  { id: 2, name: "Medium Trending", url: "https://medium.com/trending", category: "Technology", frequency: "Daily", minWordCount: 300, excludedKeywords: [], status: "active", topicsFound: 15, lastScraped: "2026-01-05 14:00:00" },
  { id: 3, name: "Dev.to Top", url: "https://dev.to/top", category: "Technology", frequency: "Daily", minWordCount: 300, excludedKeywords: [], status: "active", topicsFound: 35, lastScraped: "2026-01-05 14:00:00" },
  { id: 4, name: "Hacker News", url: "https://news.ycombinator.com/", category: "Technology", frequency: "Daily", minWordCount: 300, excludedKeywords: [], status: "error", topicsFound: 0, lastScraped: "2026-01-04 10:00:00" }
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const adminFilter = searchParams.get('admin');
  
  if (type === 'logs') {
    const filtered = adminFilter && adminFilter !== "Admin" ? auditLogs.filter(log => log.admin === adminFilter) : auditLogs;
    return NextResponse.json(filtered);
  }
  if (type === 'posts') return NextResponse.json(posts);
  if (type === 'offers') return NextResponse.json(offers);
  if (type === 'adminProfile') {
    // REAL WORLD LOGIC: Dynamically calculate metrics based on actual system data
    const dynamicProfile = {
      ...adminProfile,
      stats: {
        ...adminProfile.stats,
        actions: auditLogs.length.toString(),
        resolved: posts.filter(p => p.status === 'reviewed').length.toString()
      }
    };
    return NextResponse.json(dynamicProfile);
  }
  
  if (type === 'scrapingSources') return NextResponse.json(scrapingSources);

  // NEW: Real-world URL Link Validation
  if (type === 'validateUrl') {
    const urlToTest = searchParams.get('url');
  try {
    // We use a timeout so the UI doesn't hang if the site is slow
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(urlToTest, { 
      method: 'HEAD', // HEAD is faster than GET as it doesn't download the whole page
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      return NextResponse.json({ valid: true, status: response.status });
    } else {
      return NextResponse.json({ valid: false, status: response.status, message: "Site returned an error" });
    }
  } catch (error) {
    return NextResponse.json({ valid: false, message: "Connection failed or Invalid URL" });
    }
  }

  if (type === 'dashboardStats') {
  // REAL-WORLD TRANSITION: 
  // Later, this will be: const totalUsers = await prisma.user.count();
    const dashboardData = {
      kpis: {
        pendingReports: 23,
        activePremiumUsers: 945,
        totalUsers: 2000,
        dailyEngagement: 5470
      },
    
      chartData: {
        labels: ['12/1/2025', '12/3/2025', '12/5/2025', '12/7/2025', '12/9/2025', '12/11/2025', '12/13/2025', '12/15/2025', '12/17/2025', '12/19/2025', '12/21/2025', '12/23/2025', '12/25/2025', '12/27/2025', '12/29/2025', '12/31/2025'],
        datasets: {
          reads: [180, 280, 200, 210, 175, 240, 250, 310, 320, 270, 290, 210, 200, 230, 340, 300, 310, 250, 270, 240, 300, 400, 375, 290, 335, 320, 295, 380, 450, 500], // Mapped to the 16 labels
          ratings: [210, 310, 230, 250, 215, 280, 290, 370, 360, 320, 330, 250, 250, 290, 420, 350, 350, 310, 310, 280, 370, 470, 460, 340, 410, 360, 350, 460, 530, 620],
          comments: [230, 330, 245, 270, 265, 220, 290, 305, 385, 375, 330, 355, 255, 260, 290, 430, 370, 360, 330, 335, 280, 350, 495, 485, 355, 430, 395, 365, 430, 540, 650]
        }
      }
    };
  
  // Condense datasets to match the 16 labels based on visual curve
    dashboardData.chartData.datasets.reads = [180, 270, 200, 210, 175, 240, 250, 310, 270, 215, 200, 340, 300, 260, 240, 310, 405, 370, 290, 335, 320, 295, 380, 450, 500].filter((_, i) => i % 2 === 0).slice(0, 16);
    dashboardData.chartData.datasets.ratings = [210, 300, 230, 250, 215, 280, 290, 370, 320, 250, 250, 420, 350, 310, 280, 370, 470, 340, 410, 360, 350, 460, 530, 620].filter((_, i) => i % 2 === 0).slice(0, 16);
    dashboardData.chartData.datasets.comments = [230, 330, 245, 270, 220, 290, 305, 385, 330, 255, 260, 430, 370, 330, 280, 350, 495, 355, 430, 395, 365, 430, 540, 650].filter((_, i) => i % 2 === 0).slice(0, 16);

    return NextResponse.json(dashboardData);
  }

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
      posts = posts.filter(p => String(p.id) !== String(body.postId));
    }
    if (actionType === 'updateProfile') {
      adminProfile = { ...adminProfile, ...body.updatedData };
    }
    
    // NEW: Security Handlers for IP and 2FA
    if (actionType === 'securityAction') {
      if (body.securityType === 'lockIP') {
        adminProfile.settings.lockedIp = body.ip;
      }
      if (body.securityType === 'revokeSession') {
        adminProfile.sessions = adminProfile.sessions.filter(s => s.id !== body.sessionId);
      }
    }
    
    if (actionType === 'upsertOffer') {
      if (body.isNew) {
        offers = [{ ...body.offer, id: Date.now() }, ...offers];
      } else {
        offers = offers.map(o => o.id === body.offer.id ? body.offer : o);
      }
    }

    if (actionType === 'addSource') {
    const newSource = {
      id: Date.now(),
      name: body.name,
      url: body.url,
      category: body.category,
      frequency: body.frequency,
      minWordCount: body.minWordCount,
      excludedKeywords: body.excludedKeywords,
      status: "active", // Starts active for the scraper to pick up
      topicsFound: 0,
      lastScraped: "Pending..."
    };
    scrapingSources.push(newSource);
  }

  if (actionType === 'deleteSource') {
    scrapingSources = scrapingSources.filter(s => s.id !== body.id);
  }

  if (actionType === 'editSource') {
      scrapingSources = scrapingSources.map(s => 
        s.id === body.source.id ? { ...s, ...body.source } : s
      );
    }
    
    // NEW: Handle Toggling the on/off switch
    if (actionType === 'toggleSourceStatus') {
      scrapingSources = scrapingSources.map(s => 
        s.id === body.id ? { ...s, status: body.status } : s
      );
    }

    const newLog = { 
      id: Date.now(), 
      admin: body.admin || "Admin Dulsi", 
      action: body.action, 
      target: body.target, 
      details: body.details || body.reason, 
      endpoint: body.endpoint || "POST /api/users", 
      timestamp: body.timestamp || new Date().toLocaleString() 
    };
    auditLogs.unshift(newLog); 
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Backend Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}