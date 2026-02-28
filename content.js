const mainElement = document.querySelector('main');

console.log('This is a content script!');
console.log('Main element:', mainElement);

//get the settings from storage and log them
chrome.storage.sync.get(['enabled', 'threshold'], ({ enabled, threshold }) => {
  console.log('Loaded settings from storage:', { enabled, threshold });
});

//call server

