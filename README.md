# QuackHacks26

## Reddit Limiter

We built a Chrome extension that automatically hides AI-generated content at a certain level of confidence, as chosen by the user. 

## Setup

Open `chrome://extensions/`, turn on developer mode, and load unpacked extension. To run the server, `cd` into the backend directory and run `flask run --port=5000`. The server expects a `.env` file with `API_USER` and `API_SECRET` as provided by SightEngine. 
