import { NextResponse } from "next/server";

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
Whether you're a developer, researcher, or simply curious about AI, there's a wealth of information available through dedicated AI blogs and resources. The key is to find reliable sources that provide accurate, up-to-date information about this rapidly evolving field.`,
};

// Mock articles list with detailed information
const mockArticles = [
  {
    id: "1",
    title: "Understanding Machine Learning Fundamentals",
    date: "2024-01-15 10:30 AM",
    textPrompt:
      "Write an article on artificial intelligence and machine learning fundamentals for beginners",
    keywordsPresented: [
      "Algorithms",
      "Deep learning",
      "Neural networks",
      "Machine learning",
      "Computer science",
      "Computer vision",
      "Robotics",
      "Artificial intelligence",
      "Work automation",
      "AI services",
    ],
    keywordsSelected: ["Machine learning", "Artificial intelligence"],
    articleLengthSelected: "short",
    toneSelected: "professional",
    content: `Artificial Intelligence (AI) and Machine Learning (ML) are transforming the way we interact with technology and understand the world around us. For beginners, these concepts might seem complex, but they represent some of the most exciting technological advances of our time.

Machine Learning is a subset of AI that focuses on algorithms and statistical models that enable computers to perform tasks without explicit instructions. Instead of being programmed with specific rules, ML systems learn patterns from data, allowing them to make predictions and decisions.

The foundation of machine learning lies in training data. When we feed an algorithm large amounts of labeled data, it learns to recognize patterns and relationships. For example, by showing a system thousands of cat images labeled as "cat," it learns to identify cats in new, unseen images.

There are three main types of machine learning: supervised learning, where the algorithm learns from labeled data; unsupervised learning, where it finds patterns in unlabeled data; and reinforcement learning, where it learns through trial and error with rewards and penalties.

Deep Learning, a subset of machine learning, uses neural networks with multiple layers to process complex patterns. These networks are inspired by the human brain's structure and are particularly effective for tasks like image recognition, natural language processing, and speech recognition.

For beginners, the key is to start with the basics: understand that AI is about making machines smart, ML is about teaching them from data, and deep learning is about using complex neural networks to solve sophisticated problems.

