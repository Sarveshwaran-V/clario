// This script configures the extension's toolbar icon to open the side panel.
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Create a context menu item on installation.
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'clario-explain-link',
    title: 'Explain with Clario',
    contexts: ['link'],
  });
});

// Handle the context menu click event.
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'clario-explain-link' && info.linkUrl) {
    // Open the side panel in the current window.
    chrome.sidePanel.open({ windowId: tab.windowId }, () => {
      // After the panel opens, send a message with the URL.
      // A brief timeout helps ensure the content script is ready to listen.
      setTimeout(() => {
        chrome.runtime.sendMessage({
          type: 'EXPLAIN_URL_FROM_CONTEXT',
          url: info.linkUrl,
        });
      }, 100);
    });
  }
});