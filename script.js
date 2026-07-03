/* -------------------------------------------------------------
   PREMIUM BIRTHDAY SURPRISE - APPLICATION LOGIC
   Featuring: Web Audio API synth sounds, 3D carousel, Memory Jar,
   deferred microphone blow, and Constellation star hunt.
------------------------------------------------------------- */

// Unified Configuration Panel for easy updates
const CONFIG = {
    name: "Ritika",
    nickname: "Reet",
    birthday: "July 4th",
    signature: "Sujeet",
    music: "assets/music/bg-melody.mp3",
    photos: [
        "assets/images/1.jpg",
        "assets/images/2.jpg",
        "assets/images/3.jpg",
        "assets/images/4.jpg"
    ],
    easterEggStars: 7,
    letterText: `Happy Birthday!

It's amazing looking back at how we first met in Class 7 and studied together until Class 12. Sharing classrooms, board exams, lunches, and countless laughs—those school days will always be memories I look back on with gratitude.

Hope today brings you endless reasons to smile. Have a wonderful year ahead!`,
    
    // Ambient fallback chords
    chords: [
        [130.81, 196.00, 246.94, 293.66, 329.63], // Cmaj9
        [110.00, 164.81, 196.00, 261.63, 493.88], // Am9
        [87.31, 130.81, 220.00, 329.63, 392.00],  // Fmaj9
        [98.00, 146.83, 174.61, 261.63, 440.00]   // G9sus4
    ],
    
    // Memory Jar Universal Prompts
    jarMemories: [
        "✨ Morning assembly.",
        "✨ Waiting for the school bell.",
        "✨ Exam season.",
        "✨ Classroom laughter.",
        "✨ Annual function.",
        "✨ Sports Day.",
        "✨ Last bench conversations."
    ]
};

// State Variables
let audioContext = null;
let synthInterval = null;
let isMuted = false;
let isMusicPlaying = false;
let bgAudio = null;
let currentChordIndex = 0;

let foundStars = new Set();
let constellationLines = [];
let carouselIndex = 0;
let jarStars = [];
let jarStarsMax = 8;
let activeMic = false;
let micStream = null;
let micAudioContext = null;
let micAnalyser = null;
let isCandleBlown = false;

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    // Inject centralized CONFIG settings dynamically
    injectConfigValues();

    // 1. Page loading screen simulation
    setTimeout(() => {
        const loader = document.getElementById('loading-screen');
        loader.style.opacity = 0;
        loader.style.pointerEvents = 'none';
        
        // Show intro screen
        const intro = document.getElementById('intro-screen');
        intro.classList.remove('hidden');
    }, 1800);
    
    initGlobalParticles();
    setupEventListeners();
    setupConstellationStarGame();
    setupPolaroidCarousel();
    setupMemoryJarPhysics();
});

