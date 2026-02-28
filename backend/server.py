from flask import Flask
import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

USER = os.environ.get('API_USER')
SECRET = os.environ.get('API_SECRET')

@app.route("/detect/image")
def detect_image():
    params = {
      'url': 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages.pexels.com%2Fphotos%2F1261728%2Fpexels-photo-1261728.jpeg%3Fcs%3Dsrgb%26dl%3Dpexels-stywo-1261728.jpg%26fm%3Djpg&f=1&nofb=1&ipt=06fb9d00c40ca60ce334224892dbcfcb01d987735c682c2a677f82ed54d22676',
      'models': 'genai',
      'api_user': USER,
      'api_secret': SECRET, 
    }
    r = requests.get('https://api.sightengine.com/1.0/check.json', params=params)

    return json.loads(r.text)
