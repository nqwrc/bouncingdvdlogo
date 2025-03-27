/**
 * DVD Logo Bounce - Ottimizzazioni delle Prestazioni
 * Implementa ottimizzazioni avanzate per una migliore esperienza utente.
 */

// Object Pool per elementi ripetuti
class ObjectPool {
    constructor(objectCreator, initialSize = 10) {
        this.objectCreator = objectCreator; // Funzione che crea un nuovo oggetto
        this.pool = [];
        
        // Crea oggetti iniziali
        this.expandPool(initialSize);
    }
    
    // Espandi il pool creando nuovi oggetti
    expandPool(count) {
        for (let i = 0; i < count; i++) {
            this.pool.push({
                object: this.objectCreator(),
                inUse: false
            });
        }
    }
    
    // Ottieni un oggetto dal pool
    get() {
        // Cerca un oggetto disponibile
        let obj = this.pool.find(item => !item.inUse);
        
        // Se non c'è, espandi il pool
        if (!obj) {
            this.expandPool(Math.ceil(this.pool.length * 0.5)); // Aumenta del 50%
            obj = this.pool.find(item => !item.inUse);
        }
        
        // Segna come in uso e restituisci
        obj.inUse = true;
        return obj.object;
    }
    
    // Rilascia un oggetto nel pool
    release(object) {
        const poolItem = this.pool.find(item => item.object === object);
        if (poolItem) {
            poolItem.inUse = false;
        }
    }
    
    // Ottieni statistiche sul pool
    getStats() {
        const total = this.pool.length;
        const inUse = this.pool.filter(item => item.inUse).length;
        
        return {
            total,
            inUse,
            available: total - inUse,
            utilizationRate: inUse / total
        };
    }
}

// Manager per le ottimizzazioni delle prestazioni
class PerformanceManager {
    constructor() {
        // Impostazioni di performance
        this.settings = {
            useObjectPools: true,
            useRequestIdleCallback: true,
            deferNonCriticalOperations: true,
            useHardwareAcceleration: true,
            monitorPerformance: true
        };
        
        // Pools di oggetti
        this.pools = {
            trails: null,
            logos: null
        };
        
        // Tasks in sospeso per requestIdleCallback
        this.pendingTasks = [];
        
        // Initialize
        this.init();
    }
    
    // Inizializza i pool di oggetti e altre ottimizzazioni
    init() {
        // Crea pool di trail per effetti scia
        this.pools.trails = new ObjectPool(() => {
            const trail = document.createElement('div');
            trail.classList.add('trail');
            trail.style.position = 'absolute';
            trail.style.opacity = '0';
            trail.style.pointerEvents = 'none';
            trail.style.zIndex = '-1';
            return trail;
        }, 20);
        
        // Crea pool di loghi DVD
        this.pools.logos = new ObjectPool(() => {
            const logo = document.createElement('div');
            logo.classList.add('dvd-logo-clone');
            logo.style.position = 'absolute';
            logo.style.display = 'flex';
            logo.style.alignItems = 'center';
            logo.style.justifyContent = 'center';
            logo.style.userSelect = 'none';
            logo.style.willChange = 'transform, left, top';
            
            // Crea e aggiungi l'SVG
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            svg.setAttribute('xml:space', 'preserve');
            svg.setAttribute('width', '263');
            svg.setAttribute('height', '117');
            svg.setAttribute('viewBox', '0 0 263 117');
            
            // Clona il contenuto SVG dal logo originale
            const originalSvg = document.querySelector('#dvd-logo svg');
            if (originalSvg) {
                svg.innerHTML = originalSvg.innerHTML;
            }
            
            logo.appendChild(svg);
            return logo;
        }, 5);
        
        // Inizializza il monitoraggio delle prestazioni
        if (this.settings.monitorPerformance) {
            this.initPerformanceMonitoring();
        }
        
        // Esponi funzioni pubbliche
        this.exposePublicFunctions();
    }
    
    // Crea un trail ottimizzato dall'object pool
    createTrail(x, y, width, height, color) {
        if (!this.settings.useObjectPools) {
            // Fallback al metodo standard di creazione trail
            return null;
        }
        
        // Ottieni un trail dal pool
        const trail = this.pools.trails.get();
        
        // Configura il trail
        trail.style.left = `${x}px`;
        trail.style.top = `${y}px`;
        trail.style.width = `${width}px`;
        trail.style.height = `${height}px`;
        trail.style.opacity = '0.5';
        
        // Inserisci SVG interno con il colore corretto
        const svgPath = trail.querySelector('g');
        if (svgPath) {
            svgPath.setAttribute('fill', color);
        }
        
        // Aggiungi al DOM
        document.getElementById('container').appendChild(trail);
        
        return trail;
    }
    
    // Rilascia un trail nell'object pool
    releaseTrail(trail) {
        if (!this.settings.useObjectPools) return;
        
        // Rimuovi dal DOM
        if (trail.parentNode) {
            trail.parentNode.removeChild(trail);
        }
        
        // Ripristina proprietà
        trail.style.opacity = '0';
        
        // Rilascia nel pool
        this.pools.trails.release(trail);
    }
    
