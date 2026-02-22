// easy-blogger/lib/articles/store.js

let articlesStore = [];

export function getArticles() {
  return articlesStore;
}

export function setArticles(next) {
  articlesStore = next;
}

export function makeId() {
  return `d_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}