function injectConfigValues() {
    // Injects names, nicknames, and dates dynamically from CONFIG panel
    document.querySelector('.to-label').innerText = `To: ${CONFIG.nickname}`;
    document.querySelector('.wish-name').innerText = CONFIG.name;
    document.querySelector('.date').innerText = CONFIG.birthday;
    
    // Injects polaroid photos paths
    const images = document.querySelectorAll('.polaroid-card img');
    images.forEach((img, idx) => {
        if (CONFIG.photos[idx]) {
            img.src = CONFIG.photos[idx];
        }
    });
    
    // Dynamically generates link QR Code pointing to hosted URL
    const qrImage = document.getElementById('qr-image');
    if (qrImage) {
        const pageUrl = window.location.href;
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(pageUrl)}`;
    }
}


/* -------------------------------------------------------------
   WEB AUDIO API SOUND EFFECTS SYNTHESIZER
------------------------------------------------------------- */
function playSynthSound(type) {
    if (!audioContext || audioContext.state === 'suspended') return;
    const now = audioContext.currentTime;
    
    if (type === 'click') {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
    } 
    else if (type === 'envelopeOpen') {
        // Swoosh sound via filtered white noise sweep
        const bufferSize = audioContext.sampleRate * 0.45;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = buffer;
        
        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(250, now);
        filter.frequency.exponentialRampToValueAtTime(1400, now + 0.4);
        
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        
        noiseSource.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);
        noiseSource.start(now);
    } 
    else if (type === 'paperSlide') {
        // Sliding rustle noise
        const bufferSize = audioContext.sampleRate * 0.6;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(700, now);
        filter.Q.value = 6;
        filter.frequency.linearRampToValueAtTime(300, now + 0.55);
        
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);
        noise.start(now);
    } 
    else if (type === 'chime') {
        // High quality sweet bell chime
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
        gain.connect(audioContext.destination);
        
        const partials = [880, 1318.51, 1760, 2200]; 
        partials.forEach((f, idx) => {
            const osc = audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now);
            
            const pGain = audioContext.createGain();
            pGain.gain.setValueAtTime(0.15 / (idx + 1), now);
            
            osc.connect(pGain);
            pGain.connect(gain);
            osc.start(now);
            osc.stop(now + 1.4);
        });
    }
    else if (type === 'blow') {
        // Blowing wind
        const bufferSize = audioContext.sampleRate * 0.9;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.9);
        
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);
        noise.start(now);
    }
    else if (type === 'fireworks') {
        // Boom & Crackle
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.linearRampToValueAtTime(30, now + 0.5);
        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        
        setTimeout(() => {
            const bufferSize = audioContext.sampleRate * 0.4;
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = audioContext.createBufferSource();
            noise.buffer = buffer;
            const filter = audioContext.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(1500, now);
            const gainCrack = audioContext.createGain();
            gainCrack.gain.setValueAtTime(0.06, now + 0.05);
            gainCrack.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            noise.connect(filter);
            filter.connect(gainCrack);
            gainCrack.connect(audioContext.destination);
            noise.start(now + 0.05);
        }, 120);
    }
}

/* -------------------------------------------------------------
   MUSIC TRACK & AMBIENT Fallback SYSTEM
------------------------------------------------------------- */
function initBackgroundAudio() {
    if (audioContext) return;
    
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
    
    bgAudio = new Audio();
    bgAudio.src = 'assets/music/bg-melody.mp3';
    bgAudio.loop = true;
    bgAudio.volume = 0.5;
    
    bgAudio.play().then(() => {
        isMusicPlaying = true;
        updateAudioUI(true);
    }).catch(err => {
        console.warn("MP3 load blocked. Playing procedural chord synthesizer.", err);
        startProceduralSynth();
    });
}

function startProceduralSynth() {
    isMusicPlaying = true;
    updateAudioUI(true);
    
    playSynthChord(CONFIG.chords[currentChordIndex]);
    currentChordIndex = (currentChordIndex + 1) % CONFIG.chords.length;
    
    synthInterval = setInterval(() => {
        if (!isMuted && isMusicPlaying) {
            playSynthChord(CONFIG.chords[currentChordIndex]);
            currentChordIndex = (currentChordIndex + 1) % CONFIG.chords.length;
        }
    }, 5000);
}

function playSynthChord(frequencies) {
    if (!audioContext || audioContext.state === 'suspended') {
        audioContext.resume();
    }
    const now = audioContext.currentTime;
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.06, now + 1.8);
    gainNode.gain.setValueAtTime(0.06, now + 3.4);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 5.0);
    gainNode.connect(audioContext.destination);
    
    frequencies.forEach((f) => {
        const osc = audioContext.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = f;
        
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 650;
        
        osc.connect(filter);
        filter.connect(gainNode);
        osc.start(now);
        osc.stop(now + 5.0);
    });
}

function toggleMute() {
    isMuted = !isMuted;
    if (bgAudio) bgAudio.muted = isMuted;
    updateAudioUI(!isMuted);
}

function updateAudioUI(isPlaying) {
    const icon = document.querySelector('#music-toggle i');
    const status = document.getElementById('audio-status');
    const panel = document.getElementById('audio-panel');
    panel.classList.remove('hidden');
    
    if (isPlaying) {
        icon.className = 'fas fa-volume-up';
        status.innerText = "Playing";
    } else {
        icon.className = 'fas fa-volume-mute';
        status.innerText = "Muted";
    }
}

/* -------------------------------------------------------------
   3. ENVELOPE WAX SEAL CRACK FLOW
------------------------------------------------------------- */
function setupEventListeners() {
    const startBtn = document.getElementById('start-btn');
    const introScreen = document.getElementById('intro-screen');
    const envelopeScreen = document.getElementById('envelope-screen');
    const envelope = document.getElementById('envelope');
    const waxSeal = document.getElementById('wax-seal');
    const letter = document.getElementById('letter');
    const continueBtn = document.getElementById('continue-journey-btn');
    const mainContent = document.getElementById('main-content');
    const blowBtn = document.getElementById('blow-btn');
    const micToggleBtn = document.getElementById('mic-toggle-btn');
    
    // Volume controls
    document.getElementById('volume-slider').addEventListener('input', (e) => {
        const vol = parseFloat(e.target.value);
        if (bgAudio) bgAudio.volume = vol;
    });
    
    document.getElementById('music-toggle').addEventListener('click', toggleMute);
    
    // Start page
    startBtn.addEventListener('click', () => {
        initBackgroundAudio();
        
        introScreen.style.opacity = 0;
        setTimeout(() => {
            introScreen.classList.add('hidden');
            envelopeScreen.classList.remove('hidden');
            setTimeout(() => {
                envelopeScreen.classList.add('visible');
            }, 50);
        }, 1200);
    });
    
    // Wax Seal Cracking sequence
    waxSeal.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop envelope bubbling
        if (waxSeal.classList.contains('cracked')) return;
        
        playSynthSound('click');
        waxSeal.classList.add('cracked');
        
        // Wait for wax split to complete, then slide open envelope flap
        setTimeout(() => {
            playSynthSound('envelopeOpen');
            envelope.classList.add('open');
            
            // Extract letter
            setTimeout(() => {
                playSynthSound('paperSlide');
                letter.classList.add('extracted');
                
                // Expand letter full screen
                setTimeout(() => {
                    letter.classList.add('expanded');
                    startTypewriterEffect();
                }, 800);
                
            }, 800);
            
        }, 600);
    });
    
    // Close envelope overlay
    continueBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        gsap.to('#envelope-screen', {
            opacity: 0,
            duration: 1.2,
            onComplete: () => {
                envelopeScreen.classList.add('hidden');
                mainContent.classList.remove('hidden-scroll');
                
                // Scroll setup
                initScrollMechanics();
                window.scrollTo(0, 1);
            }
        });
    });
    
    // Cake Candle Blow action
    blowBtn.addEventListener('click', () => {
        playSynthSound('blow');
        extinguishCandles();
    });
    
    // Deferred Mic activation trigger
    micToggleBtn.addEventListener('click', () => {
        toggleMicDetection();
    });
    
    // Cinematic Ending trigger
    const endBtn = document.getElementById('end-surprise-btn');
    if (endBtn) {
        endBtn.addEventListener('click', triggerCinematicEnding);
    }
}

/* -------------------------------------------------------------
   4. TYPEWRITER EFFECT
------------------------------------------------------------- */
function startTypewriterEffect() {
    const textContainer = document.getElementById('typewriter-text');
    const continueBtn = document.getElementById('continue-journey-btn');
    const text = CONFIG.letterText;
    let index = 0;
    
    function write() {
        if (index < text.length) {
            textContainer.innerHTML += text.charAt(index);
            index++;
            
            let delay = 30;
            const char = text.charAt(index - 1);
            if (char === '.' || char === '?') delay = 500;
            else if (char === ',') delay = 250;
            else if (char === '\n') delay = 350;
            
            const paper = document.querySelector('.letter.expanded .letter-paper');
            if (paper) {
                paper.scrollTop = paper.scrollHeight;
            }
            
            setTimeout(write, delay);
        } else {
            continueBtn.classList.remove('hidden');
            gsap.fromTo(continueBtn, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8 });
        }
    }
    setTimeout(write, 800);
}

/* -------------------------------------------------------------
   5. GSAP SCROLL MECHANICS & BACKGROUND TRANSITIONS
------------------------------------------------------------- */
function initScrollMechanics() {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        touchMultiplier: 1.5
    });
    
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    
    lenis.on('scroll', ScrollTrigger.update);
    gsap.registerPlugin(ScrollTrigger);
    
    // Horizontal timeline pin translation
    const journeySection = document.getElementById('journey');
    const track = document.querySelector('.horizontal-track');
    
    const getScrollAmount = () => {
        let trackWidth = track.scrollWidth;
        let windowWidth = window.innerWidth;
        return -(trackWidth - windowWidth * 0.75);
    };
    
    gsap.to(track, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
            trigger: journeySection,
            pin: true,
            start: 'top top',
            end: () => `+=${track.scrollWidth - window.innerWidth}`,
            scrub: 1,
            invalidateOnRefresh: true,
        }
    });
    
    // Timeline Card fades (No longer faded out, kept clean and visible)
    const nodes = document.querySelectorAll('.timeline-node');
    nodes.forEach((node) => {
        gsap.fromTo(node, 
            { opacity: 1, y: 35, scale: 0.95 },
            { 
                opacity: 1, y: 0, scale: 1,
                scrollTrigger: {
                    trigger: node,
                    start: 'left center+=150',
                    end: 'center center',
                    scrub: true,
                    horizontal: true
                }
            }
        );
    });
    
    // Why Today Is Special fade-in
    gsap.fromTo('#why-special .special-card',
        { opacity: 0, scale: 0.92, y: 50 },
        {
            opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power3.out',
            scrollTrigger: {
                trigger: '#why-special',
                start: 'top bottom-=150',
                toggleActions: 'play none none none'
            }
        }
    );
    
    // Background gradient scroll-trigger switch classes on body
    // 1. Morning state (Default timeline)
    ScrollTrigger.create({
        trigger: '#journey',
        start: 'top center',
        end: 'bottom center',
        onEnter: () => updateBodyBackground('bg-morning'),
        onEnterBack: () => updateBodyBackground('bg-morning')
    });
    
    // 2. Midday state (Special card & memories)
    ScrollTrigger.create({
        trigger: '#why-special',
        start: 'top center',
        end: 'bottom center',
        onEnter: () => updateBodyBackground('bg-midday'),
        onEnterBack: () => updateBodyBackground('bg-midday')
    });
    
    // 3. Sunset state (Memory Jar)
    ScrollTrigger.create({
        trigger: '#memory-jar-section',
        start: 'top center',
        end: 'bottom center',
        onEnter: () => updateBodyBackground('bg-sunset'),
        onEnterBack: () => updateBodyBackground('bg-sunset')
    });
    
    // 4. Night state (Cake & fireworks & moon)
    ScrollTrigger.create({
        trigger: '#surprise',
        start: 'top center',
        onEnter: () => updateBodyBackground('bg-night'),
        onEnterBack: () => updateBodyBackground('bg-night')
    });
}

function updateBodyBackground(className) {
    document.body.className = className;
}

/* -------------------------------------------------------------
   6. 3D POLAROID CAROUSEL GALLERY
------------------------------------------------------------- */
function setupPolaroidCarousel() {
    const cards = document.querySelectorAll('.carousel-card');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const dotsContainer = document.getElementById('carousel-dots');
    
    // Generate navigation dots
    cards.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => {
            playSynthSound('click');
            carouselIndex = idx;
            updateCarouselState();
        });
        dotsContainer.appendChild(dot);
    });
    
    function updateCarouselState() {
        const numCards = cards.length;
        const dots = document.querySelectorAll('.carousel-dot');
        
        cards.forEach((card, idx) => {
            const offset = idx - carouselIndex;
            let depth = -Math.abs(offset) * 120;
            let rot = offset * -25;
            let rotZ = offset * -4;
            let translateX = offset * 140;
            let opacity = 1;
            
            // Handle circular wrapping layers
            if (Math.abs(offset) > 1) {
                opacity = 0;
                depth = -300;
            }
            
            card.style.transform = `translateX(${translateX}px) translateZ(${depth}px) rotateY(${rot}deg) rotateZ(${rotZ}deg)`;
            card.style.opacity = opacity;
            card.style.zIndex = 10 - Math.abs(offset);
            
            // Pointer events block inactive cards
            if (offset === 0) {
                card.style.pointerEvents = 'auto';
            } else {
                card.style.pointerEvents = 'none';
            }
        });
        
        // Update Active Dot
        dots.forEach((dot, idx) => {
            dot.className = `carousel-dot ${idx === carouselIndex ? 'active' : ''}`;
        });
    }
    
    nextBtn.addEventListener('click', () => {
        playSynthSound('click');
        carouselIndex = (carouselIndex + 1) % cards.length;
        updateCarouselState();
    });
    
    prevBtn.addEventListener('click', () => {
        playSynthSound('click');
        carouselIndex = (carouselIndex - 1 + cards.length) % cards.length;
        updateCarouselState();
    });
    
    // Touch Drag support
    let startX = 0;
    const viewport = document.querySelector('.carousel-viewport');
    
    viewport.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });
    
    viewport.addEventListener('touchend', (e) => {
        const diffX = e.changedTouches[0].clientX - startX;
        if (Math.abs(diffX) > 50) {
            playSynthSound('click');
            if (diffX > 0) {
                carouselIndex = (carouselIndex - 1 + cards.length) % cards.length;
            } else {
                carouselIndex = (carouselIndex + 1) % cards.length;
            }
            updateCarouselState();
        }
    });
    
    // Initial draw
    updateCarouselState();
}

/* -------------------------------------------------------------
   7. MEMORY JAR CANVAS PHYSICS & LOGIC
------------------------------------------------------------- */
function setupMemoryJarPhysics() {
    const canvas = document.getElementById('jar-canvas');
    const ctx = canvas.getContext('2d');
    const speechBubble = document.getElementById('memory-speech-bubble');
    const memoryText = document.getElementById('memory-text');
    
    let stars = [];
    
    function resize() {
        canvas.width = canvas.parentElement.clientWidth - 20;
        canvas.height = canvas.parentElement.clientHeight - 60;
    }
    resize();
    
    class JarStar {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 8 + 8; // large clickable stars
            this.vx = Math.random() * 1.5 - 0.75;
            this.vy = Math.random() * 1.5 - 0.75;
            this.pulseSpeed = Math.random() * 0.04 + 0.01;
            this.angle = Math.random() * Math.PI;
            this.glowOpacity = Math.random() * 0.5 + 0.5;
            this.hue = Math.random() * 20 + 35; // golden hues
            this.memoryIndex = Math.floor(Math.random() * CONFIG.jarMemories.length);
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.angle += this.pulseSpeed;
            this.glowOpacity = 0.5 + Math.sin(this.angle) * 0.3;
            
            // Jar boundary bounce calculations (relative to canvas width/height)
            const margin = 20;
            if (this.x < margin || this.x > canvas.width - margin) {
                this.vx *= -1;
                this.x = Math.max(margin, Math.min(canvas.width - margin, this.x));
            }
            if (this.y < margin + 10 || this.y > canvas.height - margin) {
                this.vy *= -1;
                this.y = Math.max(margin + 10, Math.min(canvas.height - margin, this.y));
            }
        }
        
        draw() {
            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = `hsl(${this.hue}, 100%, 65%)`;
            
            ctx.fillStyle = `rgba(255, 235, 170, ${this.glowOpacity})`;
            ctx.beginPath();
            
            // Draw 5-point star
            const points = 5;
            const outerRadius = this.size;
            const innerRadius = this.size / 2;
            
            let rot = Math.PI / 2 * 3;
            let cx = this.x;
            let cy = this.y;
            let step = Math.PI / points;

            ctx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < points; i++) {
                let x = cx + Math.cos(rot) * outerRadius;
                let y = cy + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y);
                rot += step;

                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
            }
            ctx.lineTo(cx, cy - outerRadius);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }
    
    // Spawn stars in middle of the jar
    for (let i = 0; i < jarStarsMax; i++) {
        stars.push(new JarStar(
            canvas.width / 2 + (Math.random() * 60 - 30),
            canvas.height / 2 + (Math.random() * 80 - 40)
        ));
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let s of stars) {
            s.update();
            s.draw();
        }
        requestAnimationFrame(animate);
    }
    animate();
    
    // Canvas click detection for jar stars
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        stars.forEach((star, idx) => {
            // Calculate distance to star center
            const dist = Math.hypot(star.x - mouseX, star.y - mouseY);
            if (dist < star.size + 15) { // 15px click threshold helper padding
                // Clicked!
                playSynthSound('chime');
                
                // Show quote in speech bubble
                const quote = CONFIG.jarMemories[star.memoryIndex];
                
                speechBubble.classList.remove('visible');
                setTimeout(() => {
                    memoryText.innerText = quote;
                    speechBubble.classList.add('visible');
                }, 300);
                
                // Burst star particles on canvas
                triggerStarPop(star.x, star.y);
                
                // Teleport star to new location inside jar with new memory
                star.x = canvas.width / 2 + (Math.random() * 40 - 20);
                star.y = canvas.height / 2 + (Math.random() * 60 - 30);
                star.vx = Math.random() * 1.5 - 0.75;
                star.vy = Math.random() * 1.5 - 0.75;
                star.memoryIndex = Math.floor(Math.random() * CONFIG.jarMemories.length);
            }
        });
    });
    
    function triggerStarPop(x, y) {
        // Confetti local pop burst
        confetti({
            particleCount: 20,
            angle: 90,
            spread: 90,
            origin: { 
                x: (canvas.getBoundingClientRect().left + x) / window.innerWidth,
                y: (canvas.getBoundingClientRect().top + y) / window.innerHeight
            },
            colors: ['#D4AF37', '#FFF0D0', '#EBD3D6']
        });
    }
}

/* -------------------------------------------------------------
   8. BIRTHDAY SURPRISE (Opening Cake, deferred microphone)
------------------------------------------------------------- */
function toggleMicDetection() {
    const micToggleBtn = document.getElementById('mic-toggle-btn');
    const micHint = document.getElementById('mic-hint');
    
    if (activeMic) {
        // Turn off mic
        activeMic = false;
        micToggleBtn.classList.remove('active');
        micToggleBtn.innerHTML = '<i class="fas fa-microphone"></i> Use Mic';
        micHint.innerText = "Microphone disabled. Use the button to blow the candles!";
        if (micStream) {
            micStream.getTracks().forEach(track => track.stop());
        }
    } else {
        // Request Microphone Access
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    activeMic = true;
                    micStream = stream;
                    micToggleBtn.classList.add('active');
                    micToggleBtn.innerHTML = '<i class="fas fa-microphone-slash"></i> Turn Off Mic';
                    micHint.innerText = "Mic enabled! Blow softly into your microphone.";
                    
                    const MicAudioContextClass = window.AudioContext || window.webkitAudioContext;
                    micAudioContext = new MicAudioContextClass();
                    const source = micAudioContext.createMediaStreamSource(stream);
                    micAnalyser = micAudioContext.createAnalyser();
                    micAnalyser.fftSize = 256;
                    source.connect(micAnalyser);
                    
                    listenToMicBlow();
                })
                .catch(err => {
                    console.warn("Microphone permission denied.", err);
                    micHint.innerText = "Mic access denied. Please click the Blow out button!";
                });
        } else {
            micHint.innerText = "Microphone not supported on this browser.";
        }
    }
}

function listenToMicBlow() {
    if (!activeMic || isCandleBlown) return;
    
    const bufferLength = micAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    micAnalyser.getByteFrequencyData(dataArray);
    
    let total = 0;
    // Look primarily at high frequencies (wind sound)
    for (let i = 18; i < bufferLength; i++) {
        total += dataArray[i];
    }
    const average = total / (bufferLength - 18);
    
    if (average > 60) {
        playSynthSound('blow');
        extinguishCandles();
        return;
    }
    
    requestAnimationFrame(listenToMicBlow);
}

function extinguishCandles() {
    if (isCandleBlown) return;
    isCandleBlown = true;
    
    const cake = document.getElementById('interactive-cake');
    const flame = document.querySelector('.flame');
    const smoke = document.querySelector('.smoke');
    const controls = document.querySelector('.cake-controls');
    const micHint = document.getElementById('mic-hint');
    
    // Extinguish visual flame
    flame.classList.remove('active');
    smoke.classList.add('active');
    
    // Open cake drawer & splits
    setTimeout(() => {
        cake.classList.add('open');
    }, 450);
    
    // Fade out hints
    gsap.to([controls, micHint], { opacity: 0, y: -10, duration: 0.5, onComplete: () => {
        controls.style.display = 'none';
        micHint.style.display = 'none';
    }});
    
    // Shut off mic
    if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
    }
    
    // Confetti & Fireworks celebrations
    triggerSurpriseCelebrations();
}

function triggerSurpriseCelebrations() {
    // 1. Confetti shower
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10 };
    
    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        
        const count = 50 * (timeLeft / duration);
        confetti({
            ...defaults,
            particleCount: count,
            origin: { x: Math.random() * 0.3 + 0.05, y: Math.random() - 0.2 }
        });
        confetti({
            ...defaults,
            particleCount: count,
            origin: { x: Math.random() * 0.3 + 0.65, y: Math.random() - 0.2 }
        });
    }, 250);
    
    // 2. Fireworks Engine
    startFireworksEngine();
}

function startFireworksEngine() {
    const canvas = document.getElementById('fireworks-canvas');
    const ctx = canvas.getContext('2d');
    
    let fireworks = [];
    let particles = [];
    
    function resize() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }
    resize();
    
    class Firework {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height;
            this.targetY = Math.random() * (canvas.height * 0.5) + 30;
            this.speed = Math.random() * 3 + 4;
            this.color = `hsl(${Math.random() * 35 + 340}, 80%, 65%)`; // Rose Gold hues
        }
        
        update() {
            this.y -= this.speed;
            if (this.y <= this.targetY) {
                explode(this.x, this.y, this.color);
                return false;
            }
            return true;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
    
    class FireworkParticle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.angle = Math.random() * Math.PI * 2;
            this.speed = Math.random() * 4.5 + 1;
            this.friction = 0.95;
            this.gravity = 0.07;
            this.opacity = 1;
            this.decay = Math.random() * 0.015 + 0.008;
        }
        
        update() {
            this.speed *= this.friction;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;
            this.opacity -= this.decay;
            return this.opacity > 0;
        }
        
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.random() * 2 + 1, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 3;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.restore();
        }
    }
    
    function explode(x, y, color) {
        playSynthSound('fireworks');
        const count = 50;
        for (let i = 0; i < count; i++) {
            particles.push(new FireworkParticle(x, y, color));
        }
    }
    
    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (Math.random() < 0.03 && fireworks.length < 3) {
            fireworks.push(new Firework());
        }
        
        fireworks = fireworks.filter(f => {
            const active = f.update();
            if (active) f.draw();
            return active;
        });
        
        particles = particles.filter(p => {
            const active = p.update();
            if (active) p.draw();
            return active;
        });
        
        if (isCandleBlown) {
            requestAnimationFrame(loop);
        }
    }
    loop();
}

/* -------------------------------------------------------------
   9. STARS NIGHT SKY (Starry moon/firefly scene replacing teddy)
------------------------------------------------------------- */
function initTwinklingStars() {
    const canvas = document.getElementById('stars-canvas');
    const ctx = canvas.getContext('2d');
    
    let stars = [];
    let fireflies = [];
    const maxStars = 80;
    const maxFireflies = window.innerWidth < 768 ? 15 : 30;
    
    function resize() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }
    resize();
    
    class Star {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.5;
            this.maxOpacity = Math.random() * 0.8 + 0.2;
            this.opacity = Math.random() * this.maxOpacity;
            this.speed = Math.random() * 0.015 + 0.005;
            this.direction = Math.random() > 0.5 ? 1 : -1;
        }
        
        update() {
            this.opacity += this.speed * this.direction;
            if (this.opacity > this.maxOpacity || this.opacity < 0) {
                this.direction *= -1;
                this.opacity = Math.max(0, Math.min(this.maxOpacity, this.opacity));
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    class Firefly {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.vx = Math.random() * 0.6 - 0.3;
            this.vy = Math.random() * 0.5 - 0.4;
            this.opacity = Math.random() * 0.7 + 0.1;
            this.pulseSpeed = Math.random() * 0.05 + 0.02;
            this.angle = Math.random() * Math.PI;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.angle += this.pulseSpeed;
            this.opacity = 0.2 + Math.abs(Math.sin(this.angle)) * 0.7;
            
            // bounce/wrap boundaries
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        draw() {
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#D4AF37';
            ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    for (let i = 0; i < maxStars; i++) stars.push(new Star());
    for (let i = 0; i < maxFireflies; i++) fireflies.push(new Firefly());
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Drawing Crescent Moon
        ctx.beginPath();
        const moonX = canvas.width * 0.8;
        const moonY = 100;
        ctx.arc(moonX, moonY, 22, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 246, 220, 0.85)';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#FAF0CC';
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.beginPath();
        ctx.arc(moonX - 9, moonY - 4, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#060410'; // deep night color
        ctx.fill();
        
        // Render
        for (let s of stars) {
            s.update();
            s.draw();
        }
        for (let f of fireflies) {
            f.update();
            f.draw();
        }
        requestAnimationFrame(animate);
    }
    animate();
}

/* -------------------------------------------------------------
   10. CONSTELLATION EASTER EGG GAME
------------------------------------------------------------- */
function setupConstellationStarGame() {
    const counter = document.getElementById('stars-found-counter');
    const tracker = document.getElementById('star-count');
    const hiddenStars = document.querySelectorAll('.hidden-star');
    const ui = document.getElementById('constellation-ui');
    const closeBtn = document.getElementById('close-constellation-btn');
    const canvas = document.getElementById('constellation-canvas');
    const ctx = canvas.getContext('2d');
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();
    
    hiddenStars.forEach(star => {
        star.addEventListener('click', () => {
            const id = star.getAttribute('data-id');
            if (foundStars.has(id)) return;
            
            playSynthSound('chime');
            foundStars.add(id);
            star.classList.add('found');
            
            // Show tracker on first star
            if (foundStars.size === 1) {
                counter.classList.remove('hidden');
            }
            tracker.innerText = foundStars.size;
            
            // Calculate screen coordinate of clicked star
            const rect = star.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            const absoluteY = y + window.scrollY; // Page-relative coordinate
            
            constellationLines.push({ x, y: absoluteY });
            
            // Check completed Constellation
            if (foundStars.size === CONFIG.easterEggStars) {
                triggerConstellationFinish();
            }
        });
    });
    
    function triggerConstellationFinish() {
        // Draw constellation layout
        drawConstellationLines();
        
        // Show Popup UI
        setTimeout(() => {
            ui.classList.remove('hidden');
            setTimeout(() => {
                ui.classList.add('visible');
            }, 50);
        }, 1500);
    }
    
    function drawConstellationLines() {
        // Redraw canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#D4AF37';
        
        // Connect each coordinate sequentially
        ctx.beginPath();
        for (let i = 0; i < constellationLines.length; i++) {
            // Convert page-relative coordinates back to viewport space
            const viewY = constellationLines[i].y - window.scrollY;
            if (i === 0) {
                ctx.moveTo(constellationLines[i].x, viewY);
            } else {
                ctx.lineTo(constellationLines[i].x, viewY);
            }
        }
        ctx.stroke();
        
        // Draw little glowing points
        constellationLines.forEach(pt => {
            const viewY = pt.y - window.scrollY;
            ctx.beginPath();
            ctx.arc(pt.x, viewY, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#D4AF37';
            ctx.fill();
        });
        
        ctx.shadowBlur = 0;
        
        // Keep drawing loop to adjust coordinates during scroll
        if (foundStars.size === CONFIG.easterEggStars) {
            requestAnimationFrame(drawConstellationLines);
        }
    }
    
    closeBtn.addEventListener('click', () => {
        ui.classList.remove('visible');
        setTimeout(() => {
            ui.classList.add('hidden');
            // Fade lines
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            foundStars.clear();
            constellationLines = [];
            counter.classList.add('hidden');
        }, 400);
    });
}

/* -------------------------------------------------------------
   11. GLOBAL Canvas particles (Particles depend on section)
------------------------------------------------------------- */
function initGlobalParticles() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    
    class DustParticle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + Math.random() * 20;
            this.size = Math.random() * 2.2 + 0.4;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = -(Math.random() * 0.5 + 0.1);
            this.opacity = Math.random() * 0.5 + 0.1;
            this.angle = Math.random() * Math.PI;
            this.spinSpeed = Math.random() * 0.02 - 0.01;
            this.type = document.body.className; // morning, midday, sunset, night
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.angle += this.spinSpeed;
            
            // Floating waves
            this.x += Math.sin(this.y * 0.01) * 0.1;
            
            if (this.y < -10) this.reset();
        }
        
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            
            const currentBG = document.body.className;
            
            if (currentBG.includes('bg-sunset') || currentBG.includes('bg-morning')) {
                // Sakura flower petals
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.fillStyle = 'rgba(235, 183, 192, 0.7)'; // soft pink
                ctx.ellipse(0, 0, this.size * 2, this.size, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (currentBG.includes('bg-night')) {
                // Fireflies/glowing dust
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(212, 175, 55, 0.8)';
                ctx.shadowBlur = 6;
                ctx.shadowColor = '#D4AF37';
                ctx.fill();
            } else {
                // Gold particles
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(183, 110, 121, 0.5)';
                ctx.fill();
            }
            
            ctx.restore();
        }
    }
    
    const count = window.innerWidth < 768 ? 20 : 50;
    for (let i = 0; i < count; i++) {
        particles.push(new DustParticle());
    }
    
    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let p of particles) {
            p.update();
            p.draw();
        }
        requestAnimationFrame(loop);
    }
    loop();
}

/* -------------------------------------------------------------
   12. CINEMATIC ENDING SEQUENCE
------------------------------------------------------------- */
function triggerCinematicEnding() {
    playSynthSound('blow'); // plays a soft wind blow sound
    
    // Smoothly fade out all night sky, letter and QR code layout
    gsap.to(['.final-letter', '.ending-action-container', '.qr-container', '#stars-canvas'], {
        opacity: 0,
        y: -20,
        duration: 2.2,
        ease: 'power2.inOut',
        onComplete: () => {
            // Show ending overlay screen
            const endingScreen = document.getElementById('ending-screen');
            endingScreen.classList.remove('hidden');
            
            setTimeout(() => {
                endingScreen.classList.add('fade-in-active');
                
                // Show final message
                const endText = document.querySelector('.ending-fade-text');
                setTimeout(() => {
                    endText.classList.add('visible');
                    
                    // Gradually fade out background music volume
                    fadeMusicVolume();
                    
                    // After 3.5s, fade the message to pitch black
                    setTimeout(() => {
                        gsap.to('.ending-content', {
                            opacity: 0,
                            duration: 2.0,
                            onComplete: () => {
                                console.log("Experience finished.");
                            }
                        });
                    }, 3500);
                }, 800);
            }, 100);
        }
    });
}

function fadeMusicVolume() {
    if (bgAudio) {
        let vol = bgAudio.volume;
        const fadeInterval = setInterval(() => {
            vol -= 0.05;
            if (vol <= 0.02) {
                vol = 0;
                bgAudio.pause();
                clearInterval(fadeInterval);
            }
            bgAudio.volume = Math.max(0, vol);
        }, 150);
    }
}
