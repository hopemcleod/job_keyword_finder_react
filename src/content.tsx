// Define a small sample of job URLs (adjust these to real URLs from reed.co.uk)

import { createRoot } from 'react-dom/client';
import Sidebar from "./SideBar";
import { useState } from 'react';

// const jobWebsiteUrls = ["https://www.reed.co.uk/jobs/ai-engineer-jobs"];
const jobWebsiteUrls: string[] = [];

// Keywords to help look for the correct section e.g. "Qualifications", "essential", "desirable", "requirements"
// const sectionKeywords = ["Qualifications", "essential", "desirable", "requirements"];

// Keywords relevant to the job
const skillKeywords = [
  "Python", "langchain", "langgraph", "LLM", "large language model",
  "pytorch", "RAG", "NLP", "Retrieval-augmented generation", "Retrieval augmented generation", "machine learning", "ml"
];


// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "updateSidebar") {
    const sidebarContent = document.getElementById('sidebar-content');
    if (sidebarContent) {
      sidebarContent.innerHTML = request.data;
    }
  }
});

// Fetch HTML from a URL
const fetchHtml = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const html: string = await response.text();
    return html;
  } catch (error) {
    console.error(`Failed to fetch HTML from ${url}:`, error);
    return null;
  }
}

const saveJobListToLocalStorage = (joblist: any[]) => {
  localStorage.setItem('jobLinks', JSON.stringify(joblist));
  console.log("Job links stored in localStorage");
}

// Main function to process URLs
// For each url in the jobsList, find skills that match the keywords
const findSkillMatches = (jobsList: any[], skillList: string[]) => { // TODO: replace any[]
  let results = [];
  let urlsMatchingSkills: Record<string, string[]>[] = [];

  for (let job of jobsList) {
    for (let skill of skillList) {
      let description = job.jobDetail['jobDescription'];
      let index = description.indexOf(skill);
      if (index !== -1) {
        results.push(skill);
      }
    }
    let url = job.url;
    urlsMatchingSkills.push({ ['"' + url + '"']: results });
    results = [];
  }

  return urlsMatchingSkills;
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "checkJobPage") {
    const isListing = request.isListing; // && isJobListingPage();
    jobWebsiteUrls.push(request.url)
    chrome.runtime.sendMessage({
      action: "jobPageResult",
      isJobListing: isListing
    });

    if (isListing) {
      console.log("This is a job listing page");
      // Implement your summarization logic here
    } else {
      console.log("This is not a job listing page");
    }
  }
});

const findAndParseJSONFromScripts = (jsonIdentifier: (json: any) => any[], key: string) => { // TODO: replace any[]
  // Get all script tags
  const scriptTags = document.getElementsByTagName('script');

  for (let script of scriptTags) {
    try {
      // Try to parse the content as JSON
      const jsonContent = JSON.parse(script.textContent as string);

      // Check if the parsed content matches our identifier
      if (jsonIdentifier(jsonContent)) {
        // If it matches, extract the desired key
        return key.split('.').reduce((obj, k) => obj && obj[k], jsonContent);
      }
    } catch (error) {
      // If parsing fails, move on to the next script tag
      continue;
    }
  }

  console.error('No matching script tag found');
  return null;
}



const convertUrlMatchesToString = (matches: Record<string, string[]>[]) => {
  let output = '';

  matches.forEach((match) => {
    const key = Object.keys(match)[0];
    const value = match[key];
    output += `${key}: ${value}\n`;

  });

  return output;
}

chrome.runtime.onMessage.addListener(async (request) => {
  let matchingSkills: Record<string, string[]>[] = [];

  const processUrls = async () => {

    // Create sidebar when the content script runs -  I want the sidebar to exist when the user right clicks rather than the sidebar showing straight away
    // createSidebar();


    for (const jobWebsiteUrl of jobWebsiteUrls) {
      console.log(`Processing URL: ${jobWebsiteUrl}`);
      const rawHtml = await fetchHtml(jobWebsiteUrl);

      if (!rawHtml) {
        console.error(`Failed to retrieve HTML from ${jobWebsiteUrl}`);
        continue;
      }

      // const parsedHtml = parseHtml(rawHtml);
      // const jobLinks = findLinks(parsedHtml);
      const jobsList = findAndParseJSONFromScripts(
        json => json.props && json.props.pageProps && json.props.pageProps.searchResults && json.props.pageProps.searchResults.jobs,
        'props.pageProps.searchResults.jobs')

      console.log("Job links found:");
      saveJobListToLocalStorage(jobsList);
      matchingSkills = findSkillMatches(jobsList, skillKeywords);
      // urlSkillMatches.push(matchingSkills);
    }

  }

  if (request.action === "summarizeJob") {
    // const skillMatches = await processUrls();
    await processUrls();

    const displayMatches = convertUrlMatchesToString(matchingSkills);
    if (displayMatches > '' )
      injectSidebar(displayMatches);
    else
      alert("No matches found");

    // const event = new CustomEvent('openReactSidebar');
    // window.dispatchEvent(event); 

  }
});

const injectSidebar = (matches: string) => {
  // Check if the sidebar already exists
  if (document.getElementById('browser-extension-sidebar')) {
    return;
  }

  const container = document.createElement('div');
  container.id = 'browser-extension-sidebar';
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<Sidebar open={true}  data={matches} />);
}

