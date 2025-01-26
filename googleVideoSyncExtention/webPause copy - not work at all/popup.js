document.getElementById('play').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: playAllVideos,
    });
  });
});

document.getElementById('pause').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: pauseAllVideos,
    });
  });
});

function playAllVideos() {
  const videos = document.querySelectorAll('video');
  console.log('play', videos);
  console.log('document', document);
  videos.forEach((video) => {
    if (video.paused) {
      try {
        video.play();
        console.log('Playing video:', video);
      } catch (e) {
        console.error('Error playing video:', e);
      }
    }
  });
}

function pauseAllVideos() {
  const videos = document.querySelectorAll('video');
  console.log('document', document);
  console.log('pause', videos);
  videos.forEach((video) => {
    if (!video.paused) {
      try {
        video.pause();
        console.log('Pausing video:', video);
      } catch (e) {
        console.error('Error pausing video:', e);
      }
    }
  });
}
