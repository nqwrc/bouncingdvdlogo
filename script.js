/**
 * DVD Logo Bounce - Ultimate Edition
 * Una ricreazione avanzata dell'animazione classica del logo DVD che rimbalza.
 */

// Elementi DOM e costanti
const $ = id => document.getElementById(id);
const $$ = (selector, context = document) => context.querySelectorAll(selector);
const dvdLogo = $('dvd-logo'), dvdPath = $('dvd-path'), container = $('container'),
      pauseBtn = $('pause-btn'), resetBtn = $('reset-btn'), 
      speedSlider = $('speed-slider'), speedValue = $('speed-value'),
      sizeSlider = $('size-slider'), sizeValue = $('size-value'),
      trailBtn = $('trail-btn'), multiBtn = $('multi-btn'), gravityBtn = $('gravity-btn'),
      fpsValue = $('fps-value'), bounceCount = $('bounce-count'), perfectCount = $('perfect-count'),
      currentMode = $('current-mode'), controlPanel = $('control-panel'),
      saveSettingsBtn = $('save-settings-btn'), resetSettingsBtn = $('reset-settings-btn'),
      toast = $('toast');

// Constants
const PERFECT_HIT_MARGIN = 5,  // pixel
      DEFAULT_SIZE = 150,
      DEFAULT_SPEED = 2,
      TRAIL_OPACITY_STEP = 0.05,
      MAX_TRAILS = 10;

// COLORS gestiti dal color-manager
let COLORS = [
    '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', 
    '#0000FF', '#4B0082', '#9400D3', '#FF00FF',
    '#FF1493', '#00FFFF', '#7CFC00', '#FFD700'
];

// State
let x = 50, y = 50,
    dx = DEFAULT_SPEED, dy = DEFAULT_SPEED,
    tempDx = 0, tempDy = 0,
    logoWidth = DEFAULT_SIZE, logoHeight = DEFAULT_SIZE * (70/150),
    colorIndex = 0, isAnimating = true, 
    isTrailEnabled = false, isMultiEnabled = false, isGravityEnabled = false,
    trails = [], trailInterval = null, 
    bounce = 0, perfectHits = 0, logos = [],
    lastRender = 0, frameCount = 0, fps = 0, lastFpsUpdate = 0,
    usePerformanceTools = false;

// Initialize preference manager
const preferences = new PreferenceManager();

// Esponi la funzione per aggiornare i colori
window.updateGameColors = function(newColors) {
    if (Array.isArray(newColors) && newColors.length > 0) {
        COLORS = newColors;
        console.log('Colori aggiornati:', COLORS);
    }
};

// Toast notification
function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), duration);
}

// FPS counter
function updateFPS(timestamp) {
    if (!lastRender) { lastRender = timestamp; return; }
    
    frameCount++;
    const elapsed = timestamp - lastFpsUpdate;
    
    if (elapsed >= 1000) {
        fps = Math.round((frameCount * 1000) / elapsed);
        fpsValue.textContent = fps;
        frameCount = 0;
        lastFpsUpdate = timestamp;
    }
    
    lastRender = timestamp;
}

// Initialize
function init() {
    // Controlla se sono disponibili le ottimizzazioni
    usePerformanceTools = window.performanceTools !== undefined;
    console.log('Uso ottimizzazioni prestazioni:', usePerformanceTools ? 'Sì' : 'No');
    
    // Load preferences
    const savedSpeed = preferences.getPreference('speed');
    const savedSize = preferences.getPreference('size');
    const savedTrail = preferences.getPreference('trail');
    const savedMulti = preferences.getPreference('multi');
    const savedGravity = preferences.getPreference('gravity');
    
    // Set initial color
    dvdPath.setAttribute('fill', COLORS[colorIndex]);
    
    // Set initial size from preferences
    resizeLogo(savedSize);
    
    // Set initial position to center
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    x = (containerWidth - logoWidth) / 2;
    y = (containerHeight - logoHeight) / 2;
    
    // Set initial random direction with saved speed
    const angle = Math.random() * Math.PI * 2;
    dx = Math.cos(angle) * savedSpeed;
    dy = Math.sin(angle) * savedSpeed;
    
    // Update UI
    speedSlider.value = savedSpeed;
    speedValue.textContent = savedSpeed;
    sizeSlider.value = savedSize;
    sizeValue.textContent = savedSize;
    
    // Prima imposta gli stati senza attivare le funzioni
    isTrailEnabled = savedTrail;
    isMultiEnabled = savedMulti;
    isGravityEnabled = savedGravity;
    
    // Poi aggiorna l'interfaccia in base agli stati
    if (isTrailEnabled) {
        trailBtn.classList.add('active');
        trailInterval = setInterval(createTrail, 200);
    } else {
        trailBtn.classList.remove('active');
    }
    
    if (isMultiEnabled) {
        multiBtn.classList.add('active');
        // Create multi logos once
        for (let i = 0; i < 3; i++) createMultiLogo();
    } else {
        multiBtn.classList.remove('active');
    }
    
    gravityBtn.classList.toggle('active', isGravityEnabled);
    
    // Aggiorna il testo dello stato
    updateStatusText();
}

