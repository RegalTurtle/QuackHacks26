const mainElement = document.querySelector('main');
console.log('This is a content script!');
console.log('Main element:', mainElement);

const processedPosts = new Set();

function extractPosts() {

    const posts = document.querySelectorAll("shreddit-post");

    const results = [];

    posts.forEach(post => {
        const postId = post.getAttribute("id");
        // Skip if already processed
        if (processedPosts.has(postId)) return;
        processedPosts.add(postId);
        results.push(postId);

    });
        // once the loop is done, fire the backend call if there were new posts
        if (results.length > 0) {
            console.log("Extracted post ids:", results);
            sendToBackend(results);
        }

    return results;
}

// Function to send data to Flask backend
function sendToBackend(postids) {
    fetch("http://localhost:5000/extract", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        ids: postids
    })
    })
    .then(res => res.json())
    .then(data => {
        console.log("Response:", data);
    })
    .catch(err => {
        console.error("Error:", err);
    });
}

// Observe infinite scroll
function startObserver() {
    const observer = new MutationObserver(() => {
        extractPosts();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

}

// Run when page loads
window.addEventListener("load", () => {
    setTimeout(() => {
        extractPosts();
        startObserver();

    }, 3000);

});

chrome.storage.sync.get(['enabled', 'threshold'], ({ enabled, threshold }) => {
  console.log('Loaded settings from storage:', { enabled, threshold });
});