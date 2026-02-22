// easy-blogger/lib/articles/store.js

const seedArticles = [
  {
    id: "a1",
    writerName: "Emma Richardson",
    date: "2026-02-22T06:30:00Z",
    title: "How AI is Transforming Content Creation in 2025",
    coverImage: "/images/Unpublished_IMG/robot.jpg",
    content:
      "Artificial intelligence has become an essential creative partner rather than just a productivity tool...",
    status: "unpublished",
  },
  // (You can paste your other sample articles here if you want)
];

let articlesStore = [...seedArticles];

export function getArticles() {
  return articlesStore;
}

export function setArticles(next) {
  articlesStore = next;
}

export function makeId() {
  return `d_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}