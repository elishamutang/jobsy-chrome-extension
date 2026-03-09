chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.openPopup) {
    chrome.action.openPopup();
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  // Fetch countries from API
  try {
    const response = await fetch("http://localhost:8000/api/countries", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${result.authToken}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (data.success) {
      // Save countries data
      chrome.storage.local.set({ countries: data.data }, () => {
        console.log(data.data);
      });
    }
  } catch (error) {
    console.log(error);
  }
});
