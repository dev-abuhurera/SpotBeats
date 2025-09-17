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
        // If cards.json fails, we can't render cards
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
    songs = allSongs[folderKey]; // Direct assignment - URLs are already complete
    
    console.log("Songs for", folderKey, ":", songs);
    renderSongList(songs);
}

// Function to create a single music card and should apply lazy loading
function createMusicCard(cardData) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-folder', cardData.folder);
    
    card.innerHTML = `
        <img class="play" src="/img/playButton.svg" alt="playbutton">
        <img src="${cardData.image}" alt="album cover">
        <h2>${cardData.title}</h2>
        <p>${cardData.artist}</p>
    `;
    
    return card;
}

// fuction to setup the lazy loading of images

function setupLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy-load');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('.lazy-load').forEach(img => {
        imageObserver.observe(img);
    });

}

// Function to render all music cards
function renderMusicCards(cardsData = allCards) {
    const cardContainer = document.querySelector('.card-container');
    
    if (!cardContainer) {
        console.error('Card container not found');
        return;
    }
    
    const cardHeight = 200; // Approximate height of each card in pixels
    const containerHeigt = cardContainer.offsetHeight;
    const visibleCount = Math.ceil(containerHeight / cardHeight) + 2; // +2 for buffer

    const startIndex = Math.floor(cardContainer.scrollTop / cardHeight);
    const endIndex = Math.min(startIndex + visibleCount, cardsData.length);


    // Clear only the visible area
    cardContainer.innerHTML = '';
    
    // render only visible cards
    for(let i = startIndex; i < endIndex; i++) {
        const card = createMusicCard(cardsData[i]);
        cardContainer.appendChild(card);
    }
    
    // Add event listeners to new cards
    attachCardEventListeners();
}

//Attach scroll event listener to update dynamically

document.querySelector('.card-container')?.addEventListener('scroll', () => {
    renderMusicCards();
});


// Function to attach event listeners to cards
function attachCardEventListeners() {
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", () => {
            const folderKey = card.dataset.folder;
            getSongsFromCloud(folderKey);
        });
    });
}

// Function to add a new music card dynamically
function addMusicCard(cardData) {
    // Add to data array
    allCards.push(cardData);
    
    // Create and append the new card
    const cardContainer = document.querySelector('.card-container');
    if (!cardContainer) {
        console.error('Card container not found');
        return;
    }
    
    const newCard = createMusicCard(cardData);
    cardContainer.appendChild(newCard);
    
    // Attach event listener to the new card
    newCard.addEventListener("click", () => {
        const folderKey = newCard.dataset.folder;
        getSongsFromCloud(folderKey);
    });
}

// Function to remove a music card
function removeMusicCard(folder) {
    // Remove from data array
    const index = allCards.findIndex(card => card.folder === folder);
    if (index > -1) {
        allCards.splice(index, 1);
    }
    
    // Remove from DOM
    const cardToRemove = document.querySelector(`[data-folder="${folder}"]`);
    if (cardToRemove) {
        cardToRemove.remove();
    }
}

// Function to update an existing card
function updateMusicCard(folder, newData) {
    // Update data array
    const index = allCards.findIndex(card => card.folder === folder);
    if (index > -1) {
        allCards[index] = { ...allCards[index], ...newData };
        
        // Update DOM element
        const cardElement = document.querySelector(`[data-folder="${folder}"]`);
        if (cardElement) {
            const img = cardElement.querySelector('img:not(.play)');
            const title = cardElement.querySelector('h2');
            const artist = cardElement.querySelector('p');
            
            if (newData.image) img.src = newData.image;
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
        // Extract song name from Cloudinary URL
        const urlParts = songURL.split('/');
        const filenameWithId = urlParts[urlParts.length - 1]; // e.g., "One_Sided_Luv_prspzz.mp3"
        const songName = filenameWithId.replace('.mp3', '').replace(/_/g, ' '); // Clean up the name
        
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

    // Extract and display song name
    const urlParts = songURL.split('/');
    const filenameWithId = urlParts[urlParts.length - 1];
    const songName = filenameWithId.replace('.mp3', '').replace(/_/g, ' ');
    
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
    
    // Generate dynamic music cards from loaded data
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