// Change color with smooth transition
function changeColor() {
    colorIndex = (colorIndex + 1) % COLORS.length;
    const newColor = COLORS[colorIndex];
    
    // Apply color with transition effect
    dvdPath.style.transition = 'fill 0.3s ease';
    dvdPath.setAttribute('fill', newColor);
    
    // Reset transition after color change
    setTimeout(() => {
        dvdPath.style.transition = '';
    }, 300);
}

// Resize logo keeping aspect ratio
function resizeLogo(width) {
    logoWidth = width;
    logoHeight = width * (70/150);
    
    dvdLogo.style.width = `${logoWidth}px`;
    dvdLogo.style.height = `${logoHeight}px`;
}

// Create trail effect
function createTrail() {
    if (!isTrailEnabled) return;
    
    let trail;
    const currentColor = dvdPath.getAttribute('fill');
    
    if (usePerformanceTools) {
        // Usa l'object pool per creare il trail
        trail = window.performanceTools.createTrail(x, y, logoWidth, logoHeight, currentColor);
        
        // Se il trail è stato creato correttamente
        if (trail) {
            // Clona il contenuto SVG dal logo originale
            if (!trail.firstChild) {
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                svg.setAttribute('xml:space', 'preserve');
                svg.setAttribute('width', '263');
                svg.setAttribute('height', '117');
                svg.setAttribute('viewBox', '0 0 263 117');
                
                const originalSvg = dvdLogo.querySelector('svg');
                if (originalSvg) svg.innerHTML = originalSvg.innerHTML;
                
                trail.appendChild(svg);
            }
            
            // Imposta il colore
            const svgPath = trail.querySelector('g');
            if (svgPath) svgPath.setAttribute('fill', currentColor);
        }
    } else {
        // Metodo standard senza object pool
        trail = dvdLogo.cloneNode(true);
        trail.id = '';
        trail.classList.add('trail');
        trail.style.left = `${x}px`;
        trail.style.top = `${y}px`;
        trail.style.opacity = '0.5';
        container.appendChild(trail);
    }
    
    if (trail) {
        trails.push(trail);
        
        // Limit the number of trails
        if (trails.length > MAX_TRAILS) {
            const oldestTrail = trails.shift();
            
            if (usePerformanceTools) {
                window.performanceTools.releaseTrail(oldestTrail);
            } else if (container.contains(oldestTrail)) {
                container.removeChild(oldestTrail);
            }
        }
        
        // Fade out trails
        trails.forEach((t, index) => {
            t.style.opacity = 0.5 - (index * TRAIL_OPACITY_STEP);
        });
    }
}

// Create multi DVD logo
function createMultiLogo() {
    // Controllo di sicurezza: se la modalità multi non è attiva, non fare nulla
    if (!isMultiEnabled) return;
    
    let newLogo;
    const randomColorIndex = Math.floor(Math.random() * COLORS.length);
    const randomColor = COLORS[randomColorIndex];
    
    // Random position
    const randomX = Math.random() * (container.clientWidth - logoWidth);
    const randomY = Math.random() * (container.clientHeight - logoHeight);
    
    // Random direction
    const angle = Math.random() * Math.PI * 2;
    const speed = parseFloat(speedSlider.value);
    
    if (usePerformanceTools) {
        // Usa l'object pool per creare il logo
        newLogo = window.performanceTools.createLogo(randomX, randomY, logoWidth, logoHeight, randomColor);
        
        // Se il logo è stato creato correttamente
        if (newLogo) {
            // Clona il contenuto SVG se necessario
            if (!newLogo.firstChild) {
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                svg.setAttribute('xml:space', 'preserve');
                svg.setAttribute('width', '263');
                svg.setAttribute('height', '117');
                svg.setAttribute('viewBox', '0 0 263 117');
                
                const originalSvg = dvdLogo.querySelector('svg');
                if (originalSvg) svg.innerHTML = originalSvg.innerHTML;
                
                newLogo.appendChild(svg);
            }
            
            // Imposta il colore
            const svgPath = newLogo.querySelector('g');
            if (svgPath) svgPath.setAttribute('fill', randomColor);
        }
    } else {
        // Metodo standard
        newLogo = dvdLogo.cloneNode(true);
        newLogo.id = `dvd-logo-${logos.length + 1}`;
        
        // Set position
        newLogo.style.left = `${randomX}px`;
        newLogo.style.top = `${randomY}px`;
        
        // Random color
        newLogo.querySelector('g').setAttribute('fill', randomColor);
        
        // Add to DOM
        container.appendChild(newLogo);
    }
    
    if (newLogo) {
        // Store in array
        logos.push({
            element: newLogo,
            x: randomX,
            y: randomY,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            colorIndex: randomColorIndex
        });
    }
}

