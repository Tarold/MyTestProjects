document.getElementById('redirectBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.update(tabs[0].id, {
      url: 'https://prnt.sc/' + generateRandomString(),
    });
  });
});

function generateRandomString() {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';

  const getRandomChars = (chars, length) => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  return getRandomChars(letters, 2) + getRandomChars(numbers, 4);
}
