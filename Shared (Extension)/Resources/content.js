function getPaperIdFromUrl(url) {
  return url.split("/").pop().replace(/[?#].*$/, '');
}

function formatFilename(paperId, title) {
  return `[${paperId}] ${title}.pdf`;
}

function download(url, filename, onStart = null, onComplete = null, onError = null) {
  if (onStart) onStart();
  
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.blob();
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      if (onComplete) onComplete();
    })
    .catch(error => {
      console.error('Download failed:', error);
      if (onError) onError(error);
    });
}

function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations) => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element with selector "${selector}" not found within ${timeout}ms`));
    }, timeout);
  });
}

function buildDownloadAnchor(url, filename) {
  const downloadAnchor = document.createElement("a");
  downloadAnchor.href = "#";
  // download emoji
  const originalEmoji = " ⬇️";
  const loadingEmoji = " ⏳";
  const errorEmoji = " ❌";
  
  // Add CSS styles to prevent flickering and enable animation
  downloadAnchor.style.cssText = `
    display: inline-block;
    line-height: 1;
    height: 1em;
    font-size: 14px;
    vertical-align: baseline;
    text-decoration: none;
    transition: transform 0.1s ease;
    margin-left: 0.2em;
  `;
  
  // Add CSS animation keyframes if not already added
  if (!document.getElementById('arxiv-download-animations')) {
    const style = document.createElement('style');
    style.id = 'arxiv-download-animations';
    style.textContent = `
      @keyframes arxiv-loading-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .arxiv-loading {
        animation: arxiv-loading-spin 2s linear infinite;
        display: inline-block;
      }
    `;
    document.head.appendChild(style);
  }
  
  downloadAnchor.innerText = originalEmoji;
  downloadAnchor.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Prevent multiple clicks while downloading
    if (downloadAnchor.classList.contains('arxiv-loading')) {
      return;
    }
    
    download(
      url, 
      filename,
      // onStart
      () => {
        downloadAnchor.innerText = loadingEmoji;
        downloadAnchor.title = "Downloading...";
        downloadAnchor.classList.add('arxiv-loading');
      },
      // onComplete
      () => {
        downloadAnchor.classList.remove('arxiv-loading');
        downloadAnchor.innerText = originalEmoji;
        downloadAnchor.title = "Download complete";
        setTimeout(() => {
          downloadAnchor.title = "";
        }, 2000);
      },
      // onError
      (error) => {
        downloadAnchor.classList.remove('arxiv-loading');
        downloadAnchor.innerText = errorEmoji;
        downloadAnchor.title = `Download failed: ${error.message}`;
        setTimeout(() => {
          downloadAnchor.innerText = originalEmoji;
          downloadAnchor.title = "";
        }, 3000);
      }
    );
  }
  return downloadAnchor
}

browser.runtime.sendMessage({ greeting: "hello" }).then((response) => {
  //    console.log("Received response in cs: ", response);
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //    console.log("Received request in cs: ", request);
  if (request.action === "download") {
    const url = request.url;
    const filename = request.filename;
    
    // Notify background script about download progress
    download(
      url, 
      filename,
      // onStart
      () => {
        browser.runtime.sendMessage({ action: "downloadStarted" });
      },
      // onComplete  
      () => {
        browser.runtime.sendMessage({ action: "downloadCompleted" });
      },
      // onError
      (error) => {
        browser.runtime.sendMessage({ action: "downloadError", error: error.message });
      }
    );
  }
});

// add quick download buttons
if (document.location.href.startsWith("https://arxiv.org/list")) {
  // https://arxiv.org/list/cs.AI/recent
  const pdfLinks = Array.from(document.querySelectorAll("a[title='Download PDF']"));
  pdfLinks.forEach(link => {
    const url = link.href;
    const paperId = getPaperIdFromUrl(link.href);
    const titleNode = link.parentElement?.nextElementSibling?.querySelectorAll("div.list-title")[0];
    const title = titleNode.innerText?.trim();
    const filename = formatFilename(paperId, title);

    const downloadAnchor = buildDownloadAnchor(url, filename);
    link.appendChild(downloadAnchor);
  });
} else if (document.location.href.startsWith("https://arxiv.org/abs/")) {
  // https://arxiv.org/abs/2501.09166
  const link = document.querySelector("a.download-pdf");
  const url = link?.href;
  const title = document.title;
  const filename = `${title}.pdf`

  const downloadAnchor = buildDownloadAnchor(url, filename);
  link.appendChild(downloadAnchor);
  link.appendChild(downloadAnchor);
} else if (document.location.href.startsWith("https://arxiv.org/search")) {
  // https://arxiv.org/search/?query=attention&searchtype=all&abstracts=show&order=-announced_date_first&size=50
  const pdfLinks = Array.from(document.querySelectorAll("li.arxiv-result .list-title a")).filter(link => link.innerText === "pdf");
  pdfLinks.forEach(link => {
    const url = link.href;
    const paperId = getPaperIdFromUrl(link.href);

    const arxivResult = link.closest("li.arxiv-result");
    const titleNode = arxivResult.querySelector("p.title");

    const title = titleNode.innerText?.trim();
    const filename = formatFilename(paperId, title);

    const downloadAnchor = buildDownloadAnchor(url, filename);
    link.appendChild(downloadAnchor);
  });
} else if (document.location.href.startsWith("https://www.alphaxiv.org/abs/")) {
  // https://www.alphaxiv.org/abs/2509.20427
  // Wait for the download button to appear since it may have latency
  waitForElement('svg[aria-label="Download from arXiv"]').then(icon => {
    const button = icon.parentElement;
    const paperId = getPaperIdFromUrl(document.location.href);
    const title = document.title.replace(/^\[.*?\]\s*/, '').replace(/\s*-\s*arXiv.*$/, '').trim();
    const url = `https://www.arxiv.org/pdf/${paperId}`;
    const filename = formatFilename(paperId, title);

    const downloadAnchor = buildDownloadAnchor(url, filename);
    
    // Insert the download button after the existing download button
    button.parentNode.insertBefore(downloadAnchor, button.nextSibling);
  }).catch(error => {
    console.error('Could not find alphaxiv download button:', error);
  });
}
