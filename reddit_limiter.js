let activeObserver = null;
let activeType = null;
let runId = 0;
let enabled;
let threshold = 1;

let scoreMap = new Map();

const structs = {
  post: {
    hiding_what: "comment",
    outer_struct: "shreddit-comment-tree",
    inner_item: "shreddit-comment[thingid]",
    id_name: "thingid"
  },
  feed: {
    hiding_what: "post",
    outer_struct: "shreddit-feed",
    inner_item: "article[data-post-id]",
    id_name: "data-post-id"
  },
  subreddit: {
    hiding_what: "post",
    outer_struct: "shreddit-feed",
    inner_item: "article[data-post-id]",
    id_name: "data-post-id"
  }
}

const waitForElement = (selector, callback) => {
  const el = document.querySelector(selector);
  if (el) {
    callback();
    return;
  }

  const tempObserver = new MutationObserver(() => {
    const el = document.querySelector(selector);
    if (el) {
      tempObserver.disconnect();
      callback();
    }
  });

  tempObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
};

const run_limiter = (type) => {
  if (!enabled) return
  // prevents re-inits on same type
  // if (activeType === type) return;
  // Disconnect old observer if it exists
  if (activeObserver) {
    activeObserver.disconnect();
    activeObserver = null;
  }

  activeType = type;

  const type_struct = structs[type] || null;
  if (!type_struct) return;
  

  waitForElement(type_struct.outer_struct, () => {
    requestAnimationFrame(() => {
      const outer_struct = document.querySelector(type_struct.outer_struct);
      if (!outer_struct) return;

      runId += 1;
      const currentRun = String(runId);

      const hide_items = (item_list, percent_confidence) => {
        // comment_list = [
        //   { id: "abc123", percent_ai: 0.5 },
        //   { id: "xyz999", percent_ai: 0.9 }
        // ]
        const hideSet = new Set(
          item_list
            .filter(i => i.percent_ai >= percent_confidence)
            .map(i => i.id)
        );

        // either the comments or the posts
        const inner_items = outer_struct.querySelectorAll(type_struct.inner_item);

        inner_items.forEach(item => {
          if (item.dataset.processedRun === currentRun) return;
          item.dataset.processedRun = currentRun;

          const item_id = item.getAttribute(type_struct.id_name);

          if (hideSet.has(item_id)) {
            console.log(`Hiding ${type_struct.hiding_what} ${item_id}`);
            item.style.display = "none";
          } else {
            item.style.display = "";
          }
        });

        if (activeType === "feed") {
          let ads = outer_struct.querySelectorAll("shreddit-ad-post");
          ads.forEach(ad => {
            ad.style.display = "none";
          })
          ads = outer_struct.querySelectorAll("shreddit-dynamic-ad-link");
          ads.forEach(ad => {
            ad.style.display = "none";
          })
        }
      };

      // TODO replace this with actual call
      const get_item_list = () => {
        const inner_items = outer_struct.querySelectorAll(type_struct.inner_item);

        return [...inner_items].map(item => {
          const id = item.getAttribute(type_struct.id_name);

          if (!scoreMap.has(id)) {
            scoreMap.set(id, Math.random()); // placeholder AI
          }

          return {
            id,
            percent_ai: scoreMap.get(id)
          };
        });
      };

      // Create observer and store it
      activeObserver = new MutationObserver(() => {
        hide_items(get_item_list(), threshold);
      });

      activeObserver.observe(outer_struct, {
        childList: true,
        subtree: true
      });

      // Initial run
      hide_items(get_item_list(), threshold);
    });
  });
};

const handleRouteChange = () => {
  const path = window.location.pathname;

  console.log("Route changed to:", path);

  if (path.startsWith("/r/") && path.includes("/comments/")) {
    run_limiter("post");
  }
  else if (path.startsWith("/r/")) {
    run_limiter("subreddit");
  }
  else {
    run_limiter("feed");
  }
};

const observeNavigation = () => {
  let lastUrl = location.href;

  const urlObserver = new MutationObserver(() => {
    const currentUrl = location.href;

    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      handleRouteChange();
    }
  });

  urlObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
};

const disableLimiter = () => {
  if (activeObserver) {
    activeObserver.disconnect();
    activeObserver = null;
  }

  // Show all posts/comments again
  document.querySelectorAll("[data-processed-run]").forEach(el => {
    el.style.display = "";
    delete el.dataset.processedRun;
  });
};

const init = () => {
  handleRouteChange();     // run once initially
  observeNavigation();     // listen for SPA changes
};

chrome.storage.sync.get(['enabled', 'threshold'], (result) => {
  enabled = result.enabled ?? false;
  threshold = (result.threshold ?? 100) / 100;

  init();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;

  if (changes.enabled) {
    enabled = changes.enabled.newValue ?? true;

    if (!enabled) {
      disableLimiter();
      return;
    }
  }

  if (changes.threshold) {
    threshold = (changes.threshold.newValue ?? 100) / 100;
  }

  // Re-run limiter logic safely
  handleRouteChange();
});