As you dive deeper, you'll discover tools and frameworks like TensorFlow, PyTorch, and scikit-learn that make implementing these concepts more accessible. The field is constantly evolving, offering endless opportunities for innovation and discovery.`,
    regeneratedArticles: [
      {
        title: "Regenerated: Understanding Machine Learning Fundamentals",
        content: `Machine Learning Fundamentals represent one of the most accessible entry points into the world of Artificial Intelligence. This comprehensive guide will help beginners understand the core concepts that power today's AI revolution.

At its heart, Machine Learning is about teaching computers to learn from experience. Just as humans learn from examples and practice, ML systems improve their performance by processing data and identifying patterns. This approach differs from traditional programming, where developers write explicit rules for every possible scenario.

The learning process begins with data. Quality datasets are the foundation of any successful ML project. When training a model, we typically split our data into training sets (for learning), validation sets (for tuning), and test sets (for final evaluation). This ensures our model can generalize to new, unseen situations.

Supervised learning is the most common approach for beginners. It's like learning with a teacher - the algorithm receives input data along with correct answers (labels). Common supervised learning tasks include classification (categorizing data) and regression (predicting continuous values).

Unsupervised learning explores data without predefined labels, discovering hidden patterns and structures. Clustering algorithms group similar data points, while dimensionality reduction techniques simplify complex datasets while preserving important information.

Reinforcement learning learns through interaction with an environment, receiving rewards for desired actions and penalties for mistakes. This approach powers game-playing AI, robotics, and autonomous systems.

Practical implementation often starts with libraries like scikit-learn for classical ML algorithms, then progresses to deep learning frameworks like TensorFlow or PyTorch for neural networks. These tools abstract away much of the mathematical complexity, allowing beginners to focus on problem-solving and application development.`,
      },
      {
        title: "Regenerated: Understanding Machine Learning Fundamentals",
        content: `Getting started with Machine Learning doesn't require a PhD in mathematics or computer science. Modern tools and resources have made this field accessible to anyone with curiosity and determination to learn.

Think of Machine Learning as teaching a computer to recognize patterns. When you show a child pictures of different animals and tell them what each one is called, they learn to identify similar animals independently. Machine Learning works similarly, but with data instead of pictures.

The journey typically begins with understanding your data. Before any algorithm can learn, you need to know what you're trying to predict or classify. Are you trying to identify spam emails? Predict house prices? Recognize faces in photos? Each problem requires different approaches and data types.

Data preparation is often the most time-consuming part of ML projects. You'll need to clean your data (handle missing values, remove duplicates), transform it (normalize features, encode categorical variables), and split it appropriately for training and testing.

Choosing the right algorithm depends on your problem type and data characteristics. Linear regression works well for predicting continuous values, decision trees excel at classification tasks, and neural networks shine with complex patterns in large datasets.

The learning process involves feeding your algorithm training data and letting it adjust its internal parameters to minimize errors. This optimization happens automatically, but understanding concepts like loss functions, gradient descent, and overfitting helps you debug and improve your models.

Evaluation is crucial. You need to know if your model actually works on new data. Metrics like accuracy, precision, recall, and F1-score help you assess performance and compare different approaches.

The field offers endless specializations - from computer vision and natural language processing to reinforcement learning and automated machine learning. Start with the fundamentals, practice on real datasets, and gradually explore areas that interest you most.`,
      },
    ],
  },
  {
    id: "2",
    title: "The Future of Natural Language Processing",
    date: "2024-01-14 2:45 PM",
    textPrompt:
      "Explore the future of NLP and how AI is transforming human-computer communication",
    keywordsPresented: [
      "Algorithms",
      "Deep learning",
      "Neural networks",
      "Machine learning",
      "Computer science",
      "Computer vision",
      "Robotics",
      "Artificial intelligence",
      "Work automation",
      "AI services",
    ],
    keywordsSelected: [
      "Deep learning",
      "Neural networks",
      "Artificial intelligence",
    ],
    articleLengthSelected: "mid-length",
    toneSelected: "casual",
    content: `Natural Language Processing (NLP) is experiencing a revolutionary transformation, thanks to advances in deep learning and neural networks. The way humans communicate with machines is evolving at an unprecedented pace, opening up new possibilities for interaction and understanding.

The journey of NLP began with rule-based systems that struggled with the complexity and ambiguity of human language. These early systems could handle simple tasks but failed when faced with nuanced expressions, idioms, or context-dependent meanings.

The breakthrough came with the introduction of neural networks and transformer architectures. Models like BERT, GPT, and their successors have demonstrated remarkable capabilities in understanding context, generating coherent text, and even exhibiting reasoning abilities.

What makes modern NLP systems special is their ability to understand context. Unlike earlier systems that processed words in isolation, transformer-based models consider the entire context of a conversation or document, allowing them to grasp subtle meanings and relationships.

The applications are already transforming our daily lives. Virtual assistants like Siri and Alexa have become more conversational and helpful. Language translation services can now handle complex sentences and maintain cultural nuances. Content creation tools can generate articles, emails, and even code based on simple prompts.

Looking ahead, the future of NLP promises even more exciting developments. We're moving toward systems that can understand not just what we say, but what we mean. Emotional intelligence, cultural awareness, and personalization will become standard features.

The integration of multimodal capabilities - combining text with images, audio, and video - will create more natural and comprehensive communication experiences. Imagine describing a complex problem verbally while showing a diagram, and having an AI understand both perfectly.

As these technologies advance, we'll need to address important questions about privacy, bias, and the authenticity of human-AI interactions. The line between human and machine communication will continue to blur, requiring new social norms and ethical frameworks.`,
    regeneratedArticles: [],
  },
  {
    id: "3",
    title: "AI Ethics and Responsible Development",
    date: "2024-01-13 9:15 AM",
    textPrompt:
      "Discuss the ethical considerations in AI development and responsible practices",
    keywordsPresented: [
      "Algorithms",
      "Deep learning",
      "Neural networks",
      "Machine learning",
      "Computer science",
      "Computer vision",
      "Robotics",
      "Artificial intelligence",
      "Work automation",
      "AI services",
    ],
    keywordsSelected: ["Artificial intelligence", "Algorithms"],
    articleLengthSelected: "long",
    toneSelected: "professional",
    content: `As artificial intelligence becomes increasingly integrated into our daily lives, the importance of ethical considerations and responsible development practices cannot be overstated. The power of AI systems to influence decisions, shape behaviors, and impact society demands a thoughtful approach to their creation and deployment.

One of the most pressing ethical concerns in AI development is bias. Machine learning systems learn from historical data, and if that data reflects societal biases, the AI will perpetuate and potentially amplify those biases. This can lead to discriminatory outcomes in hiring, lending, criminal justice, and other critical areas where fairness is essential.

Privacy represents another significant ethical challenge. AI systems often require vast amounts of data to function effectively, raising questions about data collection, storage, and usage. The balance between data utility and individual privacy rights must be carefully considered, with transparent policies and robust security measures in place.

Transparency and explainability are crucial for building trust in AI systems. When AI makes decisions that affect people's lives, those affected deserve to understand how those decisions were made. Black box algorithms that operate without clear explanation undermine accountability and can erode public confidence.

The environmental impact of AI development is an often-overlooked ethical consideration. Training large language models and complex neural networks requires significant computational resources, contributing to carbon emissions and energy consumption. Responsible development must consider the environmental footprint of AI systems and work toward more sustainable approaches.

Accountability frameworks are essential for ensuring responsible AI development. Organizations must establish clear guidelines for AI use, implement monitoring systems to detect and address issues, and create mechanisms for redress when AI systems cause harm.

The future of AI ethics will require ongoing collaboration between technologists, ethicists, policymakers, and the public. As AI capabilities continue to advance, our ethical frameworks must evolve to address new challenges and opportunities while ensuring that AI serves humanity's best interests.`,
    regeneratedArticles: [
      {
        title: "Regenerated: AI Ethics and Responsible Development",
        content: `The rapid advancement of artificial intelligence technologies brings with it a profound responsibility to ensure these systems are developed and deployed ethically. As AI becomes more capable and autonomous, the need for robust ethical frameworks and responsible development practices becomes increasingly urgent.

Bias in AI systems represents one of the most significant ethical challenges we face. When machine learning models are trained on historical data that contains societal biases, they inevitably learn and potentially amplify those biases. This can result in discriminatory outcomes in critical areas such as hiring, loan applications, criminal sentencing, and healthcare decisions. Addressing bias requires diverse training data, regular bias audits, and inclusive development teams.

Data privacy and security are fundamental ethical considerations in AI development. The collection, storage, and use of personal data must be governed by transparent policies and robust security measures. Individuals should have control over their data and clear understanding of how AI systems use it. Privacy-preserving techniques like differential privacy and federated learning offer promising approaches to balance data utility with privacy protection.

The explainability of AI decisions is crucial for building trust and ensuring accountability. When AI systems make decisions that significantly impact people's lives, those affected deserve to understand the reasoning behind those decisions. This is particularly important in high-stakes domains like healthcare, finance, and criminal justice, where decisions can have life-altering consequences.

Environmental sustainability in AI development is an emerging ethical concern. The computational resources required to train large AI models contribute significantly to carbon emissions and energy consumption. Responsible AI development must consider the environmental impact and work toward more efficient algorithms, renewable energy sources, and sustainable computing practices.

The future of AI ethics will require continuous dialogue between technologists, ethicists, policymakers, and the public. As AI capabilities evolve, our ethical frameworks must adapt to address new challenges while ensuring that AI development remains aligned with human values and serves the greater good.`,
      },
    ],
  },
  {
    id: "4",
    title: "Deep Learning Applications in Healthcare",
    date: "2024-01-12 4:20 PM",
    textPrompt:
      "Examine how deep learning is revolutionizing medical diagnosis and treatment",
    keywordsPresented: [
      "Algorithms",
      "Deep learning",
      "Neural networks",
      "Machine learning",
      "Computer science",
      "Computer vision",
      "Robotics",
      "Artificial intelligence",
      "Work automation",
      "AI services",
    ],
    keywordsSelected: [
      "Deep learning",
      "Computer vision",
      "Artificial intelligence",
    ],
    articleLengthSelected: "short",
    toneSelected: "professional",
    content: `Deep learning is revolutionizing healthcare by enabling more accurate diagnoses, personalized treatments, and improved patient outcomes. These advanced AI systems are transforming how medical professionals approach disease detection, treatment planning, and drug discovery.

Medical imaging represents one of the most successful applications of deep learning in healthcare. Convolutional neural networks can analyze X-rays, MRIs, and CT scans with remarkable accuracy, often detecting patterns that human radiologists might miss. These systems can identify tumors, fractures, and other abnormalities with high precision, enabling earlier intervention and better patient outcomes.

In pathology, deep learning algorithms analyze tissue samples to detect cancer cells and other abnormalities. These systems can process thousands of samples quickly and consistently, reducing human error and allowing pathologists to focus on complex cases that require expert judgment.

Drug discovery and development benefit enormously from deep learning techniques. Neural networks can predict molecular properties, identify potential drug candidates, and optimize chemical compounds, significantly reducing the time and cost of bringing new medications to market.

Personalized medicine is another area where deep learning excels. By analyzing genetic data, medical histories, and lifestyle factors, AI systems can predict disease risk, recommend preventive measures, and suggest personalized treatment plans tailored to individual patients.

The integration of deep learning in healthcare also extends to administrative tasks, such as scheduling, billing, and resource allocation. These applications help healthcare providers operate more efficiently, allowing them to focus more on patient care.

As these technologies continue to evolve, the future of healthcare looks increasingly data-driven, predictive, and personalized, promising better outcomes for patients worldwide.`,
    regeneratedArticles: [],
  },
];

