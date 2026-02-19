import { NextResponse } from 'next/server';

// Mock article data
const mockGeneratedArticle = {
  title: "The Rise of AI",
  content: `Artificial Intelligence (AI) is transforming industries and daily life in unprecedented ways. From healthcare to finance, education to entertainment, AI technologies are reshaping how we work, learn, and interact with the world around us.

Machine Learning and Deep Learning: These are subsets of AI that focus on algorithms and statistical models that enable computers to perform tasks without explicit instructions. Blogs like Machine Learning Mastery and KDnuggets provide tutorials and insights into these areas, making them accessible for beginners and experts.

Natural Language Processing (NLP): This field enables machines to understand and interpret human language. The OpenAI Blog is a great resource for updates on advancements in NLP, including applications like ChatGPT and DALL-E.

Ethics and AI Safety: As AI systems become more integrated into society, ethical considerations regarding their use are paramount. Blogs like Anthropic delve into the moral implications of AI, discussing topics such as AI alignment and responsibility.

AI in Business: Many blogs focus on how AI is reshaping business practices. MarkTechPost and AI Magazine cover the latest trends and tools that businesses can leverage to enhance their operations and customer experiences.

Future of AI
The future of AI holds exciting possibilities, from more advanced language models to improved machine learning algorithms. Staying updated with AI blogs and research papers will help you remain at the forefront of this technological revolution.

Conclusion
Whether you're a developer, researcher, or simply curious about AI, there's a wealth of information available through dedicated AI blogs and resources. The key is to find reliable sources that provide accurate, up-to-date information about this rapidly evolving field.`
};

// Mock articles list
const mockArticles = [
  {
    id: "1",
    title: "Understanding Machine Learning Fundamentals",
    date: "2024-01-15 10:30 AM"
  },
  {
    id: "2", 
    title: "The Future of Natural Language Processing",
    date: "2024-01-14 2:45 PM"
  },
  {
    id: "3",
    title: "AI Ethics and Responsible Development",
    date: "2024-01-13 9:15 AM"
  },
  {
    id: "4",
    title: "Deep Learning Applications in Healthcare",
    date: "2024-01-12 4:20 PM"
  },

];

export async function GET() {
  return NextResponse.json({
    generatedArticle: mockGeneratedArticle,
    articles: mockArticles
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // FUTURE POSTGRESQL LOGIC:
    // const result = await prisma.articles.create({ data: body });
    
    console.log("📝 Article Data Captured for PostgreSQL Table:");
    console.log(`- Article Data: [Title: ${body.title}, Content Length: ${body.content?.length || 0}]`);

    return NextResponse.json({ success: true, data: body }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
