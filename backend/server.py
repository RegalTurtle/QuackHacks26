from flask import Flask, request, redirect, url_for
import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

USER = os.environ.get('API_USER')
SECRET = os.environ.get('API_SECRET')

def detect_post(post_id, content):
    result = []

    for image_url in content['images']:
       percentage = detect_image(image_url)
       if percentage >= 0:
           result += [{post_id: percentage}]

    for video_url in content['videos']:
       percentage = detect_video(video_url)
       if percentage >= 0:
           result += [{post_id: percentage}]

    for text in content['text']:
       percentage = detect_text(text)
       if percentage >= 0:
           result += [{post_id: percentage}]

    return result

@app.route("/detect", methods=['POST'])
def detect():
    body = request.get_json()
    output = []
    
    for post_id in body:
        content = body[post_id]
        output += detect_post(post_id, content)

    return output

def detect_image(url):
    params = {
      'url': url,
      'models': 'genai',
      'api_user': USER,
      'api_secret': SECRET, 
    }

    r = requests.get('https://api.sightengine.com/1.0/check.json', params=params)
    output = json.loads(r.text)

    if 'ai_generated' in output:
        return output['ai_generated']
    return -1


def detect_video(url):
    params = {
      'models': 'genai',
      'api_user': USER,
      'api_secret':SECRET 
    }

    files = {'media': url}
    r = requests.post('https://api.sightengine.com/1.0/video/check-sync.json', files=files, data=params)
    output = json.loads(r.text)

    return output
#    if 'ai_generated' in output:
#        return output['ai_generated']
#    return -1