// Check for perfect hit (corner hit)
function checkPerfectHit(x, y, containerWidth, containerHeight) {
    const corners = [
        { x: 0, y: 0, hit: x <= PERFECT_HIT_MARGIN && y <= PERFECT_HIT_MARGIN },
        { x: containerWidth - logoWidth, y: 0, hit: x + logoWidth >= containerWidth - PERFECT_HIT_MARGIN && y <= PERFECT_HIT_MARGIN },
        { x: 0, y: containerHeight - logoHeight, hit: x <= PERFECT_HIT_MARGIN && y + logoHeight >= containerHeight - PERFECT_HIT_MARGIN },
        { x: containerWidth - logoWidth, y: containerHeight - logoHeight, hit: x + logoWidth >= containerWidth - PERFECT_HIT_MARGIN && y + logoHeight >= containerHeight - PERFECT_HIT_MARGIN }
    ];
    
    const hitCorner = corners.find(corner => corner.hit);
    
    if (hitCorner) {
        perfectHits++;
        perfectCount.textContent = perfectHits;
        
        // Crea fuochi d'artificio nel punto esatto dell'impatto
        createFireworks(hitCorner.x + logoWidth/2, hitCorner.y + logoHeight/2);
        
        // Special effect for perfect hit - color changes
        for (let i = 0; i < 3; i++) {
            if (usePerformanceTools) {
                window.performanceTools.scheduleTask(() => {
                    setTimeout(() => changeColor(), i * 200);
                }, 'normal');
            } else {
                setTimeout(() => changeColor(), i * 200);
            }
        }
        
        return true;
    }
    
    return false;
}

// Crea effetto fuochi d'artificio
function createFireworks(x, y) {
    // Numero di particelle
    const particleCount = 40;
    const colors = COLORS.slice(); // Usa i colori già definiti
    
    // Crea un contenitore per i fuochi d'artificio
    const fireworks = document.createElement('div');
    fireworks.className = 'fireworks';
    fireworks.style.left = `${x}px`;
    fireworks.style.top = `${y}px`;
    container.appendChild(fireworks);
    
    // Crea le particelle
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Angolo casuale
        const angle = Math.random() * Math.PI * 2;
        // Distanza casuale
        const distance = 50 + Math.random() * 100;
        // Velocità casuale
        const speed = 0.8 + Math.random() * 1.2;
        // Dimensione casuale
        const size = 3 + Math.random() * 6;
        // Colore casuale dai colori disponibili
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Calcola la posizione finale
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        
        // Imposta stile iniziale
        Object.assign(particle.style, {
            background: color,
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            position: 'absolute',
            left: '0',
            top: '0',
            transform: 'translate(-50%, -50%)',
            opacity: 1
        });
        
        // Aggiungi al contenitore
        fireworks.appendChild(particle);
        
        // Anima la particella
        particle.animate([
            { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
            { transform: `translate(${endX}px, ${endY}px) scale(1)`, opacity: 1, offset: 0.6 },
            { transform: `translate(${endX * 1.1}px, ${endY * 1.1}px) scale(0.8)`, opacity: 0.8, offset: 0.8 },
            { transform: `translate(${endX * 1.2}px, ${endY * 1.2}px) scale(0)`, opacity: 0 }
        ], {
            duration: 1500 + Math.random() * 800,
            easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)'
        });
    }
    
    // Rimuovi i fuochi d'artificio dopo l'animazione
    setTimeout(() => {
        if (container.contains(fireworks)) {
            container.removeChild(fireworks);
        }
    }, 2500);
}

