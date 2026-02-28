console.log("I am running in:", window.location.href);
const feed = document.querySelector("shreddit-feed");
console.log(feed);
const posts = feed.querySelectorAll("article[data-post-id]");
console.log(posts);

posts.forEach(post => {
  const commentCount = post.querySelector("shreddit-post")?.getAttribute("comment-count");
  console.log(commentCount);

  if (commentCount && parseInt(commentCount) > 2000) {
    // post.style.display = "none";
    post.style.backgroundColor = "blue";
  }
});
