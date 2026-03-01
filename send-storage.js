//sync the settings from the frontend to the storage 
const toggle = document.getElementById('enable-disable-toggle')
const rangeInput = document.getElementById('range-input')
const numberInput = document.getElementById('number-input')

chrome.storage.sync.get(['enabled', 'threshold'], ({ enabled, threshold }) => {
  toggle.checked = enabled ?? true        // default on
  rangeInput.value = threshold ?? 50      // default 50
  numberInput.value = threshold ?? 50
  updateGradient(threshold ?? 50)  
})

toggle.addEventListener('change', () => {
  chrome.storage.sync.set({ enabled: toggle.checked })
  sendToContent({ enabled: toggle.checked })
})

rangeInput.addEventListener('input', () => {
  numberInput.value = rangeInput.value
  chrome.storage.sync.set({ threshold: Number(rangeInput.value) })
  updateGradient(rangeInput.value)
  sendToContent({ threshold: Number(rangeInput.value) })
})

numberInput.addEventListener('input', () => {
  rangeInput.value = numberInput.value
  chrome.storage.sync.set({ threshold: Number(numberInput.value) })
  updateGradient(numberInput.value)
  sendToContent({ threshold: Number(numberInput.value) })
})

function sendToContent(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) return;

    chrome.tabs.sendMessage(tabs[0].id, message)
      .catch(err => {
        // Ignore errors when no content script is present
        console.debug("No content script to receive message:", err);
      });
  });
}

function updateGradient(value) {
  rangeInput.style.background = `linear-gradient(to right, #4CAF50 0%, #4CAF50 ${value}%, #e0e0e0 ${value}%, #e0e0e0 100%)`
}