from flask import Flask, request
import requests
import json
import os
from dotenv import load_dotenv
from extractor import RedditDownloader 
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route("/extract", methods=['POST'])
def call_class():
    """Endpoint called from the extension content script.

    Expects a JSON body of the form:

        { "ids": ["abc123", "def456", ...] }

    For each post id we kick off the downloader and then run the
    existing detection logic on the freshly downloaded files.
    The response is simply whatever ``detect`` returns.
    """

    print("route hit")

    body = request.get_json(force=True)
    if not body or 'ids' not in body:
        return {"error": "request must contain JSON with an 'ids' list"}, 400

    post_ids = body['ids']
    if not isinstance(post_ids, list):
        return {"error": "'ids' must be a list"}, 400

    downloader = RedditDownloader()
    for pid in post_ids:
        try:
            downloader.process_post(pid)
        except Exception:
            # if one download fails, continue with the others; the
            # detection step may still work for previously cached items
            app.logger.exception(f"failed to download {pid}")

    # run the detection over all requested ids and return results as JSON
    result = detect(post_ids)
    return json.dumps(result), 200, {'Content-Type': 'application/json'}


USER = os.environ.get('API_USER')
SECRET = os.environ.get('API_SECRET')
ZEROGPT_KEY = os.environ.get('ZEROGPT_KEY')

CACHE = {}

def detect_post(post_id):
    if post_id in CACHE:
        return CACHE[post_id]

    result = []
    path = f'posts/{post_id}'

    print("Checking post:", post_id)
    print("Images:", os.listdir(f'{path}/images'))
    print("Videos:", os.listdir(f'{path}/videos'))

    # Text detection with existence check
    text_path = f'{path}/text'
    if os.path.exists(text_path):
        print("Text files:", os.listdir(text_path))
        for entry in os.listdir(text_path):
            with open(f'{text_path}/{entry}', 'r', encoding='utf-8') as f:
                text = f.read()
                if text.strip():  # Only process non-empty text
                    print(f"Processing text for {post_id}, length: {len(text)}")
                    fakePercentage = detect_text(text)
                    print(f"Text detection result: {fakePercentage}")
                    if fakePercentage >= 0:
                        result += [{
                            "id": post_id,
                            "percent_ai": fakePercentage
                        }]
                        print(f"Added text result for {post_id}: {fakePercentage}")

    for entry in os.listdir(f'{path}/images'):
       percentage = detect_image(f'{path}/images/{entry}')
       if percentage >= 0:
          result += [{
            "id": post_id,
            "percent_ai": percentage
          }]

    for entry in os.listdir(f'{path}/videos'):
       percentage = detect_video(f'{path}/videos/{entry}')
       if percentage >= 0:
          result += [{
            "id": post_id,
            "percent_ai": percentage
          }]

#    for text in content['text']:
#       percentage = detect_text(text)
#       if percentage >= 0:
#           result += [{post_id: percentage}]

    CACHE[post_id] = result

    return result

# @app.route("/detect", methods=['POST'])
def detect(post_ids):
    output = []
    for post_id in post_ids:
        output += detect_post(post_id)

    return output


def detect_text(text):
    headers = {
     'ApiKey': ZEROGPT_KEY
    }
    body = {
        'input_text': text,
    }
    r = requests.post('https://api.zerogpt.com/api/detect/detectText', json=body, headers=headers)
    output = json.loads(r.text)
    print("ZeroGPT response:", output)
    if 'data' in output and 'fakePercentage' in output['data']:
        return output['data']['fakePercentage'] / 100

    return -1

def detect_image(path):
    params = {
      'models': 'genai',
      'api_user': USER, 
      'api_secret': SECRET
    }
    files = {'media': open(path, 'rb')}
    r = requests.post('https://api.sightengine.com/1.0/check.json', files=files, data=params)

    output = json.loads(r.text)
    print("Sightengine response:", output)
    if 'type' in output:
        return output['type']['ai_generated']

    return -1

def detect_video(path):
    params = {
      'models': 'genai',
      'api_user': USER,
      'api_secret':SECRET 
    }

    files = {'media': open(path, 'rb')}
    r = requests.post('https://api.sightengine.com/1.0/video/check-sync.json', files=files, data=params)
    output = json.loads(r.text)

    if 'data' not in output:
        return -1

    percentage = 0.0
    for data in output['data']['frames']:
        percentage = max(percentage, data['type']['ai_generated'])

    return percentage

