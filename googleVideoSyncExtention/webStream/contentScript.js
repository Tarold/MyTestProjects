// contentScript.js
document.addEventListener('keydown', function (event) {
  console.log(event.code);
  console.log('video', document.querySelectorAll('video'));

  if (event.code === 'Space') {
    chrome.runtime.sendMessage({ action: 'space_pressed' });
  }
});

// Listen for a message from the background script to simulate a space bar press
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'simulate_space_press') {
    const event = new KeyboardEvent('keydown', { code: 'Space', key: ' ' });
    document.dispatchEvent(event);
  }
});

// contentScript.js
document.addEventListener(
  'play',
  function (event) {
    if (event.target && event.target.tagName === 'VIDEO') {
      chrome.runtime.sendMessage({
        action: 'video_play',
        url: window.location.href,
      });
    }
  },
  true
);

document.addEventListener(
  'pause',
  function (event) {
    if (event.target && event.target.tagName === 'VIDEO') {
      chrome.runtime.sendMessage({
        action: 'video_pause',
        url: window.location.href,
      });
    }
  },
  true
);