// function saveJobList(jobList, timestamp, outputFolder = 'output') {
//     // Ensure the output folder exists
//     if (!fs.existsSync(outputFolder)) {
//         fs.mkdirSync(outputFolder, { recursive: true });
//     }

//     // Save the raw markdown data with timestamp in the filename
//     const rawOutputPath = path.join(outputFolder, `job_list_${timestamp}.md`);

//     // Write each job in the list to the file
//     const fileData = jobList.join('\n');
//     fs.writeFileSync(rawOutputPath, fileData, { encoding: 'utf-8' });

//     console.log(`Job list data saved to ${rawOutputPath}`);
//     return rawOutputPath;
// }



// const processUrl = async (url: string) => {
//   const urlSkillMatches = [];

//   console.log(`Processing URL: ${url}`);
//   const rawHtml = await fetchHtml(url);

//   if (!rawHtml) {
//     console.error(`Failed to retrieve HTML from ${url}`);
//   }

//   const parsedHtml = parseHtml(rawHtml as string);
//   const jobsList = findAndParseJSONFromScripts(
//     json => json.props && json.props.pageProps && json.props.pageProps.searchResults && json.props.pageProps.searchResults.jobs,
//     'props.pageProps.searchResults.jobs')

//   console.log("Job links found:");
//   saveJobListToLocalStorage(jobsList);
//   const matchingSkills = findSkillMatches(jobsList, skillKeywords);

//   return matchingSkills;
// }



// const isJobListingPage = () => {
//   // This function will need to be customized for each job site
//   // Here's a generic example:
//   const jobListings = document.querySelectorAll('.job-listing');  // Adjust selector as needed
//   return jobListings.length > 1;  // Assume it's a listing page if multiple job items are found
// }



// Extract job description and find keywords
// const findKeywordsInText = (text: string, url: string) => {
//   let keywordFound = false;

//   for (const keyword of skillKeywords) {
//     if (text.toLowerCase().includes(keyword.toLowerCase())) {
//       console.log(`Keyword '${keyword}' found in job: ${url}`);
//       foundUrls.push(url);
//       keywordFound = true;
//       break; // Stop checking after the first match
//     }
//   }

//   return keywordFound;
// }

// Parse the HTML and clean up unnecessary tags (like headers and footers)
// const parseHtml = (htmlContent: string) => {
//   const parser = new DOMParser();
//   const doc = parser.parseFromString(htmlContent, "text/html");

//   // Remove header and footer elements
//   const headers = doc.querySelectorAll('header, footer');
//   headers.forEach(element => element.remove());

//   return doc.body.innerHTML;
// }

// Extract links to job listings from the HTML
// const  findLinks = (htmlContent: string) => {
//   const parser = new DOMParser();
//   const doc = parser.parseFromString(htmlContent, "text/html");

//   const jobCardLinks = doc.querySelectorAll('a[data-element="job_title"]'); // need to think how this can be done better because the attributes might change
//   const jobLinks:  string[]= [];

//   jobCardLinks.forEach(link => {
//     const anchor = link as HTMLAnchorElement;
//     jobLinks.push(anchor.href);
//   });

//   return jobLinks;
// }


// const createSidebar = () => {
//   const sidebar = document.createElement('div');
//   sidebar.id = 'job-keyword-finder-sidebar';
//   sidebar.innerHTML = `
//     <div class="sidebar-header">
//       <h2>Keyword summary</h2>
//       <button id="close-sidebar">X</button>
//     </div>
//     <div id="sidebar-content"></div>
//   `;
//   document.body.appendChild(sidebar);

//   // Add event listener to close button
//   document.getElementById('close-sidebar')?.addEventListener('click', () => {
//     sidebar.style.display = 'none';
//   });

//   // Inject CSS
//   const style = document.createElement('style');
//   style.textContent = `
//     #my-extension-sidebar {
//       position: fixed;
//       top: 0;
//       right: 0;
//       width: 300px;
//       height: 100%;
//       background: white;
//       box-shadow: -2px 0 5px rgba(0,0,0,0.2);
//       z-index: 9999;
//       overflow-y: auto;
//     }
//     .sidebar-header {
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//       padding: 10px;
//       background: #f0f0f0;
//     }
//     #sidebar-content {
//       padding: 10px;
//     }
//   `;
//   document.head.appendChild(style);
// }




// const processUrls = async () => {
//   let matchingSkills: Record<string, string[]>[] = [];

//   // Create sidebar when the content script runs -  I want the sidebar to exist when the user right clicks rather than the sidebar showing straight away
//   // createSidebar();


//   for (const jobWebsiteUrl of jobWebsiteUrls) {
//     console.log(`Processing URL: ${jobWebsiteUrl}`);
//     const rawHtml = await fetchHtml(jobWebsiteUrl);

//     if (!rawHtml) {
//       console.error(`Failed to retrieve HTML from ${jobWebsiteUrl}`);
//       continue;
//     }

//     // const parsedHtml = parseHtml(rawHtml);
//     // const jobLinks = findLinks(parsedHtml);
//     const jobsList = findAndParseJSONFromScripts(
//       json => json.props && json.props.pageProps && json.props.pageProps.searchResults && json.props.pageProps.searchResults.jobs,
//       'props.pageProps.searchResults.jobs')

//     console.log("Job links found:");
//     saveJobListToLocalStorage(jobsList);
//     matchingSkills = findSkillMatches(jobsList, skillKeywords);
//     // urlSkillMatches.push(matchingSkills);
//   }

//   // return matchingSkills;
//   return (<Sidebar />);
// }