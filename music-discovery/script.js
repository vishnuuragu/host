// Read a JSON value from localStorage, falling back if missing or corrupted
function loadJSON(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch (e) {
        return fallback;
    }
}

// Escape user-provided text before inserting it into innerHTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, ch => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));
}

document.addEventListener('DOMContentLoaded', function() {
    const genreSelect = document.getElementById('genre-select');
    const moodSelect = document.getElementById('mood-select');
    const eraSelect = document.getElementById('era-select');
    const discoverBtn = document.getElementById('discover-btn');
    const recommendationsList = document.getElementById('recommendations-list');
    const playlistName = document.getElementById('playlist-name');
    const createPlaylistBtn = document.getElementById('create-playlist-btn');
    const playlistsList = document.getElementById('playlists-list');
    const favoritesList = document.getElementById('favorites-list');

    let favorites = loadJSON('favorites', []);
    let playlists = loadJSON('playlists', []);

    // Sample music database
    const musicDatabase = [
        // Rock
        { id: 1, title: "Bohemian Rhapsody", artist: "Queen", genre: "rock", mood: "energetic", era: "70s", album: "A Night at the Opera" },
        { id: 2, title: "Stairway to Heaven", artist: "Led Zeppelin", genre: "rock", mood: "uplifting", era: "70s", album: "Led Zeppelin IV" },
        { id: 3, title: "Sweet Child O' Mine", artist: "Guns N' Roses", genre: "rock", mood: "energetic", era: "80s", album: "Appetite for Destruction" },
        
        // Pop
        { id: 4, title: "Shape of You", artist: "Ed Sheeran", genre: "pop", mood: "uplifting", era: "2010s", album: "÷ (Divide)" },
        { id: 5, title: "Blinding Lights", artist: "The Weeknd", genre: "pop", mood: "energetic", era: "2020s", album: "After Hours" },
        { id: 6, title: "Billie Jean", artist: "Michael Jackson", genre: "pop", mood: "energetic", era: "80s", album: "Thriller" },
        
        // Jazz
        { id: 7, title: "Take Five", artist: "Dave Brubeck", genre: "jazz", mood: "relaxing", era: "60s", album: "Time Out" },
        { id: 8, title: "Summertime", artist: "Ella Fitzgerald", genre: "jazz", mood: "relaxing", era: "60s", album: "Porgy and Bess" },
        { id: 9, title: "Blue in Green", artist: "Miles Davis", genre: "jazz", mood: "melancholic", era: "60s", album: "Kind of Blue" },
        
        // Classical
        { id: 10, title: "Symphony No. 9", artist: "Beethoven", genre: "classical", mood: "uplifting", era: "classical", album: "Symphony No. 9" },
        { id: 11, title: "Clair de Lune", artist: "Debussy", genre: "classical", mood: "relaxing", era: "classical", album: "Suite Bergamasque" },
        { id: 12, title: "Four Seasons", artist: "Vivaldi", genre: "classical", mood: "energetic", era: "classical", album: "The Four Seasons" },
        
        // Electronic
        { id: 13, title: "Midnight City", artist: "M83", genre: "electronic", mood: "uplifting", era: "2010s", album: "Hurry Up, We're Dreaming" },
        { id: 14, title: "Levels", artist: "Avicii", genre: "electronic", mood: "energetic", era: "2010s", album: "True" },
        { id: 15, title: "Strobe", artist: "Deadmau5", genre: "electronic", mood: "relaxing", era: "2000s", album: "For Lack of a Better Name" },
        
        // Hip Hop
        { id: 16, title: "Lose Yourself", artist: "Eminem", genre: "hip-hop", mood: "energetic", era: "2000s", album: "8 Mile Soundtrack" },
        { id: 17, title: "HUMBLE.", artist: "Kendrick Lamar", genre: "hip-hop", mood: "energetic", era: "2010s", album: "DAMN." },
        { id: 18, title: "Juicy", artist: "The Notorious B.I.G.", genre: "hip-hop", mood: "uplifting", era: "90s", album: "Ready to Die" },
        
        // Country
        { id: 19, title: "Friends in Low Places", artist: "Garth Brooks", genre: "country", mood: "uplifting", era: "90s", album: "No Fences" },
        { id: 20, title: "Need You Now", artist: "Lady Antebellum", genre: "country", mood: "romantic", era: "2010s", album: "Need You Now" },
        
        // Folk
        { id: 21, title: "The Sound of Silence", artist: "Simon & Garfunkel", genre: "folk", mood: "melancholic", era: "60s", album: "Sounds of Silence" },
        { id: 22, title: "Hallelujah", artist: "Leonard Cohen", genre: "folk", mood: "melancholic", era: "80s", album: "Various Positions" }
    ];

    // Discover music functionality
    discoverBtn.addEventListener('click', () => {
        const genre = genreSelect.value;
        const mood = moodSelect.value;
        const era = eraSelect.value;

        let recommendations = musicDatabase.filter(song => {
            const matchesGenre = !genre || song.genre === genre;
            const matchesMood = !mood || song.mood === mood;
            const matchesEra = !era || song.era === era;
            return matchesGenre && matchesMood && matchesEra;
        });

        // Shuffle recommendations
        recommendations = recommendations.sort(() => Math.random() - 0.5);
        
        // Limit to 6 recommendations
        recommendations = recommendations.slice(0, 6);

        displayRecommendations(recommendations);
    });

    function displayRecommendations(songs) {
        if (songs.length === 0) {
            recommendationsList.innerHTML = '<p class="no-recommendations">No songs found matching your preferences. Try different criteria!</p>';
            return;
        }

        recommendationsList.innerHTML = '';
        songs.forEach(song => {
            const songCard = createSongCard(song, true);
            recommendationsList.appendChild(songCard);
        });
    }

    function createSongCard(song, showActions = false) {
        const songCard = document.createElement('div');
        songCard.className = 'song-card';
        
        const isLiked = favorites.some(fav => fav.id === song.id);
        
        songCard.innerHTML = `
            <div class="song-info">
                <h4>${song.title}</h4>
                <p class="artist">${song.artist}</p>
                <p class="album">${song.album}</p>
                <div class="song-tags">
                    <span class="genre-tag">${song.genre}</span>
                    <span class="mood-tag">${song.mood}</span>
                    <span class="era-tag">${song.era}</span>
                </div>
            </div>
            ${showActions ? `
                <div class="song-actions">
                    <button class="like-btn ${isLiked ? 'liked' : ''}" data-id="${song.id}">
                        ${isLiked ? '❤️' : '🤍'}
                    </button>
                    <button class="add-to-playlist-btn" data-id="${song.id}">➕</button>
                </div>
            ` : ''}
        `;

        // Add event listeners for actions
        if (showActions) {
            const likeBtn = songCard.querySelector('.like-btn');
            likeBtn.addEventListener('click', () => toggleLike(song, likeBtn));

            const addToPlaylistBtn = songCard.querySelector('.add-to-playlist-btn');
            addToPlaylistBtn.addEventListener('click', () => showAddToPlaylistModal(song));
        }

        return songCard;
    }

    function toggleLike(song, buttonElement) {
        const isCurrentlyLiked = favorites.some(fav => fav.id === song.id);
        
        if (isCurrentlyLiked) {
            favorites = favorites.filter(fav => fav.id !== song.id);
            buttonElement.textContent = '🤍';
            buttonElement.classList.remove('liked');
        } else {
            favorites.push(song);
            buttonElement.textContent = '❤️';
            buttonElement.classList.add('liked');
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
        renderFavorites();
    }

    function showAddToPlaylistModal(song) {
        if (playlists.length === 0) {
            alert('Create a playlist first!');
            return;
        }

        const playlistNames = playlists.map(p => p.name);
        const selectedPlaylist = prompt(`Add "${song.title}" to playlist:\n\n${playlistNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}\n\nEnter playlist number:`);
        
        const playlistIndex = parseInt(selectedPlaylist) - 1;
        if (playlistIndex >= 0 && playlistIndex < playlists.length) {
            const playlist = playlists[playlistIndex];
            
            // Check if song already exists in playlist
            if (!playlist.songs.some(s => s.id === song.id)) {
                playlist.songs.push(song);
                localStorage.setItem('playlists', JSON.stringify(playlists));
                renderPlaylists();
                alert(`Added "${song.title}" to "${playlist.name}"!`);
            } else {
                alert('Song already exists in this playlist!');
            }
        }
    }

    // Playlist functionality
    createPlaylistBtn.addEventListener('click', () => {
        const name = playlistName.value.trim();
        if (!name) {
            alert('Please enter a playlist name');
            return;
        }

        if (playlists.some(p => p.name === name)) {
            alert('Playlist with this name already exists');
            return;
        }

        const playlist = {
            id: Date.now(),
            name,
            songs: [],
            created: new Date().toLocaleDateString()
        };

        playlists.push(playlist);
        localStorage.setItem('playlists', JSON.stringify(playlists));
        playlistName.value = '';
        renderPlaylists();
    });

    function renderPlaylists() {
        if (playlists.length === 0) {
            playlistsList.innerHTML = '<p class="no-playlists">No playlists created yet.</p>';
            return;
        }

        playlistsList.innerHTML = '';
        playlists.forEach(playlist => {
            const playlistCard = document.createElement('div');
            playlistCard.className = 'playlist-card';
            
            playlistCard.innerHTML = `
                <div class="playlist-info">
                    <h4>${escapeHTML(playlist.name)}</h4>
                    <p>${playlist.songs.length} songs</p>
                    <p class="created-date">Created: ${playlist.created}</p>
                </div>
                <div class="playlist-actions">
                    <button class="view-playlist-btn" data-id="${playlist.id}">View</button>
                    <button class="delete-playlist-btn" data-id="${playlist.id}">Delete</button>
                </div>
            `;

            playlistsList.appendChild(playlistCard);
        });

        // Add event listeners
        playlistsList.querySelectorAll('.view-playlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playlistId = parseInt(e.target.dataset.id);
                const playlist = playlists.find(p => p.id === playlistId);
                viewPlaylist(playlist);
            });
        });

        playlistsList.querySelectorAll('.delete-playlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playlistId = parseInt(e.target.dataset.id);
                const playlist = playlists.find(p => p.id === playlistId);
                if (confirm(`Delete playlist "${playlist.name}"?`)) {
                    playlists = playlists.filter(p => p.id !== playlistId);
                    localStorage.setItem('playlists', JSON.stringify(playlists));
                    renderPlaylists();
                }
            });
        });
    }

    function viewPlaylist(playlist) {
        if (playlist.songs.length === 0) {
            alert(`Playlist "${playlist.name}" is empty. Add some songs to it!`);
            return;
        }

        const songsList = playlist.songs.map(song => `• ${song.title} by ${song.artist}`).join('\n');
        alert(`Playlist: ${playlist.name}\n\nSongs:\n${songsList}`);
    }

    function renderFavorites() {
        if (favorites.length === 0) {
            favoritesList.innerHTML = '<p class="no-favorites">No favorite songs yet. Like some recommendations to see them here!</p>';
            return;
        }

        favoritesList.innerHTML = '';
        favorites.forEach(song => {
            const songCard = createSongCard(song, false);
            songCard.classList.add('favorite-song');
            
            // Add remove button for favorites
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-favorite-btn';
            removeBtn.textContent = '❌';
            removeBtn.addEventListener('click', () => {
                favorites = favorites.filter(fav => fav.id !== song.id);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                renderFavorites();
                
                // Update like buttons in recommendations
                const likeButtons = document.querySelectorAll(`[data-id="${song.id}"]`);
                likeButtons.forEach(btn => {
                    if (btn.classList.contains('like-btn')) {
                        btn.textContent = '🤍';
                        btn.classList.remove('liked');
                    }
                });
            });
            
            songCard.appendChild(removeBtn);
            favoritesList.appendChild(songCard);
        });
    }

    // Initialize
    renderPlaylists();
    renderFavorites();
});