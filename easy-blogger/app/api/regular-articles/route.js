
export async function GET() {

  // Normally fetch from DB here.
  // For now: sample data for unpublished regular articles.

  const articles = [
    {
      id: "a1",
      writerName: "Emma Richardson",
      date: "2025-12-04T10:30:00Z",
      title: "How AI is Transforming Content Creation in 2025",
      coverImage: "/images/Unpublished_IMG/robot.jpg",
      content:
        "Artificial intelligence has become an essential creative partner rather than just a productivity tool. In 2025, content creators rely on AI to generate outlines, refine tone, optimize headlines, and even suggest multimedia enhancements. However, the most impactful results happen when AI supports human creativity instead of replacing it. Writers now use AI to analyze audience engagement data, identify trending topics, and personalize content for specific reader segments. At the same time, ethical considerations such as originality, bias, and misinformation require careful human oversight. Successful creators understand that AI accelerates research and drafting, but authenticity, storytelling depth, and emotional connection still depend on human insight. The balance between automation and originality defines modern digital publishing.",
    },
    {
      id: "a2",
      writerName: "Emma Richardson",
      date: "2025-12-03T09:15:00Z",
      title: "The Complete Guide to Building Scalable Web Applications",
      coverImage: "/images/Unpublished_IMG/code.jpg",
      content:
        "Building a scalable web application requires thoughtful planning from the very beginning. Scalability is not just about handling more users; it is about maintaining consistent performance as traffic grows. A well-designed system separates concerns through modular architecture, efficient database queries, and optimized API endpoints. Caching strategies such as Redis can significantly reduce server load, while load balancers distribute traffic evenly across multiple instances. Developers must also monitor system metrics, including response time and database performance, to detect bottlenecks early. Writing clean, maintainable code ensures that teams can expand features without breaking existing functionality. Ultimately, scalability is achieved through proactive design decisions, continuous monitoring, and careful performance optimization.",
    },
    {
      id: "a3",
      writerName: "Emma Richardson",
      date: "2025-12-02T08:10:00Z",
      title: "UI/UX Principles for Modern Web Apps",
      coverImage: "/images/Unpublished_IMG/uiux.jpg",
      content:
        "Modern web applications succeed when they feel intuitive and effortless. Effective UI/UX design focuses on clarity, consistency, and usability rather than decoration. Clear typography hierarchy helps users quickly scan information, while consistent spacing improves readability and visual balance. Color choices should enhance contrast and accessibility, ensuring users can navigate comfortably. Interaction feedback, such as hover effects and loading indicators, builds trust by confirming user actions. Designers must also prioritize responsive layouts so applications work seamlessly across devices. Conducting user testing provides valuable insights into real-world behavior, revealing friction points that designers might overlook. Ultimately, strong UI/UX design transforms complex functionality into a smooth and engaging experience.",
    },
    {
      id: "a4",
      writerName: "Emma Richardson",
      date: "2025-12-01T11:45:00Z",
      title: "Optimizing React Performance for Large Projects",
      coverImage: "/images/Unpublished_IMG/react.jpg",
      content:
        "As React applications grow, performance optimization becomes increasingly important. Large component trees can trigger unnecessary re-renders, slowing down user interactions. Developers can improve performance by using memoization techniques like React.memo, useMemo, and useCallback to prevent redundant computations. Code splitting with dynamic imports reduces initial bundle size, improving load time. Managing state efficiently—keeping it as local as possible—prevents widespread re-renders across unrelated components. Virtualization libraries help render long lists without overloading the DOM. Additionally, profiling tools allow developers to identify performance bottlenecks and optimize critical paths. A performance-focused mindset ensures that even complex React applications remain responsive and scalable.",
    },
    {
      id: "a5",
      writerName: "Emma Richardson",
      date: "2025-11-30T14:05:00Z",
      title: "Best Practices for API Design in 2025",
      coverImage: "/images/Unpublished_IMG/api.jpg",
      content:
        "Well-designed APIs form the backbone of modern web applications. Clear and consistent endpoint naming conventions make APIs intuitive and easy to use. Implementing proper HTTP methods—GET, POST, PUT, DELETE—ensures predictable behavior. Pagination and filtering improve efficiency when handling large datasets. Error responses should provide meaningful messages that help developers diagnose issues quickly. Security is equally important, with authentication mechanisms such as JWT or OAuth protecting sensitive data. Versioning strategies prevent breaking changes from disrupting existing clients. Comprehensive documentation allows teams to collaborate effectively and accelerates development cycles. A thoughtfully structured API enhances reliability, maintainability, and long-term scalability.",
    },
    {
      id: "a6",
      writerName: "Emma Richardson",
      date: "2025-11-29T07:55:00Z",
      title: "PostgreSQL Tips for Content Platforms",
      coverImage: "/images/Unpublished_IMG/postgres.jpg",
      content:
        "PostgreSQL is a powerful database solution for content-driven platforms. Efficient schema design is crucial for handling relationships between authors, articles, categories, and tags. Indexing frequently queried columns significantly improves search speed, while GIN indexes enable efficient full-text search functionality. Avoiding unnecessary joins and selecting only required columns reduces query overhead. Database performance can also be improved by analyzing query execution plans to identify inefficiencies. Regular maintenance tasks, such as vacuuming and updating statistics, keep the database optimized. Implementing connection pooling ensures stable performance under heavy traffic. By combining thoughtful schema planning with consistent optimization practices, PostgreSQL can support high-performance content platforms.",
    },
    {
      id: "a7",
      writerName: "Emma Richardson",
      date: "2025-11-28T16:20:00Z",
      title: "Writing SEO-Friendly Articles Without Killing Readability",
      coverImage: "/images/Unpublished_IMG/code.jpg",
      content:
        "Creating SEO-friendly content requires a balance between optimization and natural writing. Articles should address clear search intent while maintaining a conversational and engaging tone. Structuring content with descriptive headings improves both readability and search engine visibility. Strategic keyword placement within titles, subheadings, and body text enhances ranking potential without appearing forced. Short paragraphs and concise sentences keep readers engaged. Including relevant internal and external links strengthens credibility and user navigation. Optimizing images with descriptive alt text further improves accessibility and discoverability. Most importantly, high-quality, informative content remains the primary ranking factor, ensuring that articles provide real value to readers while meeting SEO standards.",
    },
  ];

  return Response.json({ articles }, { status: 200 });
}