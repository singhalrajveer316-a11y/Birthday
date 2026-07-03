# Premium Interactive Birthday Journey Website

A luxury, elegant, and nostalgic digital birthday card designed first and foremost for mobile viewports. It features fluid 60fps animations, scroll-triggered horizontal timelines, an interactive Memory Jar, a candle-blowing opening cake drawer, dynamic background transitions, and a cinematic fade-to-black conclusion.

The website has been re-oriented to focus on school memories and appreciation, keeping the tone respectful, positive, and friendly.

---

## 🌟 Features
- **3D Vintage Envelope**: Realistically folds open on tap after cracking a wax seal, sliding out a handwritten letter.
- **Unified JS Configuration**: Easily update names, letters, photos, dates, and jar quotes in a single file without touching the HTML markup.
- **Horizontal Memories Timeline**: Connects school milestones that animate onto the screen as you scroll.
- **3D Polaroid Carousel**: Floating gallery cards that swipe, rotate, and tilt in 3D.
- **The Memory Jar**: Interactive glass jar containing floating, pulsing canvas stars. Tapping a star releases a random school memories prompt.
- **Opening Birthday Cake**: Extinguishes the candle using microphone volume or a manual button, splitting the cake top layers open to reveal a sliding wish drawer.
- **Cinematic Ending**: Click "End Surprise" to fade out the sky and letter, fade out the background music, and show a final fading thank-you message on a pitch black screen.
- **Live QR Code**: Dynamically generates a link QR code pointing to the live URL of the site in the final section.
- **Dual-Mode Audio**: Plays an elegant background MP3. If blocked or unavailable, it uses the Web Audio API to dynamically synthesize a warm, ambient piano chord loop.

---

## 📂 Project Structure
```
r:/2026/Project/Birthday/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
    ├── music/
    │   └── bg-melody.mp3        <-- Background music (Erik Satie - Gymnopedie No 1)
    └── images/
        ├── school_days.png      <-- Memory Polaroid Image 1
        ├── after_exams.png      <-- Memory Polaroid Image 2
        ├── random_laughs.png    <-- Memory Polaroid Image 3
        └── forever_memory.png   <-- Memory Polaroid Image 4
```

---

## 🎨 Customization Guide (The Javascript CONFIG Panel)

You can customize almost the entire website by editing the `CONFIG` object at the very top of [script.js](file:///r:/2026/Project/Birthday/script.js):

```javascript
const CONFIG = {
    name: "Ritika",                       // Her main name (shown on wish header and final card)
    nickname: "Reet",                     // Addressed nickname (shown on envelope label)
    birthday: "July 4th",                 // Date shown on the handwritten letter header
    signature: "Sujeet",                  // Your signature name
    music: "assets/music/bg-melody.mp3",  // Background melody path
    photos: [                             // List of carousel polaroid image files
        "assets/images/school_days.png",
        "assets/images/after_exams.png",
        "assets/images/random_laughs.png",
        "assets/images/forever_memory.png"
    ],
    easterEggStars: 7,                    // Number of stars required for constellation egg
    letterText: `...`,                    // Typewriter letter text (kept under 150 words)
    jarMemories: [                        // Universal school memories inside Jar stars
        "✨ Morning assembly.",
        "✨ Waiting for the school bell.",
        "✨ Exam season.",
        "✨ Classroom laughter.",
        "✨ Annual function.",
        "✨ Sports Day.",
        "✨ Last bench conversations."
    ]
};
```

---

## 🚀 How to Host

This project is completely static (HTML, CSS, JS), making it incredibly easy to host for free!

### Option A: GitHub Pages (Recommended - 100% Free)
1. Initialize a git repository in this folder and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   # Create a repository on GitHub, then link it:
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```
2. On GitHub, go to your Repository -> **Settings** -> **Pages**.
3. Under **Build and deployment**, set Source to **Deploy from a branch**.
4. Select **main** branch and `/ (root)` folder, then click **Save**.
5. Your website will be live at `https://<your-username>.github.io/<your-repo-name>/` in a few minutes! (The QR code inside the final surprise will automatically point to this live link).

### Option B: Netlify (Fastest - Drag & Drop)
1. Go to [Netlify](https://www.netlify.com/) and log in.
2. Go to **Sites** and scroll to the bottom.
3. Drag and drop the `Birthday` folder directly onto the upload box.
4. Your site is deployed instantly! You can customize the domain name under site settings.
