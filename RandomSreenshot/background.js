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

chrome.action.onClicked.addListener((tab) => {
  const randomURL = 'https://prnt.sc/' + generateRandomString();
  chrome.tabs.update(tab.id, { url: randomURL });
});
