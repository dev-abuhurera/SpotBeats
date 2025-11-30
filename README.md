
# 🎵 SpotBeats

A modern, Spotify-inspired music player for smooth streaming, playlist control, and immersive listening — built with **HTML**, **CSS**, and **JavaScript**.

<img width="1919" height="917" alt="image" src="https://github.com/user-attachments/assets/f37b5b42-90a7-4008-aa0c-59af810a768c" />

---

## ✨ Features
- 🎧 **Play MP3 songs** directly in your browser  
- 📂 Songs neatly organized into categories  
- 🔍 **Search & filter** functionality for quick access  
- 📱 **Responsive design** for all devices  
- ⚡ **Fast loading** powered by Git LFS for large media files  

---


## 🎼 Adding Your Own Songs
You can customize SpotBeats with your own music collection!  

1. **Locate the folder**  
   Open the `songs/` directory in your project. Inside, you’ll see multiple subfolders for different albums or playlists.  

2. **Paste your MP3 file**  
   Place your `.mp3` file inside the album folder where you want it to appear.  
   Example:

```plaintext
songs/
├── Albums/
│   ├── new-song.mp3
│   ├── Existing Song.mp3

```

3. **Update the JSON file**
   Add the song in the particular song folder and mention it's name in the `songs.json` file

4. **Refresh the player** 

   

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/dev-abuhurera/SpotBeats.git
cd SpotBeats
```

###2️⃣ Install Git LFS (Required for MP3 files)
```bash
git lfs install
git lfs pull
```

###3️⃣ Run Locally
```bash
Option 1: Open index.html in your browser

Option 2: Start a local server:
```

###📦 Deployment

SpotBeats can be deployed easily using Netlify, Vercel, or any static hosting provider.
Example for Netlify:

netlify deploy


=======
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