    // Crea un logo DVD dall'object pool
    createLogo(x, y, width, height, color) {
        if (!this.settings.useObjectPools) {
            // Fallback al metodo standard
            return null;
        }
        
        // Ottieni un logo dal pool
        const logo = this.pools.logos.get();
        
        // Configura il logo
        logo.style.left = `${x}px`;
        logo.style.top = `${y}px`;
        logo.style.width = `${width}px`;
        logo.style.height = `${height}px`;
        
        // Imposta il colore
        const svgPath = logo.querySelector('g');
        if (svgPath) {
            svgPath.setAttribute('fill', color);
        }
        
        // Aggiungi al DOM
        document.getElementById('container').appendChild(logo);
        
        return logo;
    }
    
    // Rilascia un logo nell'object pool
    releaseLogo(logo) {
        if (!this.settings.useObjectPools) return;
        
        // Rimuovi dal DOM
        if (logo.parentNode) {
            logo.parentNode.removeChild(logo);
        }
        
        // Rilascia nel pool
        this.pools.logos.release(logo);
    }
    
    // Pianifica operazioni non critiche per l'esecuzione durante il tempo di inattività
    scheduleTask(task, priority = 'normal') {
        if (!this.settings.useRequestIdleCallback || !window.requestIdleCallback) {
            // Esegui immediatamente se requestIdleCallback non è supportato
            task();
            return;
        }
        
        // Aggiungi il task alla coda
        this.pendingTasks.push({ task, priority });
        
        // Pianifica l'esecuzione
        this.schedulePendingTasks();
    }
    
    // Pianifica l'esecuzione dei task in sospeso
    schedulePendingTasks() {
        if (this.pendingTasks.length === 0) return;
        
        window.requestIdleCallback((deadline) => {
            // Ordina i task per priorità
            this.pendingTasks.sort((a, b) => {
                const priorityValues = { high: 3, normal: 2, low: 1 };
                return priorityValues[b.priority] - priorityValues[a.priority];
            });
            
            // Esegui i task finché c'è tempo
            while (this.pendingTasks.length > 0 && deadline.timeRemaining() > 0) {
                const { task } = this.pendingTasks.shift();
                task();
            }
            
            // Se ci sono ancora task, pianifica un'altra esecuzione
            if (this.pendingTasks.length > 0) {
                this.schedulePendingTasks();
            }
        }, { timeout: 1000 }); // Timeout massimo di 1 secondo
    }
    
    // Inizializza il monitoraggio delle prestazioni
    initPerformanceMonitoring() {
        // Monitoraggio FPS avanzato
        let frameCount = 0;
        let lastTime = performance.now();
        let fps = 0;
        
        // Monitoraggio della memoria (solo per Chrome)
        const hasMemoryInfo = window.performance && window.performance.memory;
        
        const updatePerformanceStats = () => {
            const now = performance.now();
            frameCount++;
            
            if (now - lastTime >= 1000) {
                fps = Math.round((frameCount * 1000) / (now - lastTime));
                frameCount = 0;
                lastTime = now;
                
                // Aggiorna gli indicatori di performance
                const fpsValue = document.getElementById('fps-value');
                if (fpsValue) {
                    fpsValue.textContent = fps;
                    
                    // Cambia colore in base alle prestazioni
                    if (fps >= 55) {
                        fpsValue.style.color = '#4CAF50'; // Verde per FPS buoni
                    } else if (fps >= 30) {
                        fpsValue.style.color = '#FFC107'; // Giallo per FPS medi
                    } else {
                        fpsValue.style.color = '#F44336'; // Rosso per FPS bassi
                    }
                }
                
                // Registra metriche di memoria se disponibili
                if (hasMemoryInfo) {
                    const memory = performance.memory;
                    console.debug('Memoria utilizzata:', Math.round(memory.usedJSHeapSize / 1048576), 'MB');
                }
                
                // Registra statistiche degli object pool
                if (this.settings.useObjectPools) {
                    console.debug('Statistiche Object Pool:', {
                        trails: this.pools.trails.getStats(),
                        logos: this.pools.logos.getStats()
                    });
                }
            }
            
            requestAnimationFrame(updatePerformanceStats);
        };
        
        // Avvia il monitoraggio
        requestAnimationFrame(updatePerformanceStats);
    }
    
    // Espone funzioni pubbliche per l'utilizzo in altri script
    exposePublicFunctions() {
        window.performanceTools = {
            createTrail: (x, y, width, height, color) => this.createTrail(x, y, width, height, color),
            releaseTrail: (trail) => this.releaseTrail(trail),
            createLogo: (x, y, width, height, color) => this.createLogo(x, y, width, height, color),
            releaseLogo: (logo) => this.releaseLogo(logo),
            scheduleTask: (task, priority) => this.scheduleTask(task, priority)
        };
    }
}

// Inizializza il Performance Manager quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    window.perfManager = new PerformanceManager();
}); 