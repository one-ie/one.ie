# Media Directory

This directory contains video and audio files for the ONE Platform.

## Usage

Place your video files here:
- `*.mp4` - Standard video format
- `*.mov` - QuickTime video format
- `*.webm` - Web-optimized video format
- `*.avi` - Legacy video format
- `*.mkv` - Matroska video format

## Git Policy

**Video files are NOT committed to git** (they're too large).

The `.gitignore` file ignores all video files in this directory, but keeps the directory structure via `.gitkeep`.

## File Organization

Recommended structure:
```
public/media/
├── tutorials/
│   ├── install.mov
│   ├── quickstart.mp4
│   └── advanced.mp4
├── demos/
│   └── product-demo.mp4
└── courses/
    ├── lesson-1.mp4
    ├── lesson-2.mp4
    └── lesson-3.mp4
```

## How to Add Videos

1. Place video file in this directory (or subdirectory)
2. Reference in video markdown files:
   ```markdown
   ---
   title: "My Video"
   videoUrl: "/media/tutorials/install.mov"
   ---
   ```

3. File will be served at the URL path (e.g., `/media/tutorials/install.mov`)

## File Size Recommendations

- **Keep videos under 100MB** when possible
- Use compression tools like HandBrake or FFmpeg
- Consider hosting large files on:
  - YouTube (free, unlimited)
  - Cloudflare Stream (premium features)
  - Vimeo (high quality)

## Video Format Recommendations

**Best compatibility:**
- **MP4 with H.264 codec** (plays everywhere)
- Resolution: 1920×1080 or 1280×720
- Bitrate: 5-8 Mbps for 1080p, 2.5-4 Mbps for 720p

**Web optimized:**
- **WebM with VP9 codec** (smaller files, modern browsers)
- Resolution: Same as above
- Bitrate: 30-40% lower than MP4

## Converting Videos

Using FFmpeg:

```bash
# Convert to web-optimized MP4
ffmpeg -i input.mov -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4

# Convert to WebM
ffmpeg -i input.mov -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus output.webm

# Create thumbnail
ffmpeg -i input.mov -ss 00:00:10 -vframes 1 -q:v 2 thumbnail.jpg
```

## Deployment

**For production deployments:**

1. **Option 1: CDN** (Recommended)
   - Upload videos to Cloudflare R2, AWS S3, or similar
   - Update `videoUrl` to point to CDN URL
   - Fast global delivery

2. **Option 2: YouTube**
   - Upload to YouTube
   - Use `youtubeId` instead of `videoUrl`
   - Automatic thumbnails and CDN

3. **Option 3: Include in build** (Small files only)
   - Keep files under 10MB
   - Served directly from Cloudflare Pages
   - Included in deployment bundle

## Support

For questions about video hosting, compression, or optimization, see:
- [Video Documentation](/docs/develop/videos)
- [Performance Guide](/docs/develop/performance)
