let currentSong = new Audio();
let songs;
let currFolder;
let isMuted = false;
let lastVolume = 0.5; // Default volume (50%)

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "Invalid input";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/songs/${currFolder}/songs.json`);
    let response = await a.json();
    songs = [];
    for (let index = 0; index < response.length; index++) {
        const element = response[index];
        songs.push(element);
    }

    let songUL = document.querySelector('.songslist').getElementsByTagName('ul')[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
            <img class="invert" src="https://www.svgrepo.com/show/532708/music.svg">
            <div class="info">
                <div class="song Name">${seperateTitle(song)}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="in invert" src="/img/playButton.svg">
            </div>
        </li>`;
    }

    Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    });

    return songs; // Add this line to return the songs array
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/songs/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "/img/pause.png"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


    currentSong.volume = lastVolume;
    document.querySelector('.volume-slider').value = lastVolume * 100;
    updateVolumeIcon();


}

function updateVolumeIcon() {
    const volumeIcon = document.querySelector('.volume-icon');
    if (isMuted || currentSong.volume === 0) {
        volumeIcon.src = '/img/mute.png';
    } else if (currentSong.volume < 0.5) {
        volumeIcon.src = '/img/volume-decrease.png';
    } else if (currentSong.volume > 0.5) {
        volumeIcon.src = '/img/volume-decrease.png';
    }
    else {
        volumeIcon.src = '/img/volume.png';
    }
}




async function main() {
    // Get the list of all the songs
    await getSongs("cs", "songs.json");
    playMusic(songs[0], true);


    // Show all the songs in the playlist

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "/img/pause.png"
        }
        else {
            currentSong.pause()
            play.src = "/img/playButton.svg"
        }
    })


    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)
            }`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Seek bar functionality
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = document.querySelector(".circle").style.left = ((e.offsetX / e.target.getBoundingClientRect().width) * 100);
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Volume control functionality
    const volumeSlider = document.querySelector('.volume-slider');
    const volumeIcon = document.querySelector('.volume-icon');

    // Set initial volume
    currentSong.volume = lastVolume;
    volumeSlider.value = lastVolume * 100;
    updateVolumeIcon();

    // Volume slider event
    volumeSlider.addEventListener('input', function () {
        const volume = this.value / 100;
        currentSong.volume = volume;
        lastVolume = volume;
        isMuted = false;
        updateVolumeIcon();
    });

    // Volume icon click (mute/unmute)
    volumeIcon.addEventListener('click', function () {
        if (isMuted) {
            // Unmute
            currentSong.volume = lastVolume;
            volumeSlider.value = lastVolume * 100;
            isMuted = false;
        } else {
            // Mute
            lastVolume = currentSong.volume;
            currentSong.volume = 0;
            volumeSlider.value = 0;
            isMuted = true;
        }
        updateVolumeIcon();
    });

    // Show the menu on hamburger click
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
        document.querySelector(".hamburger").style.display = "none";
        document.querySelector(".close-img").style.display = "block";
    });

    // Hide the menu on close icon click
    document.querySelector(".close-img").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-125%";
        document.querySelector(".hamburger").style.display = "block";
        document.querySelector(".close-img").style.display = "none";
    });

    // Previous Button Implementation
    previous.addEventListener("click", () => {
        const currentTrackPath = currentSong.src;
        const basePath = window.location.origin + `/songs/${currFolder}/`;
        const currentTrack = decodeURI(currentTrackPath.replace(basePath, ''));

        const currentIndex = songs.indexOf(currentTrack);
        // console.log("Previous clicked - Current index:", currentIndex);

        if (currentIndex === -1) {
            if (songs.length > 0) playMusic(songs[0]);
            return;
        }

        const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
        playMusic(songs[prevIndex]);
    });

    // Next Button Implementation
    next.addEventListener("click", () => {
        const currentTrackPath = currentSong.src;
        const basePath = window.location.origin + `/songs/${currFolder}/`;
        const currentTrack = decodeURI(currentTrackPath.replace(basePath, ''));

        const currentIndex = songs.indexOf(currentTrack);
        // console.log("Next clicked - Current index:", currentIndex);

        if (currentIndex === -1) {
            if (songs.length > 0) playMusic(songs[0]);
            return;
        }

        const nextIndex = (currentIndex + 1) % songs.length;
        playMusic(songs[nextIndex]);
    });

    // load playlists whenever the card is clicked

    let fun = Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`${item.currentTarget.dataset.folder}`, "songs.json");
            if (songs.length > 0) {
                playMusic(songs[0]); // Play the first song in the playlist
            }
        })
    })
}

main();

function seperateTitle(song) {
    return song;
}