// Apply physics - main animation loop
function updatePosition(timestamp) {
    updateFPS(timestamp);
    
    if (!isAnimating) {
        requestAnimationFrame(updatePosition);
        return;
    }
    
    // Get container dimensions
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Apply gravity if enabled
    if (isGravityEnabled) dy += 0.1;
    
    // Update position based on velocity
    x += dx;
    y += dy;
    
    // Check for collision with edges
    let hasCollided = false;
    
    if (x <= 0 || x + logoWidth >= containerWidth) {
        dx = -dx;
        x = Math.max(0, Math.min(x, containerWidth - logoWidth));
        hasCollided = true;
    }
    
    if (y <= 0 || y + logoHeight >= containerHeight) {
        // More realistic bounce with gravity
        if (isGravityEnabled) {
            dy = -dy * 0.9; // Damping factor
        } else {
            dy = -dy;
        }
        
        y = Math.max(0, Math.min(y, containerHeight - logoHeight));
        hasCollided = true;
    }
    
    if (hasCollided) {
        // Don't change color on perfect hits (already handled)
        if (!checkPerfectHit(x, y, containerWidth, containerHeight)) {
            changeColor();
        }
        
        bounce++;
        bounceCount.textContent = bounce;
    }
    
    // Set the new position with hardware acceleration
    dvdLogo.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    
    // Update multi logos if enabled
    if (isMultiEnabled) updateMultiLogos(containerWidth, containerHeight);
    
    // Request next frame
    requestAnimationFrame(updatePosition);
}

// Update multiple DVD logos
function updateMultiLogos(containerWidth, containerHeight) {
    logos.forEach(logo => {
        // Update position
        logo.x += logo.dx;
        logo.y += logo.dy;
        
        // Apply gravity if enabled
        if (isGravityEnabled) logo.dy += 0.1;
        
        // Check collisions
        let hasCollided = false;
        
        if (logo.x <= 0 || logo.x + logoWidth >= containerWidth) {
            logo.dx = -logo.dx;
            logo.x = Math.max(0, Math.min(logo.x, containerWidth - logoWidth));
            hasCollided = true;
        }
        
        if (logo.y <= 0 || logo.y + logoHeight >= containerHeight) {
            // More realistic bounce with gravity
            if (isGravityEnabled) {
                logo.dy = -logo.dy * 0.9; // Damping factor
            } else {
                logo.dy = -logo.dy;
            }
            
            logo.y = Math.max(0, Math.min(logo.y, containerHeight - logoHeight));
            hasCollided = true;
        }
        
        if (hasCollided) {
            // Change color
            logo.colorIndex = (logo.colorIndex + 1) % COLORS.length;
            logo.element.querySelector('g').setAttribute('fill', COLORS[logo.colorIndex]);
        }
        
        // Set new position with hardware acceleration
        logo.element.style.transform = `translate3d(${logo.x}px, ${logo.y}px, 0)`;
    });
}

// Toggle pause/resume
function togglePause() {
    if (isAnimating) {
        // Store current direction
        tempDx = dx;
        tempDy = dy;
        dx = 0;
        dy = 0;
        isAnimating = false;
        
        // Update UI
        pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        pauseBtn.title = 'Riprendi';
        dvdLogo.classList.add('paused');
        
        // Non spostare il logo, rimane esattamente dove si trova
    } else {
        // Restore direction
        dx = tempDx;
        dy = tempDy;
        isAnimating = true;
        
        // Update UI
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        pauseBtn.title = 'Pausa';
        dvdLogo.classList.remove('paused');
    }
}

// Toggle hide UI elements
function toggleUI() {
    document.body.classList.toggle('clean-mode');
    
    // Mostra un toast solo quando l'UI riappare
    if (!document.body.classList.contains('clean-mode')) {
        showToast('Premi H per nascondere nuovamente l\'interfaccia');
    }
}

