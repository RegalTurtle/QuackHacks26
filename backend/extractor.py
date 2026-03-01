import requests
from pathlib import Path
class RedditDownloader:

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "HackathonBot/1.0"
        })

    def fetch_json(self, post_id):

        url = f"https://www.reddit.com/comments/{post_id[3:]}.json"

        response = self.session.get(url)

        return response.json()


    def download_media(self, url, filepath):

        response = self.session.get(url, stream=True)

        with open(filepath, "wb") as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)


    def process_post(self, post_id):
        data = self.fetch_json(post_id)
        post = data[0]["data"]["children"][0]["data"]

        base = Path("posts") / post_id

        images_dir = base / "images"
        videos_dir = base / "videos"

        images_dir.mkdir(parents=True, exist_ok=True)
        videos_dir.mkdir(parents=True, exist_ok=True)

        # Save text
        with open(base / "text.txt", "w") as f:
            f.write(post.get("selftext", ""))

        # Images
        if "preview" in post:
            for i, img in enumerate(post["preview"]["images"]):
                url = img["source"]["url"].replace("&amp;", "&")

                self.download_media(
                    url,
                    images_dir / f"{i}.jpg"
                )

        # Video
        if post.get("is_video"):
            video_url = post["media"]["reddit_video"]["fallback_url"]

            self.download_media(
                video_url,
                videos_dir / "0.mp4"
            )

