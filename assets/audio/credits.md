# Audio Credits & Attribution

This document lists all audio assets used in the game and their proper attribution.

---

## Background Music (BGM)

### 🎵 Recommended Royalty-Free Horror Ambient Tracks

Below are 5 carefully selected horror ambient music tracks suitable for rural horror atmosphere. All tracks are available for free download and use in games.

---

### 1. **Ambient Horror** by techiew
- **Source**: [OpenGameArt.org](https://opengameart.org/content/ambient-horror)
- **License**: CC0 (Public Domain)
- **File**: `ambient_horror.ogg` (776.2 KB)
- **Description**: Dark ambient horror sound effect, perfect for creating tension
- **Download**: Direct download from OpenGameArt
- **Attribution**: Not required (CC0), but appreciated
- **Loop**: Yes

---

### 2. **Horror Ambient** by Vinrax
- **Source**: [OpenGameArt.org](https://opengameart.org/content/horror-ambient)
- **License**: CC-BY 3.0 / GPL 3.0 / GPL 2.0
- **File**: `horror_ambient.ogg` (450.6 KB)
- **Description**: Eerie ambient horror sound effect
- **Download**: Direct download from OpenGameArt
- **Attribution Required**: Credit "Vinrax" and link to OpenGameArt
- **Loop**: Yes

---

### 3. **Scary Ambient Wind** by Alexandr Zhelanov
- **Source**: [OpenGameArt.org](https://opengameart.org/content/scary-ambient-wind)
- **License**: CC-BY 3.0
- **File**: `Scary Ambient Wind.ogg` (6.2 MB)
- **Description**: Dark ambient music with wind elements, perfect for rural horror
- **Download**: Direct download from OpenGameArt
- **Attribution Required**: Credit "Alexandr Zhelanov"
- **Tags**: Ambient, dark, horror, wind

---

### 4. **Dark Cavern Ambient** (Loop version)
- **Source**: [OpenGameArt.org](https://opengameart.org/content/dark-cavern-ambient)
- **License**: CC0 (Public Domain)
- **File**: `dark_cavern_ambient_002.ogg` (1.7 MB)
- **Description**: Continuous loop ambient for dark atmosphere
- **Download**: Direct download from OpenGameArt  
- **Attribution**: Not required (CC0)
- **Loop**: Yes (seamless loop version)

---

### 5. **Eerie Horror Background Music** by Matio888
- **Source**: [Freesound.org](https://freesound.org/)
- **License**: Check individual track on Freesound (typically CC-BY)
- **File**: Search "Eerie Horror Background Music Matio888" on Freesound
- **Description**: Ominous dark atmosphere with chilling drones and unsettling whispers
- **Download**: Download from Freesound.org after registration
- **Attribution**: Check specific license on Freesound page
- **Loop**: Check on download page

---

## How to Download

### OpenGameArt.org Tracks (Tracks 1-4):
1. Visit the OpenGameArt.org link provided above
2. Click the download button for the .ogg file
3. Save to: `c:\Users\acer\Desktop\ยังไม่มี\assets\audio\bgm\`

### Freesound.org Tracks (Track 5):
1. Create a free account on [Freesound.org](https://freesound.org)
2. Search for the track name
3. Download the .ogg format
4. Save to: `c:\Users\acer\Desktop\ยังไม่มี\assets\audio\bgm\`

---

## Alternative Sources

If you need more tracks, check these additional sources:

- **OpenGameArt.org**: [Horror Music Collection](https://opengameart.org/art-search-advanced?keys=horror&field_art_type_tid%5B%5D=12)
- **Freesound.org**: Search "dark ambient horror loop"
- **Patrick de Arteaga**: [Royalty-free horror music](https://www.patrickdearteaga.com/) (CC-BY, includes .ogg)
- **Incompetech**: [Dark/Creepy category](https://incompetech.com/music/royalty-free/music.html) (CC-BY 4.0)

---

## Important Notes

> [!IMPORTANT]
> - **CC0 tracks** (Tracks 1, 4) require NO attribution, but giving credit is appreciated
> - **CC-BY tracks** (Tracks 2, 3, 5) REQUIRE attribution in your game credits
> - Always verify the license on the download page as it may have been updated

> [!TIP]
> For CC-BY attribution, include text like:
> ```
> Music: "Track Name" by Artist Name (License)
> Source: [URL]
> ```

---

## Current Audio Implementation

The game currently uses procedural Web Audio API sounds. To integrate downloaded music:

1. Place .ogg files in `/assets/audio/bgm/`
2. Update `SoundSystem.js` to load and play the tracks
3. Add track selection based on night number or game state

---

## License Summary

| Track | License | Attribution Required | Commercial Use | Modification |
|-------|---------|---------------------|----------------|--------------|
| Track 1 | CC0 | No | ✅ Yes | ✅ Yes |
| Track 2 | CC-BY 3.0 | Yes | ✅ Yes | ✅ Yes |
| Track 3 | CC-BY 3.0 | Yes | ✅ Yes | ✅ Yes |
| Track 4 | CC0 | No | ✅ Yes | ✅ Yes |
| Track 5 | CC-BY* | Yes* | ✅ Yes* | ✅ Yes* |

*Check specific license on Freesound page

---

Generated: 2026-02-09
Project: The Fox Courier - Horror Delivery Game
