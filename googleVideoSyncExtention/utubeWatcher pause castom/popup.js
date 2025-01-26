document.getElementById('pauseButton').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: pauseVideos,
    });
  });
});

function pauseVideos() {
  let videos = document.querySelectorAll('video');

  console.log('videos', videos);
  const videos1 = document.getElementsByTagName('video');
  console.log('videos1', videos1);
  videos.forEach((video) => video.pause());
}

function handleClick(event) {
  // event.target is the element that was clicked
  const clickedElement = event.target;

  // Getting the HTML tag name of the clicked element
  const tagName = clickedElement.tagName;

  // For demonstration, log the tag name to the console
  console.log('Clicked element tag:', tagName);

  // Optionally, display the tag name on the page or use it in any other way
  // alert('Clicked element tag: ' + tagName);
}

// Add event listener to the document to listen for any clicks
document.getElementById('body').addEventListener('click', handleClick);
