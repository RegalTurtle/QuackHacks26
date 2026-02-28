// console.log("I am running in:", window.location.href);

const hide_posts = (post_list) => {
  // post_list = [
  //   { id: "abc123", percent_ai: 0.5 },
  //   { id: "xyz999", percent_ai: 0.9 }
  // ]
  const feed = document.querySelector("shreddit-feed");
  const posts = feed.querySelectorAll("article[data-post-id]");
  posts.forEach(post => {
    const post_html = post.querySelector("shreddit-post");
    const post_id = post_html.getAttribute("id");
    const shouldHide = post_list.some(p => p.id === post_id);
    if (shouldHide) {
      post.style.display = "none";
    }
  })
};