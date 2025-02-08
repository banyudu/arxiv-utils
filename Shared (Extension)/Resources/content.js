browser.runtime.sendMessage({ greeting: "hello" }).then((response) => {
//    console.log("Received response in cs: ", response);
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
//    console.log("Received request in cs: ", request);
    if (request.action === "download") {
        const url = request.url;
        const filename = request.filename;
//        const link = document.createElement('a');
//        link.href = url;
//        link.download = filename;
//        link.target = "_blank";
//        link.click();
//        const pdf = await fetch(url).then(response => response.blob());
//        const file = new File([pdf], filename, { type: "application/pdf" });
//        navigator.share({ files: [file] });
        // Fetch the file data
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                // Create an object URL for the blob
                const url = URL.createObjectURL(blob);
                
                // Create an anchor element and trigger a download
                const link  = document.createElement("a");
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
    }
});

console.log("injection arxiv-utils script on " + document.location.href);

