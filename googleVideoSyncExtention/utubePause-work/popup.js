document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => {
          const videos = document.querySelectorAll('video');
          console.log('play', videos);
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
          return video[0].paused || false;
        },
      },
      (results) => {
        const status = document.getElementById('status');
        if (results[0].result) {
          status.textContent = 'Video is playing';
        } else {
          status.textContent = 'Video is not playing';
        }
      }
    );
  });
});
