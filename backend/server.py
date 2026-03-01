from flask import Flask, request
import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

USER = os.environ.get('API_USER')
SECRET = os.environ.get('API_SECRET')

CACHE = {}

def detect_post(post_id):
    if post_id in CACHE:
        return CACHE[post_id]

    result = []
    path = f'posts/{post_id}/'

    for entry in os.listdir(f'{path}/images'):
       percentage = detect_image(f'{path}/images/{entry}')
       if percentage >= 0:
           result += [{post_id: percentage}]

    for entry in os.listdir(f'{path}/videos'):
       percentage = detect_video(f'{path}/videos/{entry}')
       if percentage >= 0:
           result += [{post_id: percentage}]

#    for text in content['text']:
#       percentage = detect_text(text)
#       if percentage >= 0:
#           result += [{post_id: percentage}]

    CACHE[post_id] = result

    return result

@app.route("/detect", methods=['POST'])
def detect():
    body = request.get_json()
    output = []
    
    for post_id in body['ids']:
        output += detect_post(post_id)

    return output

def detect_image(path):
    params = {
      'models': 'genai',
      'api_user': USER, 
      'api_secret': SECRET
    }
    files = {'media': open(path, 'rb')}
    r = requests.post('https://api.sightengine.com/1.0/check.json', files=files, data=params)

    output = json.loads(r.text)
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

