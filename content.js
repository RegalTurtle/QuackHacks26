
// function extractPosts() {

//     const posts = document.querySelectorAll("shreddit-post");

//     const results = [];

//     posts.forEach(post => {

//         const postId = post.getAttribute("id");

//         // TEXT extraction
//         let text = "";
//         const textBody = post.querySelector('[slot="text-body"]');
//         if (textBody) {
//             text = textBody.innerText;
//         }
//         // IMAGE extraction
//         let images = [];
//         const contentHref = post.getAttribute("content-href");
//         if (contentHref && contentHref.includes("redd.it")) {
//             images.push(contentHref);
//         }
//         // Backup image extraction
//         post.querySelectorAll("img").forEach(img => {
//             if (
//                 img.src.includes("i.redd.it") ||
//                 img.src.includes("preview.redd.it")
//             ) {
//                 images.push(img.src);
//             }
//         });

//         // VIDEO extraction
//         let videos = [];
//         post.querySelectorAll("video").forEach(video => {
//             if (video.src) {
//                 videos.push(video.src);
//             }
//         });

//         results.push({

//             postId,
//             text,
//             images,
//             videos

//         });

//     });

//     console.log(results);
//     return results;
// }

// function startObserver() {

//     const observer = new MutationObserver(() => {
//         extractPosts();

//     });
//     observer.observe(document.body, {
//         childList: true,
//         subtree: true

//     });

// }

// window.addEventListener("load", () => {

//     setTimeout(() => {
//         extractPosts();
//         startObserver();
//     }, 3000);

// });


// Keep track of processed posts

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

        // TEXT extraction
        let text = "";
        const textBody = post.querySelector('[slot="text-body"]');

        if (textBody) {
            text = textBody.innerText;
        }

        // IMAGE extraction
        let images = [];

        const contentHref = post.getAttribute("content-href");

        if (contentHref && contentHref.includes("redd.it")) {
            images.push(contentHref);
        }

        post.querySelectorAll("img").forEach(img => {

            if (
                img.src.includes("i.redd.it") ||
                img.src.includes("preview.redd.it")
            ) {
                images.push(img.src);
            }

        });

        let videos = [];

        post.querySelectorAll("source").forEach(source => {

            const src = source.src;

            if (
                src &&
                src.includes("packaged-media.redd.it") &&
                src.includes(".mp4")
            ) {
                videos.push(src);
            }

        });

        const postData = {
            postId,
            text,
            images,
            videos
        };

        console.log("Extracted:", postData);

        results.push(postData);

        // SEND TO BACKEND HERE
        //sendToBackend(postData);

    });

    return results;
}

// Function to send data to Flask backend
// function sendToBackend(postData) {

//     fetch("http://localhost:5000/analyze", {

//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify(postData)

//     })
//     .then(res => res.json())
//     .then(data => console.log("Backend response:", data))
//     .catch(err => console.error("Error:", err));

// }

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

// data-post-id="t3_1rgzycc"
// shreddit-post
// content-href="https://www.reddit.com/r/pics/comments/12345/example_post/"
// post-type="image", "video", "text"
//



// {
// "12345"  :{      
//  text: "This is a post", 
//  videos:[], 
//  images: [         "https://example.com/image1.jpg",         "https://example.com/image2.jpg"     ] 
// }, 
// {

// }
// }