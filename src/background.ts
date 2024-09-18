const jobSites = [
    {
      domain: "www.reed.co.uk",
      listingPattern: "/jobs/"
    }
  ];
  
const isJobSite = (url: string) => {
    try {
        const urlObject = new URL(url);
        return jobSites.some(site => urlObject.hostname.includes(site.domain));
    } catch (error) { 
        console.log(url)
        console.error("Invalid URL in isJobSite:", url, error);
        return false; // Handle the case where the URL is invalid
    }
}
  
const isJobListingPage = (url: string) => {
    try {
        const urlObject = new URL(url);
        return jobSites.some(site => 
          urlObject.hostname.includes(site.domain) && 
          urlObject.pathname.includes(site.listingPattern)
        );
    } catch (error) {
        console.error("Invalid URL in isJobListingPage:", url, error)
        return false;
    }
}
  
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url !== undefined && changeInfo.status === 'complete' && isJobSite(tab.url)) {
    chrome.tabs.sendMessage(tabId, {
      action: "checkJobPage",
      isListing: isJobListingPage(tab.url),
      url: tab.url
    });
  }
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.action === "jobPageResult") {
    console.log("Job page result received:", request.isJobListing);
    if (request.isJobListing) {
      // Here you can trigger your summarization logic or update the extension's UI
      console.log("Job listing confirmed on", sender.tab?.url);
    }
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "summarizeJobListing",
    title: "Summarize this Job Listing",
    contexts: ["all"],
    documentUrlPatterns: [
      "*://*.reed.co.uk/jobs/*", // Matches URLs with '/jobs/' after the domain
      "*://reed.co.uk/jobs/*"
    ]
  });
});

// Handle the click event on the context menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "summarizeJobListing") {
    // Send a message to the content script to perform some action
    // chrome.tabs.sendMessage(tab.id, { action: "summarizeJob", parentUrl: tab.url});
    tab && tab.id && chrome.tabs.sendMessage(tab.id , { action: "summarizeJob"});
  }
});