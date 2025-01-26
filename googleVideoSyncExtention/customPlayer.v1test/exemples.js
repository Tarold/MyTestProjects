chrome.storage.local.get('currentAction', (result) => {
  const { currentAction } = result;

  function handleOnError() {
    console.error('WebSocket Error:', error);
    chrome.storage.local.set({ webSocketStatus: 'error' }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          'Error saving webSocketStatus:',
          chrome.runtime.lastError
        );
      } else {
        console.log('webSocketStatus saved:', 'error');
      }
    });
    socket.close();
  }

  socket.onopen = handleOnOpen;

  socket.onmessage = handleOnMessage;

  socket.onclose = handleOnClose;

  socket.onerror = handleOnError;
}
openSocket();
