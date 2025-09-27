# 🎵 SpotBeats

A modern, Spotify-inspired music player for smooth streaming, playlist control, and immersive listening — built with HTML, CSS, and JavaScript.

![SpotBeats Interface](https://github.com/user-attachments/assets/f37b5b42-90a7-4008-aa0c-59af810a768c)

## ✨ Features

- 🎧 Stream MP3 songs directly from cloud storage
- ☁️ Cloud-based architecture for fast global access
- 📂 Songs organized with dynamic JSON configuration
- 🔍 Search & filter functionality for quick discovery
- 📱 Responsive design optimized for all devices
- ⚡ Lightning-fast loading with CDN-powered delivery
- 🎨 Modern UI/UX inspired by popular streaming platforms
- 📊 Dynamic playlists managed through JSON configuration

## 🏗️ Architecture Overview

SpotBeats now uses a cloud-first architecture where:

- 🎵 Audio files are hosted on cloud storage (CDN)
- 📋 Song metadata is managed via JSON configuration
- 🌐 Frontend fetches data dynamically from cloud endpoints
- 📱 Zero local storage requirement for songs

This approach ensures:

- Faster loading times globally
- Easier content management
- Better scalability
- Reduced bandwidth for users

## 🎼 Adding Your Own Songs

### Method 1: Update JSON Configuration

1. Upload your MP3 files to your preferred cloud storage (AWS S3, Google Cloud, Cloudinary, etc.)
2. Get the public URLs for your uploaded files
3. Update the JSON configuration with your song details:

```

--------------------------------------------------------------------------------------

{
  "albums": [
    {
      "name": "My Playlist",
      "songs": [
        {
          "title": "Your Song Title",
          "artist": "Artist Name",
          "duration": "3:45",
          "url": "https://your-cloud-storage.com/path/to/song.mp3",
          "cover": "https://your-cloud-storage.com/path/to/cover.jpg"
        }
      ]
    }
  ]
}

-------------------------------------------------------------------------------------
Cloudinary - Media optimization included

-------------------------------------------------------------------------------------

🚀 Getting Started

1️⃣ Clone the Repository

git clone https://github.com/dev-abuhurera/SpotBeats.git
cd SpotBeats

--------------------------------------------------------------------------------------

2️⃣ Run Locally

# Option 1: Simple HTTP server
python -m http.server 8000
# or
npx serve .

--------------------------------------------------------------------------------------


4️⃣ Access Your Player

Open http://localhost:8000 in your browser and enjoy your music!

-----------------------------------------------------------------------------------------------------------------------------------------

```


```
📦 Deployment

SpotBeats is optimized for static hosting and works seamlessly with:

Recommended Platforms:

Vercel ⭐ - Live Demo

Quick Deploy to Vercel:

npm i -g vercel
vercel --prod
Environment Variables (if needed):

```