// Trending articles data
const trendingArticles = [
  {
    title: "The Future of Artificial Intelligence in Healthcare",
    author: "Dr. Sarah Chen",
    readTime: "8 min read",
    excerpt:
      "Exploring how AI is revolutionizing medical diagnosis and treatment...",
    publishDate: "31 Dec, 2024",
    comments: 42,
    likes: 128,
    authorImage: "/images/Ai article generator/author image 1.png",
    coverImage: "/images/Ai article generator/cover image 1.png",
  },
  {
    title: "Sustainable Living: Small Changes, Big Impact",
    author: "Michael Green",
    readTime: "5 min read",
    excerpt:
      "Simple daily habits that can significantly reduce your carbon footprint...",
    publishDate: "28 Dec, 2024",
    comments: 35,
    likes: 96,
    authorImage: "/images/Ai article generator/author image 2.png",
    coverImage: "/images/Ai article generator/cover image 2.png",
  },
  {
    title: "The Rise of Remote Work Culture",
    author: "Emma Johnson",
    readTime: "6 min read",
    excerpt:
      "How companies are adapting to the new normal of distributed teams...",
    publishDate: "25 Dec, 2024",
    comments: 58,
    likes: 167,
    authorImage: "/images/Ai article generator/author image 3.png",
    coverImage: "/images/Ai article generator/cover image 3.png",
  },
  {
    title: "Machine Learning Fundamentals for Beginners",
    author: "Alex Kumar",
    readTime: "7 min read",
    excerpt:
      "A comprehensive guide to understanding the basics of machine learning...",
    publishDate: "22 Dec, 2024",
    comments: 73,
    likes: 234,
    authorImage: "/images/Ai article generator/author image 4.png",
    coverImage: "/images/Ai article generator/cover image 4.png",
  },
];

