let currentSong = new Audio();
let songs = [];          // will hold array of song URLs
let currFolder = "";     // holds current playlist key
let isMuted = false;
let lastVolume = 0.5;    // default volume (50%)

// URLs to your data files
const SONGS_JSON_URL = "/data/songs.json";
const CARDS_JSON_URL = "/data/cards.json";

// Cache for loaded data
let allSongs = {};
let allCards = [];

// Lazy loading variables
let loadedCardsCount = 0;
const CARDS_PER_BATCH = 6; // Load 6 cards at a time

// Load all songs from the master JSON file
async function loadAllSongs() {
    try {
        const response = await fetch(SONGS_JSON_URL);
        allSongs = await response.json();
        console.log("All songs loaded:", allSongs);
    } catch (error) {
        console.error("Error loading songs.json:", error);
    }
}

// Load all card data from cards.json
async function loadAllCards() {
    try {
        const response = await fetch(CARDS_JSON_URL);
        const cardData = await response.json();
        allCards = cardData.playlists;
        console.log("All cards loaded:", allCards);
    } catch (error) {
        console.error("Error loading cards.json:", error);
        allCards = [];
    }
}

// Fetch songs from the loaded data
async function getSongsFromCloud(folderKey) {
    // Load songs if not already loaded
    if (Object.keys(allSongs).length === 0) {
        await loadAllSongs();
    }
    
    if (!allSongs[folderKey]) {
        console.error(`No playlist found for key: ${folderKey}`);
        return;
    }
    
    currFolder = folderKey;
    songs = allSongs[folderKey];
    
    console.log("Songs for", folderKey, ":", songs);
    renderSongList(songs);
}

// Function to create a single music card with lazy loading
function createMusicCard(cardData) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-folder', cardData.folder);
    
    // Create placeholder image for lazy loading
    const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="100%25" height="100%25" fill="%23333"/%3E%3Ctext x="50%25" y="50%25" fill="%23666" text-anchor="middle" dy=".3em"%3ELoading...%3C/text%3E%3C/svg%3E';
    
    card.innerHTML = `
        <img class="play" src="/img/playButton.svg" alt="playbutton">
        <img src="${placeholder}" data-src="${cardData.image}" class="lazy-load album-cover" alt="album cover">
        <h2>${cardData.title}</h2>
        <p>${cardData.artist}</p>
    `;
    
    return card;
}

// Setup lazy loading of images using Intersection Observer
function setupLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                // Add loading class for smooth transition
                img.style.opacity = '0.5';
                img.src = img.dataset.src;
                
                img.onload = () => {
                    img.style.opacity = '1';
                    img.classList.remove('lazy-load');
                    observer.unobserve(img);
                };
                
                img.onerror = () => {
                    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="100%25" height="100%25" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" fill="%23999" text-anchor="middle" dy=".3em"%3EImage Error%3C/text%3E%3C/svg%3E';
                    img.classList.remove('lazy-load');
                    observer.unobserve(img);
                };
            }
        });
    }, {
        rootMargin: '50px' // Start loading 50px before entering viewport
    });

    document.querySelectorAll('.lazy-load').forEach(img => {
        imageObserver.observe(img);
    });
}

// Progressive loading of cards
function loadNextBatch() {
    const cardContainer = document.querySelector('.card-container');
    if (!cardContainer) {
        console.error('Card container not found');
        return;
    }

    const endIndex = Math.min(loadedCardsCount + CARDS_PER_BATCH, allCards.length);
    
    for (let i = loadedCardsCount; i < endIndex; i++) {
        if (allCards[i]) {
            const card = createMusicCard(allCards[i]);
            cardContainer.appendChild(card);
        }
    }
    
    loadedCardsCount = endIndex;
    
    // Setup lazy loading for newly added images
    setupLazyLoading();
    attachCardEventListeners();
    
    // Add "Load More" button if there are more cards
    if (loadedCardsCount < allCards.length) {
        addLoadMoreButton();
    } else {
        removeLoadMoreButton();
    }
}

