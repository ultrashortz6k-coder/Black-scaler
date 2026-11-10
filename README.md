# Ultra Upscale

A free, mobile-friendly, browser-based video enhancement starter app. It uses FFmpeg.wasm to apply practical video filters locally in the browser.

## Features
- Mobile-friendly white and purple interface
- Video preview and upload
- Balanced, sharper and clean-video presets
- Optional denoising, sharpening and contrast adjustment
- Keep original resolution, 2× upscale, or fit within 1080p
- MP4 export and download
- Video processing happens in the browser; files are not uploaded to an Ultra Upscale server

## Run locally
Because the app loads FFmpeg and its WebAssembly core from a CDN, serve the folder over HTTP (not by opening `index.html` as a file).

For example, with Python installed:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000`.

## Publish free with GitHub Pages
1. Create a new public repository on GitHub named `ultra-upscale`.
2. Upload all files and folders from this project to the repository's root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then press **Save**.
6. Wait for GitHub to publish the site. The Pages URL will appear in that section.

A GitHub Actions workflow is included to publish the root folder automatically when you push to `main`. If you use that workflow, select **GitHub Actions** as the Pages build source in Settings → Pages.

## Important limitations
This is not a clone of Topaz Video AI and does not contain Topaz's proprietary models or code. It uses conventional FFmpeg filters and Lanczos scaling, not trained AI detail reconstruction. It can improve perceived clarity but cannot reliably recover details that are absent from the source.

Browser-based video encoding is demanding. Long/high-resolution clips may be slow or exceed a phone's available memory. Start with a short clip (around 10–20 seconds) and use Chrome on a recent device. Keep the tab open during processing.

The FFmpeg JavaScript and core files are loaded from public CDNs. For a production release, pin and self-host reviewed dependencies and add proper testing across target mobile browsers.