// Reset all to initial state
function resetAll() {
    // Reset position to center
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    x = (containerWidth - logoWidth) / 2;
    y = (containerHeight - logoHeight) / 2;
    
    // Reset velocity to random direction
    const angle = Math.random() * Math.PI * 2;
    const speed = parseFloat(speedSlider.value);
    dx = Math.cos(angle) * speed;
    dy = Math.sin(angle) * speed;
    
    // Ensure animation is running
    if (!isAnimating) togglePause();
    
    // Reset counters
    bounce = 0;
    perfectHits = 0;
    bounceCount.textContent = '0';
    perfectCount.textContent = '0';
    
    // Reset multi logos
    resetMultiLogos();
    
    // Set new position immediately
    dvdLogo.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

// Reset multi logos
function resetMultiLogos() {
    // Remove existing multi logos
    logos.forEach(logo => {
        if (usePerformanceTools) {
            window.performanceTools.releaseLogo(logo.element);
        } else if (container.contains(logo.element)) {
            container.removeChild(logo.element);
        }
    });
    
    // Clear array
    logos = [];
    
    // Recreate if enabled
    if (isMultiEnabled) {
        for (let i = 0; i < 3; i++) createMultiLogo();
    }
}

// Toggle trail effect
function toggleTrail() {
    isTrailEnabled = !isTrailEnabled;
    trailBtn.classList.toggle('active');
    
    if (isTrailEnabled) {
        trailInterval = setInterval(createTrail, 200);
    } else {
        clearInterval(trailInterval);
        trailInterval = null;
        
        // Remove existing trails
        trails.forEach(trail => {
            if (usePerformanceTools) {
                window.performanceTools.releaseTrail(trail);
            } else if (container.contains(trail)) {
                container.removeChild(trail);
            }
        });
        
        trails = [];
    }
    
    // Update UI
    updateStatusText();
    
    // Auto-save preference
    preferences.setPreference('trail', isTrailEnabled);
}

// Toggle multi logo mode
function toggleMulti() {
    isMultiEnabled = !isMultiEnabled;
    multiBtn.classList.toggle('active');
    
    if (isMultiEnabled) {
        // Create initial multi logos
        for (let i = 0; i < 3; i++) {
            createMultiLogo();
        }
    } else {
        // Remove existing multi logos
        logos.forEach(logo => {
            if (usePerformanceTools) {
                window.performanceTools.releaseLogo(logo.element);
            } else if (container.contains(logo.element)) {
                container.removeChild(logo.element);
            }
        });
        
        logos = [];
    }
    
    // Update UI
    updateStatusText();
    
    // Auto-save preference
    preferences.setPreference('multi', isMultiEnabled);
}

// Toggle gravity effect
function toggleGravity() {
    isGravityEnabled = !isGravityEnabled;
    gravityBtn.classList.toggle('active');
    
    // Update UI
    updateStatusText();
    
    // Auto-save preference
    preferences.setPreference('gravity', isGravityEnabled);
}

// Toggle control panel
function toggleControlPanel() {
    controlPanel.classList.toggle('expanded');
    
    const isExpanded = controlPanel.classList.contains('expanded');
    const icon = isExpanded ? 'fa-chevron-right' : 'fa-chevron-left';
    
    const toggle = document.getElementById('control-toggle');
    if (toggle) toggle.innerHTML = `<i class="fas ${icon}"></i>`;
}

// Save all settings
function saveSettings() {
    // Le preferenze sono già salvate automaticamente quando vengono cambiate,
    // quindi qui possiamo solo confermare all'utente
    showToast('Preferenze salvate con successo');
}

// Reset all settings to default
function resetSettings() {
    preferences.resetAllPreferences();
    
    // Applica le impostazioni predefinite
    speedSlider.value = DEFAULT_SPEED;
    speedValue.textContent = DEFAULT_SPEED;
    sizeSlider.value = DEFAULT_SIZE;
    sizeValue.textContent = DEFAULT_SIZE;
    
    // Reset speed
    dx = dx !== 0 ? Math.sign(dx) * DEFAULT_SPEED : 0;
    dy = dy !== 0 ? Math.sign(dy) * DEFAULT_SPEED : 0;
    
    // Reset size
    resizeLogo(DEFAULT_SIZE);
    
    // Reset modes
    if (isTrailEnabled) toggleTrail();
    if (isMultiEnabled) toggleMulti();
    if (isGravityEnabled) toggleGravity();
    
    showToast('Preferenze ripristinate');
}

// Update mode text
function updateStatusText() {
    let mode = 'Classica';
    
    if (isTrailEnabled && isMultiEnabled && isGravityEnabled) {
        mode = 'Completa';
    } else if (isTrailEnabled && isMultiEnabled) {
        mode = 'Multi Trail';
    } else if (isTrailEnabled && isGravityEnabled) {
        mode = 'Gravitazionale con Scia';
    } else if (isMultiEnabled && isGravityEnabled) {
        mode = 'Multi Gravitazionale';
    } else if (isTrailEnabled) {
        mode = 'Scia';
    } else if (isMultiEnabled) {
        mode = 'Multi';
    } else if (isGravityEnabled) {
        mode = 'Gravitazionale';
    }
    
    currentMode.textContent = `Modalità ${mode}`;
}

// Event listeners
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetAll);
trailBtn.addEventListener('click', toggleTrail);
multiBtn.addEventListener('click', toggleMulti);
gravityBtn.addEventListener('click', toggleGravity);
saveSettingsBtn.addEventListener('click', saveSettings);
resetSettingsBtn.addEventListener('click', resetSettings);