// Add "Load More" button
function addLoadMoreButton() {
    const cardContainer = document.querySelector('.card-container');
    let loadMoreBtn = document.getElementById('load-more-btn');
    
    if (!loadMoreBtn) {
        loadMoreBtn = document.createElement('button');
        loadMoreBtn.id = 'load-more-btn';
        loadMoreBtn.textContent = `Load More (${allCards.length - loadedCardsCount} remaining)`;
        loadMoreBtn.style.cssText = `
            width: 100%;
            padding: 15px;
            background: #1db954;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 20px;
            font-size: 16px;
        `;
        
        loadMoreBtn.addEventListener('click', loadNextBatch);
        cardContainer.appendChild(loadMoreBtn);
    } else {
        loadMoreBtn.textContent = `Load More (${allCards.length - loadedCardsCount} remaining)`;
    }
}

// Remove "Load More" button
function removeLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.remove();
    }
}

// Function to render music cards with progressive loading
function renderMusicCards(cardsData = allCards) {
    const cardContainer = document.querySelector('.card-container');
    
    if (!cardContainer) {
        console.error('Card container not found');
        return;
    }
    
    // Reset for new data set (like filtered results)
    cardContainer.innerHTML = '';
    loadedCardsCount = 0;
    
    // Update allCards if filtered data is passed
    if (cardsData !== allCards) {
        // For filtered results, load all at once
        cardsData.forEach(cardData => {
            const card = createMusicCard(cardData);
            cardContainer.appendChild(card);
        });
        setupLazyLoading();
        attachCardEventListeners();
    } else {
        // For normal loading, use progressive loading
        loadNextBatch();
    }
}

// Preload audio on card hover
function attachCardEventListeners() {
    document.querySelectorAll(".card").forEach(card => {
        // Preload songs on hover for faster loading
        card.addEventListener("mouseenter", async () => {
            const folderKey = card.dataset.folder;
            if (!allSongs[folderKey]) {
                console.log("Preloading songs for", folderKey);
                if (Object.keys(allSongs).length === 0) {
                    await loadAllSongs();
                }
            }
        });
        
        // Play on click
        card.addEventListener("click", () => {
            const folderKey = card.dataset.folder;
            getSongsFromCloud(folderKey);
        });
    });
}

// Function to add a new music card dynamically
function addMusicCard(cardData) {
    allCards.push(cardData);
    
    const cardContainer = document.querySelector('.card-container');
    if (!cardContainer) {
        console.error('Card container not found');
        return;
    }
    
    const newCard = createMusicCard(cardData);
    cardContainer.appendChild(newCard);
    
    setupLazyLoading();
    
    newCard.addEventListener("click", () => {
        const folderKey = newCard.dataset.folder;
        getSongsFromCloud(folderKey);
    });
}

// Function to remove a music card
function removeMusicCard(folder) {
    const index = allCards.findIndex(card => card.folder === folder);
    if (index > -1) {
        allCards.splice(index, 1);
    }
    
    const cardToRemove = document.querySelector(`[data-folder="${folder}"]`);
    if (cardToRemove) {
        cardToRemove.remove();
    }
}

// Function to update an existing card
function updateMusicCard(folder, newData) {
    const index = allCards.findIndex(card => card.folder === folder);
    if (index > -1) {
        allCards[index] = { ...allCards[index], ...newData };
        
        const cardElement = document.querySelector(`[data-folder="${folder}"]`);
        if (cardElement) {
            const img = cardElement.querySelector('img:not(.play)');
            const title = cardElement.querySelector('h2');
            const artist = cardElement.querySelector('p');
            
            if (newData.image) {
                img.dataset.src = newData.image;
                img.classList.add('lazy-load');
                setupLazyLoading();
            }
            if (newData.title) title.textContent = newData.title;
            if (newData.artist) artist.textContent = newData.artist;
            if (newData.folder) cardElement.setAttribute('data-folder', newData.folder);
        }
    }
}

