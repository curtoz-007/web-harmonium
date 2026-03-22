# 🎶 Web Harmonium

A rich, interactive web-based harmonium (traditional reed organ) that you can play directly in your browser using your computer keyboard or a MIDI keyboard. Beautiful Victorian-inspired UI with full-featured audio controls.

> **Live Demo**: [https://webharmonium.xento.xyz/](https://webharmonium.xento.xyz/)

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| ⌨️ **Keyboard Input** | Intuitive QWERTY-to-piano key mapping — press keys to play notes |
| 🎹 **MIDI Support** | Connect external MIDI keyboards for authentic playing experience |
| 📱 **Mobile Touch** | Full touchscreen support with responsive on-screen virtual keyboard |
| 🎚 **Volume & Reverb** | Real-time volume control (1-100%) + convolver-based reverb effect |
| 🎼 **Octave Shifting** | Switch between 7 octave registers for different pitch ranges |
| 🎜 **Transposition** | Transpose songs by ±11 semitones without re-learning key positions |
| 🎧 **Polyphony** | Stack multiple reed voices for richer, layered harmonium tone |
| 📚 **Song Helper** | Built-in note guide system for learning and practicing songs |
| 💾 **Offline Ready** | Progressive Web App (PWA) — install & play offline with service worker |
| 🎨 **Premium UI** | Golden Victorian-inspired theme with smooth animations and responsive design |

---

## 🎮 How to Play

### Quick Start
1. Open `index.html` in any modern browser
2. Click **"Load Module"** to initialize audio engine
3. Start pressing keys!

### Keyboard Layout

The app maps a standard QWERTY keyboard to a piano layout:

```
WHITE KEYS (Main Notes)
┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│ ` │ q │ w │ e │ r │ t │ y │ u │ i │ o │ p │ [ │ ] │ \ │
└─   ─   ─   ─   ─   ─   ─   ─   ─   ─   ─   ─   ─   ─┘
              C   D   E   F   G   A   B

BLACK KEYS (Accidentals)
     ...┌─┐  ┌─┐...┌─┐  ┌─┐  ┌─┐...┌─┐  ┌─┐...
     ... │1│  │2│... │4│  │5│  │7│... │8│  │9│...
     ...└─┘  └─┘...└─┘  └─┘  └─┘...└─┘  └─┘...
         C#  D#    F#  G#  A#

MORE KEYS
 - / = / - / - / =
```

### Control Keys

| Key | Action |
|-----|--------|
| `S` / `A` | Octave down / up |
| `Backspace` | Remove last note from notation |
| `Delete` | Clear all notation |
| `Enter` | Log notation to console |
| `Tab` | Add comma to notation |

---

## 🎛️ Settings Panel

Access via the **⚙ Settings** button in the navbar:

### Volume & Effects
- **Volume**: 1-100% output level
- **Reverb**: Toggle convolver-based reverb for authentic resonance

### Tuning & Register
- **Transpose** (±11 semitones): Change key without re-learning positions
- **Octave** (0-6 registers): Select pitch range for comfortable playing
- **Reeds** (0+ layers): Add additional voices for richer tone

### MIDI Keyboard
- Detect connected MIDI devices
- Select input device from dropdown
- Supports note-on/note-off messages and CC7 (volume) messages
- **Refresh** button to detect newly connected devices

### Note Helpers (Song Management)
- View built-in practice songs
- Add custom songs with note sequences
- Save songs to browser session
- Export as `config.js` (permanent) or JSON (portable)

---

## 📁 Project Structure

```
harmonium/
├── index.html                    # Main UI & settings modal
├── Scripts/
│   ├── keys.js                  # Keyboard handling & layout engine
│   ├── sound_sys.js             # Audio engine & MIDI support
│   └── serviceworker.js         # Offline caching
├── Notes/
│   └── Keynotes.js              # Song library & note helper system
├── Styles/
│   └── style.css                # Victorian themed styling
├── Sounds/
│   ├── harmonium-trad-orig.wav  # Harmonium sample (looped)
│   └── reverb.wav               # Impulse response for reverb
├── Configs/
│   ├── manifest.json            # PWA metadata
│   └── serviceworker.js         # Service worker registration
└── README.md                    # This file
```

---

## 🏗️ Technical Architecture

### Audio Pipeline

```
┌─────────────────────────────────────────────────┐
│  Keyboard Input / MIDI / Touch Events           │
└────────────┬────────────────────────────────────┘
             │
             ├─ Keyboard Map → MIDI Note (0-127)
             └─ Pitch Detune (±100 cents)
                          │
             ┌────────────┴────────────┐
             │                         │
          ┌──▼───┐            ┌────────▼──┐
          │ OSC  │            │   Buffer  │
          │ Note │            │  Source   │
          │  ON  │            │  (Loop)   │
          └──────┘            └────────┬──┘
             │                         │
             └────────────┬────────────┘
                          │
                    ┌─────▼─────┐
                    │ Gain Node │  (Master volume)
                    └─────┬─────┘
                          │
            ┌─────────────┼─────────────┐
            │             │             │
        ┌───▼──┐      ┌───▼──┐    ┌───▼──┐
        │Output│      │Reverb│    │ Ctx  │
        │Dest. │      │(Cond)│    │(opt) │
        └──────┘      └──────┘    └──────┘
```

### Key Technologies
- **Web Audio API**: Audio synthesis & processing
- **AudioContext**: Audio graph management
- **ConvolverNode**: Impulse response-based reverb
- **BufferSource**: Sample playback with pitch shifting via detune
- **Web MIDI API**: Hardware MIDI keyboard support
- **Service Worker**: Offline support & caching strategy
- **localStorage**: Persistent preference storage

---

## ⚙️ Audio Features Explained

### Looping Sample
- Uses a traditional harmonium WAV recording
- Pitch-shifted using `detune.value` (in cents: ±100 = ±1 semitone)
- Loop range: 0.5s to 7.5s for seamless playing
- All 128 MIDI notes supported via detune offset

### Reverb System
- Optional convolver node with impulse response
- Reverb IR: `Sounds/reverb.wav`
- Toggle on/off in real-time without stopping notes
- Enhances authenticity of harmonium tone

### Octave & Transposition
- **Octave**: Shifts all notes by octaves using `octaveMap` array
- **Transpose**: Shifts all notes by semitones using `keyMap`
- Root note displayed based on current transposition
- All settings persist in localStorage

### Polyphony (Reeds)
- Stack parameter creates layered notes
- Playing note `X` with stack=2 also triggers notes `X+12` and `X+24` (upper octaves)
- Creates fuller, richer harmonium character
- Configurable from settings (0-7+ layers)

---

## 📱 Mobile & Responsive Design

### Desktop Experience
- Full QWERTY keyboard support
- 14 white keys + 9 black keys visible
- Navbar with volume & reverb controls
- Settings button for additional controls

### Mobile Experience (≤600px width)
- Automatic on-screen virtual keyboard
- Touch-friendly key sizes (responsive to viewport)
- Portrait/landscape detection with auto-reflow
- Hidden navbar controls → moved to settings modal
- Full piano-like layout with black keys properly positioned

### Touch Handling
- Both touchstart/touchend and mouse events supported
- preventDefault on touch to avoid scrolling
- Smooth key press feedback with CSS class toggling
- No lag or double-triggering

---

## 💾 Data Persistence

All user preferences automatically saved to browser `localStorage`:

```javascript
// Keys stored:
webharmonium.volume        // 1-100
webharmonium.useReverb     // true/false
webharmonium.octave        // 0-6
webharmonium.transpose     // -11 to +11
webharmonium.stack         // number of additional reeds
webharmonium.custom_songs  // JSON array of user-added songs
```

Clear localStorage to reset to defaults (or use browser dev tools).

---

## 🎼 Built-in Practice Songs

The app includes 3 pre-loaded songs in `Notes/Keynotes.js`:

| Song | Type | Use Case |
|------|------|----------|
| **Sa Re Ga Ma (Practice)** | Scale exercise | Beginner warm-up |
| **Raghupati Raghav** | Traditional Indian | Popular folk song |
| **Kaayar Joo The** | Traditional | Advanced practice |

### Adding Custom Songs
Edit `Notes/Keynotes.js`:
```javascript
HARMONIUM_SONGS.push({
  name: "My Song",
  notes: "e r t y u i o p\np o i u y t r e"
});
```

Or use the Settings panel to add dynamically and export!

---

## 🌐 Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome/Chromium | ✅ Full | Best performance |
| Firefox | ✅ Full | Full Web Audio support |
| Safari | ✅ Good | PWA limited, audio works |
| Edge | ✅ Full | Chromium-based |
| Mobile Safari | ⚠️ Limited | Audio restrictions apply |

**Requirements:**
- ES6+ JavaScript support
- Web Audio API (all modern browsers)
- Optional: Web MIDI API (hardware keyboards)
- Optional: Service Workers (PWA/offline)

---

## 📦 PWA Installation

### Install on Home Screen

**Android Chrome/Firefox:**
1. Open app in browser
2. Menu → "Install app" or "Add to Home Screen"
3. Opens as full-screen standalone app

**Desktop:**
- Chrome/Edge: Click install icon in address bar (if permitted)
- Firefox: Add to home screen via menu

### Offline Support
Once installed, the service worker caches:
- `index.html`
- `webharmonium.html`
- All scripts & stylesheets
- Harmonium sample & reverb IR

App works fully offline after first load!

---

## 🎯 Keyboard Reference Card

**Quick Reference** (also visible in UI):

```
┌─ WHITE KEYS ────────────────────────────┐
│ ` q w | e r t y u i o | p [ ] \        │
│     (prefix)    C D E F G A B (suffix)  │
└─────────────────────────────────────────┘

┌─ BLACK KEYS ────────────────────────────┐
│       1   2      4  5     7  8  9  -  = │
│       C#  D#     F# G#    A# B♭ C# D♭  │
└─────────────────────────────────────────┘

┌─ OCTAVE CONTROL ────────────────────────┐
│  S/A: down/up  OR  use Settings panel   │
└─────────────────────────────────────────┘
```

---

## 🔧 Customization

### Color Scheme
Edit `Styles/style.css` CSS variables:
```css
:root {
  --bg: #1a1410;              /* Dark wood background */
  --gold: #c9952a;            /* Main accent */
  --gold-light: #e8b84b;      /* Bright accent */
  --text: #e8dcc8;            /* Main text */
  --muted: #8a7a64;           /* Secondary text */
  --accent: #c87941;          /* Highlights */
}
```

### Sound
- Replace `Sounds/harmonium-trad-orig.wav` with different sample
- Must be WAV format (mono or stereo)
- Adjust `loopStart`/`loopEnd` in `sound_sys.js` for different loop points
- Replace `Sounds/reverb.wav` with different IR

### Keyboard Mapping
Modify `keyboardMap` object in `Scripts/sound_sys.js`:
```javascript
var keyboardMap = {
  "e": 60,  // 'e' key → MIDI note C4
  "r": 62,  // 'r' key → MIDI note D4
  // ... etc
};
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| No sound on load | Click in browser window to resume AudioContext (autoplay policy) |
| MIDI keyboard not detected | Click "Refresh MIDI Devices" button in settings |
| Settings not saving | Check if localStorage is enabled; check console for errors |
| Mobile keyboard misaligned | Rotate device or refresh page |
| Reverb sounds distorted | Lower master volume in settings |
| Service worker not caching | Open DevTools → Application → Service Workers → Unregister & reload |

---

## 📝 Development Notes

### Keyboard Event Flow
1. `keydown` event captured → `getKeyEl()` adds `.pressed` class
2. If key in `keyboardMap` → call `noteOn(midi_note)`
3. `keyup` event → remove `.pressed` class, call `noteOff()`
4. Touch events replicate this flow for mobile

### MIDI Event Handling
- Listens on all connected input devices
- `0x90 (144)`: Note On → `noteOn(note, velocity)`
- `0x80 (128)`: Note Off → `noteOff(note)`
- `0xB0 (176)`: CC7 (volume) → master volume

### Responsive Breakpoints
- **Desktop**: width > 600px
- **Mobile**: width ≤ 600px
- Black key positioning recalculated on resize/orientation change

---

## 📄 License

[Add your license here]

---

## 🙏 Attribution

Inspired by traditional harmonium instruments of North East Asia. Built with modern web audio technologies.

**Enjoy your playing! 🎶**