// Aggiungere un elemento cliccabile per il toggle
const controlToggle = document.createElement('div');
controlToggle.id = 'control-toggle';
controlToggle.innerHTML = '<i class="fas fa-chevron-left"></i>';
Object.assign(controlToggle.style, {
    position: 'absolute',
    left: '-40px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px 0 0 10px',
    cursor: 'pointer',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRight: 'none',
    zIndex: '101'
});
controlPanel.appendChild(controlToggle);
controlToggle.addEventListener('click', toggleControlPanel);

// Speed slider
speedSlider.addEventListener('input', function() {
    const speedMultiplier = parseFloat(this.value);
    speedValue.textContent = speedMultiplier;
    
    const direction = {
        x: dx !== 0 ? Math.sign(dx) : 0,
        y: dy !== 0 ? Math.sign(dy) : 0
    };
    
    dx = direction.x * speedMultiplier;
    dy = direction.y * speedMultiplier;
    
    // If paused, store these values for when we resume
    if (!isAnimating) {
        tempDx = dx;
        tempDy = dy;
    }
    
    // Auto-save speed preference
    preferences.setPreference('speed', speedMultiplier);
});

// Size slider
sizeSlider.addEventListener('input', function() {
    const newSize = parseInt(this.value);
    sizeValue.textContent = newSize;
    resizeLogo(newSize);
    
    // Auto-save size preference
    preferences.setPreference('size', newSize);
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    const speed = parseFloat(speedSlider.value);
    
    switch (e.key) {
        case 'ArrowUp': dy = -Math.abs(speed); break;
        case 'ArrowDown': dy = Math.abs(speed); break;
        case 'ArrowLeft': dx = -Math.abs(speed); break;
        case 'ArrowRight': dx = Math.abs(speed); break;
        case ' ': togglePause(); break; // Space bar to pause/resume
        case 'r': case 'R': resetAll(); break;
        case 't': case 'T': toggleTrail(); break;
        case 'm': case 'M': toggleMulti(); break;
        case 'g': case 'G': toggleGravity(); break;
        case 'h': case 'H': toggleUI(); break;
        case 's': case 'S':
            if (e.ctrlKey) {
                e.preventDefault();
                saveSettings();
            }
            break;
    }
    
    // Prevent default behavior (scrolling)
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});

// Touch controls for mobile
let touchStartX, touchStartY;

container.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
});

container.addEventListener('touchmove', (e) => {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    const speed = parseFloat(speedSlider.value);
    
    if (Math.abs(diffX) > 50 || Math.abs(diffY) > 50) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            dx = Math.sign(diffX) * speed;
        } else {
            // Vertical swipe
            dy = Math.sign(diffY) * speed;
        }
        
        touchStartX = touchEndX;
        touchStartY = touchEndY;
    }
    
    e.preventDefault();
});

// Window resize handler
window.addEventListener('resize', () => {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Ensure logo stays within bounds after resize
    x = Math.max(0, Math.min(x, containerWidth - logoWidth));
    y = Math.max(0, Math.min(y, containerHeight - logoHeight));
});

// Apply theme to control toggle
function updateControlToggleTheme() {
    if (preferences.getPreference('theme') === 'light') {
        Object.assign(controlToggle.style, {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            color: '#333333',
            border: '1px solid rgba(0, 0, 0, 0.2)'
        });
    } else {
        Object.assign(controlToggle.style, {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        });
    }
}

// Listen for theme changes
document.addEventListener('theme-changed', updateControlToggleTheme);

// Initialize and start animation
document.addEventListener('DOMContentLoaded', () => {
    init();
    updateControlToggleTheme();
    requestAnimationFrame(updatePosition);
}); 