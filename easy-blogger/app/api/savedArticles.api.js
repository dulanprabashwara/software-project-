const API_URL = process.env.NEXT_PUBLIC_API_URL;

 //api call to get saved articles
export const getSavedArticlesApi = async (token) => {
  const res = await fetch(`${API_URL}/api/savedArticle`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`, //send token
      "Content-Type": "application/json", 
    },
  });

  const articles = await res.json();
  
  if (!articles.success) {
    throw new Error(articles.message || "Failed to fetch saved articles"); //error in case of fail
  }

  return articles.data || []; //returb
};

export const getSavedListApi = async (token) => {
  const res = await fetch(`${API_URL}/api/savedArticle/savedList`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`, //send token
      "Content-Type": "application/json", 
    },
  });

  const articles = await res.json();
  
  if (!articles.success) {
    throw new Error(articles.message || "Failed to fetch saved List"); //error in case of fail
  }

  return articles.data || []; //returb
};

 