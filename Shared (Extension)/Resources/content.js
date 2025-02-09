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


// https://arxiv.org/list/cs.AI/recent
// add quick download button to the list page
if (document.location.href.startsWith("https://arxiv.org/list")) {
  const pdfLinks = Array.from(document.querySelectorAll("a[title='Download PDF']"));
  pdfLinks.forEach(link => {
    const url = link.href;
    const paperId = link.href.split("/").pop();
    const titleNode = link.parentElement?.nextElementSibling?.querySelectorAll("div.list-title")[0];
    const title = titleNode.innerText?.trim();
    const filename = `[${paperId}] ${title}.pdf`

    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = "#";
    // download emoji
    downloadAnchor.innerText = " ⬇️";
    // downloadAnchor.innerText = "";
    downloadAnchor.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      download(url, filename);
    }
    link.appendChild(downloadAnchor);
  });
}
