browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    const activeTab = (await browser.tabs.query({ active: true, currentWindow: true }))?.[0];
    console.log("Received request in bg: ", request);
    return Promise.resolve({ test: activeTab.id });

    if (request.greeting === "hello")
        return Promise.resolve({ farewell: "goodbye" });
});

browser.action.onClicked.addListener(async (request, sender, sendResponse) => {
    const activeTab = (await browser.tabs.query({ active: true, currentWindow: true }))?.[0];
    if (!activeTab) {
        return;
    }
    
    const url = activeTab.url;

    browser.tabs.sendMessage(activeTab.id, { greeting: "hello1", url });
    
    if (url?.startsWith("https://arxiv.org/abs/")) {
        const paperId = url.split("/").pop().replace(/[?#].*$/, '');
        const title = activeTab.title;
        const pdfUrl = `https://arxiv.org/pdf/${paperId}`;
        const filename = `${title}.pdf`;
        browser.tabs.sendMessage(activeTab.id, { action: "download", url: pdfUrl, filename });
        
        // Safari doesn't support downloads API
//        try {
//            browser.tabs.sendMessage(activeTab.id, { greeting: "download-options", pdfUrl, filename });
//            browser.tabs.sendMessage(activeTab.id, { greeting: "debug", type: typeof browser.downloads });
//            const downloadId = await browser.downloads.download({ url: pdfUrl, filename: 'a.pdf', saveAs: true });
//            console.log("Download id: ", downloadId);
//            browser.tabs.sendMessage(activeTab.id, { greeting: "downloadId", downloadId });
//        } catch (error) {
//            console.error("Download error: ", error);
//            browser.tabs.sendMessage(activeTab.id, { greeting: "downloadError", error: JSON.stringify(error) });
//        }
//        await browser.downloads.download({ url: pdfUrl, filename });
    }
});
