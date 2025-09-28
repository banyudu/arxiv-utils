browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    const activeTab = (await browser.tabs.query({ active: true, currentWindow: true }))?.[0];
    console.log("Received request in bg: ", request);
    
    // Handle download progress messages from content script
    if (request.action === "downloadStarted") {
        try {
            await browser.action.setBadgeText({ text: "⏳" });
            await browser.action.setBadgeBackgroundColor({ color: "#FFA500" });
            await browser.action.setTitle({ title: "Downloading PDF..." });
        } catch (error) {
            console.log("Badge API not available:", error);
        }
    } else if (request.action === "downloadCompleted") {
        try {
            await browser.action.setBadgeText({ text: "✓" });
            await browser.action.setBadgeBackgroundColor({ color: "#28A745" });
            await browser.action.setTitle({ title: "Download completed!" });
            // Clear badge after 3 seconds
            setTimeout(async () => {
                await browser.action.setBadgeText({ text: "" });
                await browser.action.setTitle({ title: "ArXiv Utils" });
            }, 3000);
        } catch (error) {
            console.log("Badge API not available:", error);
        }
    } else if (request.action === "downloadError") {
        try {
            await browser.action.setBadgeText({ text: "❌" });
            await browser.action.setBadgeBackgroundColor({ color: "#DC3545" });
            await browser.action.setTitle({ title: `Download failed: ${request.error}` });
            // Clear badge after 5 seconds
            setTimeout(async () => {
                await browser.action.setBadgeText({ text: "" });
                await browser.action.setTitle({ title: "ArXiv Utils" });
            }, 5000);
        } catch (error) {
            console.log("Badge API not available:", error);
        }
    }
    
    return Promise.resolve({ test: activeTab.id });
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
        
        // Provide immediate feedback when extension icon is clicked
        // try {
        //     await browser.action.setBadgeText({ text: "..." });
        //     await browser.action.setBadgeBackgroundColor({ color: "#007BFF" });
        //     await browser.action.setTitle({ title: "Preparing download..." });
        // } catch (error) {
        //     console.log("Badge API not available:", error);
        // }
        
        // Safari doesn't support downloads API, so we use the content script to download
        browser.tabs.sendMessage(activeTab.id, { action: "download", url: pdfUrl, filename });
    }
});