// Insights sidebar data - Top AI assisted articles
const topAIArticles = [
  { title: "Understanding Neural Networks", authors: "Sarah Chan" },
  { title: "Python for Data Science", authors: "Rebecca Hudson" },
  { title: "Machine Learning Basics", authors: "Danielle Cruise " },
  { title: "AI Ethics and Governance", authors: "Janet Wales" },
];

// Trending topics
const trendingTopics = [
  "Technology",
  "Health",
  "Business",
  "Science",
  "Education",
  "Environment",
];

// Keywords data
const keywords = [
  "Algorithms",
  "Deep learning",
  "Neural networks",
  "Machine learning",
  "Computer science",
  "Computer vision",
  "Robotics",
  "Artificial intelligence",
  "Work automation",
  "AI services",
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("id");

  // If articleId is provided, return specific article details
  if (articleId) {
    const article = mockArticles.find((a) => a.id === articleId);

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article);
  }

  // Otherwise, return all data for the main AI generator page
  return NextResponse.json({
    generatedArticle: mockGeneratedArticle,
    articles: mockArticles,
    trendingArticles: trendingArticles,
    topAIArticles: topAIArticles,
    trendingTopics: trendingTopics,
    keywords: keywords,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    // FUTURE POSTGRESQL LOGIC:
    // const result = await prisma.articles.create({ data: body });

    console.log("📝 Article Data Captured for PostgreSQL Table:");
    console.log(
      `- Article Data: [Title: ${body.title}, Content Length: ${body.content?.length || 0}]`,
    );

    return NextResponse.json({ success: true, data: body }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
