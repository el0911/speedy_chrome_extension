chrome.runtime.onInstalled.addListener(() => {
  console.log("Screenshot to Google Drive extension installed.");
});

// Optional: Manage the authentication token or other background tasks
chrome.identity.onSignInChanged.addListener((account, signedIn) => {
  if (!signedIn) {
    chrome.identity.removeCachedAuthToken({ token: account });
  }
});


