# Arxiv Utils for Safari

This is a Safari extension that adds a download emoji to PDF links on arxiv.org.

The filename of the downloaded PDF will be the id and title of the paper.
> e.g. `[2501.09166] Attention is All You Need Until You Need Retention.pdf`

## Screenshots

![Screenshot](./docs/assets/arxiv-utils-screenshot-1.png)

![Screenshot](./docs/assets/arxiv-utils-screenshot-2.png)

## Installation

Since this extension is not available on the Safari Extensions Gallery (caused by the $99/year fee), you have to compile and install it manually.

## 🤝 Looking for a Publisher

**I don't have a Safari developer account and would love help from someone who does!**

If you have a Safari developer account and would like to help publish this extension to the Safari Extensions Gallery, I would be incredibly grateful. You are welcome to:

- Brand the extension with your own name/company
- Take full credit as the publisher
- Make any reasonable modifications needed for App Store compliance

This would help make the extension easily accessible to all Safari users without requiring manual compilation. If you're interested in helping, please open an issue or contact me directly.

For now, here's how to install it manually:

1. Clone this repository.
2. Open the `arxiv-utils.xcodeproj` file with Xcode.
3. [Optional] Change the `Bundle Identifier` to your own.
4. [Optional] Change the `Signing & Capabilities` to your own.
5. Build the project.
6. Open the built `arxiv-utils.app` file.
7. Open Safari and allow unsigned extensions in the `Preferences` -> `Developr` menu.
    ![Screenshot](./docs/assets/safari-screenshot-1.png)
8. Open Safari and enable the extension in the `Preferences` -> `Extensions` -> `Arxiv Utils`.
    ![Screenshot](./docs/assets/safari-screenshot-2.png)