// Function to filter and display cards based on search
function filterMusicCards(searchTerm) {
    const filteredCards = allCards.filter(card => 
        card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderMusicCards(filteredCards);
}

// Function to sort cards
function sortMusicCards(sortBy = 'title') {
    const sortedCards = [...allCards].sort((a, b) => {
        return a[sortBy].toLowerCase().localeCompare(b[sortBy].toLowerCase());
    });
    renderMusicCards(sortedCards);
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Render song list UI
function renderSongList(songArray) {
    const songUL = document.querySelector('.songslist ul');
    songUL.innerHTML = "";

    songArray.forEach(songURL => {
        const urlParts = songURL.split('/');
        const filenameWithId = urlParts[urlParts.length - 1];
        

        const songName = filenameWithId
        .replace('.mp3', '')
        .replace(/_/g, ' ')
        .replace(/\s+[a-z0-9]{6,}$/i, ''); // Remove trailing Cloudinary ID
        
        songUL.innerHTML += `
            <li>
                <img class="invert" src="https://www.svgrepo.com/show/532708/music.svg">
                <div class="info">
                    <div class="song-name">${songName}</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="/img/playButton.svg">
                </div>
            </li>`;
    });

    document.querySelectorAll(".songslist li").forEach((li, index) => {
        li.addEventListener("click", () => {
            playMusic(songs[index]);
        });
    });
}

// Play a song from URL
function playMusic(songURL, pause = false) {
    if (!songURL) return;

    currentSong.src = songURL;

    if (!pause) {
        currentSong.play();
        play.src = "/img/pause.png";
    } else {
        play.src = "/img/playButton.svg";
    }

    const urlParts = songURL.split('/');
    const filenameWithId = urlParts[urlParts.length - 1];
    const songName = filenameWithId
    .replace('.mp3', '')
    .replace(/_/g, ' ')
    .replace(/\s+[a-z0-9]{6,}$/i, '');
    
    document.querySelector(".songinfo").innerHTML = songName;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    currentSong.volume = lastVolume;
    document.querySelector('.volume-slider').value = lastVolume * 100;
    updateVolumeIcon();
}

// Update volume icon
function updateVolumeIcon() {
    const volumeIcon = document.querySelector('.volume-icon');
    if (isMuted || currentSong.volume === 0) {
        volumeIcon.src = '/img/mute.png';
    } else if (currentSong.volume < 0.5) {
        volumeIcon.src = '/img/volume-decrease.png';
    } else {
        volumeIcon.src = '/img/volume.png';
    }
}

// Main app
async function main() {
    // Load both data files
    await loadAllCards();
    await loadAllSongs();
    
    // Generate dynamic music cards with lazy loading
    renderMusicCards();
    
    // Load initial playlist
    await getSongsFromCloud("cs");
    if (songs.length > 0) playMusic(songs[0], true);

    // Play/Pause button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "/img/pause.png";
        } else {
            currentSong.pause();
            play.src = "/img/playButton.svg";
        }
    });

    // Update time display
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seek bar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Volume slider
    const volumeSlider = document.querySelector('.volume-slider');
    const volumeIcon = document.querySelector('.volume-icon');
    currentSong.volume = lastVolume;
    volumeSlider.value = lastVolume * 100;
    updateVolumeIcon();

    volumeSlider.addEventListener('input', function () {
        currentSong.volume = this.value / 100;
        lastVolume = currentSong.volume;
        isMuted = false;
        updateVolumeIcon();
    });

    // Mute/Unmute
    volumeIcon.addEventListener('click', function () {
        if (isMuted) {
            currentSong.volume = lastVolume;
            volumeSlider.value = lastVolume * 100;
            isMuted = false;
        } else {
            lastVolume = currentSong.volume;
            currentSong.volume = 0;
            volumeSlider.value = 0;
            isMuted = true;
        }
        updateVolumeIcon();
    });

    // Menu toggle
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
        document.querySelector(".hamburger").style.display = "none";
        document.querySelector(".close-img").style.display = "block";
    });
    document.querySelector(".close-img").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-125%";
        document.querySelector(".hamburger").style.display = "block";
        document.querySelector(".close-img").style.display = "none";
    });

    // Previous Button
    previous.addEventListener("click", () => {
        const currentIndex = songs.findIndex(url => url === currentSong.src);
        if (currentIndex === -1) {
            if (songs.length > 0) playMusic(songs[0]);
            return;
        }
        const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
        playMusic(songs[prevIndex]);
    });

    // Next Button
    next.addEventListener("click", () => {
        const currentIndex = songs.findIndex(url => url === currentSong.src);
        if (currentIndex === -1) {
            if (songs.length > 0) playMusic(songs[0]);
            return;
        }
        const nextIndex = (currentIndex + 1) % songs.length;
        playMusic(songs[nextIndex]);
    });
}

main();
