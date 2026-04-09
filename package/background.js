chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((err) => {
  console.warn("sidePanel.setPanelBehavior failed", err);
});
