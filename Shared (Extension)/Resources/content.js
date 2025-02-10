function getPaperIdFromUrl(url) {
  return url.split("/").pop().replace(/[?#].*$/, '');
}

function formatFilename(paperId, title) {
  return `[${paperId}] ${title}.pdf`;
}

function download(url, filename) {
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
}

function buildDownloadAnchor(url, filename) {
  const downloadAnchor = document.createElement("a");
  downloadAnchor.href = "#";
  // download emoji
  downloadAnchor.innerText = " ⬇️";
  downloadAnchor.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    download(url, filename);
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
    download(url, filename);
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
}
