let currentSong = new Audio();
let songs = [];          // will hold array of song URLs
let currFolder = "";     // holds current playlist key
let isMuted = false;
let lastVolume = 0.5;    // default volume (50%)

// Playlist mapping (key → JSON URL)
const playlist = {
    cs: "https://res.cloudinary.com/dtjgvglij/raw/upload/v1755237121/songs_djc3ib.json",
    songs3: "https://res.cloudinary.com/dtjgvglij/raw/upload/v1755237156/songs_ydhitv.json",
    songs4: "https://res.cloudinary.com/dtjgvglij/raw/upload/v1755237387/songs_aatr1x.json",
    songs5: "https://res.cloudinary.com/dtjgvglij/raw/upload/v1755237661/songs_czx5k2.json",
    songs6: "https://res.cloudinary.com/dtjgvglij/raw/upload/v1755238335/songs_kknxy1.json",
    songs7: "https://res.cloudinary.com/dtjgvglij/raw/upload/v1755238612/songs_uj5n0h.json",
    songs8: "https://res.cloudinary.com/dtjgvglij/raw/upload/v1755238804/songs_z88jap.json",
    songs9: "https://res.cloudinary.com/dtjgvglij/raw/upload/v1755239004/songs_rfmdwx.json",
    songs10: "https://res.cloudinary.com/dtjgvglij/raw/upload/v1755239241/songs_suk2pv.json",
    songs11: "https://res.cloudinary.com/dtjgvglij/raw/upload/v1755239393/songs_jjz3m7.json",
    songs12 : "https://res.cloudinary.com/dtjgvglij/raw/upload/v1755239588/songs_jwkjqy.json",
    songsNew: "https://res.cloudinary.com/dtjgvglij/raw/upload/v1755239794/songs_qzvbvp.json"
};

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Fetch songs from Cloudinary JSON
async function getSongsFromCloud(folderKey) {
    const url = playlist[folderKey];
    if (!url) {
        console.error(`No playlist found for key: ${folderKey}`);
        return;
    }
    currFolder = folderKey;

    try {
        const response = await fetch(url);
        songs = await response.json(); // should be an array of FULL mp3 URLs
        renderSongList(songs);
    } catch (error) {
        console.error("Error fetching songs:", error);
    }
}

// Render song list UI
function renderSongList(songArray) {
    const songUL = document.querySelector('.songslist ul');
    songUL.innerHTML = "";

    songArray.forEach(songURL => {
        const songName = decodeURI(songURL.split('/').pop());
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

    document.querySelector(".songinfo").innerHTML = decodeURI(songURL.split('/').pop());
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
        const currentIndex = songs.findIndex(url => decodeURI(url) === decodeURI(currentSong.src));
        if (currentIndex === -1) {
            if (songs.length > 0) playMusic(songs[0]);
            return;
        }
        const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
        playMusic(songs[prevIndex]);
    });

    // Next Button
    next.addEventListener("click", () => {
        const currentIndex = songs.findIndex(url => decodeURI(url) === decodeURI(currentSong.src));
        if (currentIndex === -1) {
            if (songs.length > 0) playMusic(songs[0]);
            return;
        }
        const nextIndex = (currentIndex + 1) % songs.length;
        playMusic(songs[nextIndex]);
    });

    // Playlist card clicks
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", () => {
            const folderKey = card.dataset.folder;
            getSongsFromCloud(folderKey);
        });
    });
}

main();
