from flask import Flask, request, redirect, url_for
import requests
import json
import os
from dotenv import load_dotenv


app = Flask(__name__)

from pathlib import Path
class RedditDownloader:

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "HackathonBot/1.0"
        })

    def fetch_json(self, post_id):

        url = f"https://www.reddit.com/comments/{post_id}.json"

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

        base = Path("data") / post_id

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

# downloader = RedditDownloader()
# downloader.process_post("1rha4s8")


def main():
    # simple command-line entrypoint for testing the downloader
    import argparse

    parser = argparse.ArgumentParser(description="Download media/text from a Reddit post id")
    parser.add_argument("post_id", help="the Reddit post id to process, e.g. 1rha4s8")
    args = parser.parse_args()

    downloader = RedditDownloader()
    downloader.process_post(args.post_id)


if __name__ == "__main__":
    # if the file is executed directly we run the downloader with the provided id
    main()

# USER = os.environ.get('API_USER')
# SECRET = os.environ.get('API_SECRET')

# def detect_post(post_id, content):
#     result = []

#     for image_url in content['images']:
#        percentage = detect_image(image_url)
#        if percentage >= 0:
#            result += [{post_id: percentage}]

#     for video_url in content['videos']:
#        percentage = detect_video(video_url)
#        if percentage >= 0:
#            result += [{post_id: percentage}]

#     for text in content['text']:
#        percentage = detect_text(text)
#        if percentage >= 0:
#            result += [{post_id: percentage}]

#     return result

# @app.route("/detect", methods=['POST'])
# def detect():
#     body = request.get_json()
#     output = []
    
#     for post_id in body:
#         content = body[post_id]
#         output += detect_post(post_id, content)

#     return output

# def detect_image(url):
#     params = {
#       'url': url,
#       'models': 'genai',
#       'api_user': USER,
#       'api_secret': SECRET, 
#     }

#     r = requests.get('https://api.sightengine.com/1.0/check.json', params=params)
#     output = json.loads(r.text)

#     if 'ai_generated' in output:
#         return output['ai_generated']
#     return -1


# def detect_video(url):
#     params = {
#       'models': 'genai',
#       'api_user': USER,
#       'api_secret':SECRET 
#     }

#     files = {'media': url}
#     r = requests.post('https://api.sightengine.com/1.0/video/check-sync.json', files=files, data=params)
#     output = json.loads(r.text)

#     return output
#    if 'ai_generated' in output:
#        return output['ai_generated']
#    return -1

