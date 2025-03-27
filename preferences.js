/**
 * DVD Logo Bounce - Gestore Preferenze
 * Gestisce il salvataggio e il caricamento delle preferenze dell'utente.
 */

class PreferenceManager {
    constructor() {
        // Chiave per il localStorage
        this.PREFS_KEY = 'dvd_bounce_preferences';
        
        // Valori predefiniti
        this.defaults = {
            speed: 2,
            size: 150,
            trail: false,
            multi: false,
            gravity: false,
            theme: 'dark'
        };
        
        // Inizializza le preferenze
        this.loadPreferences();
        
        // Inizializza la gestione del tema
        this.initThemeControl();
    }
    
    // Carica le preferenze dal localStorage o usa i valori predefiniti
    loadPreferences() {
        try {
            const savedPrefs = localStorage.getItem(this.PREFS_KEY);
            this.preferences = savedPrefs ? JSON.parse(savedPrefs) : {...this.defaults};
            
            // Assicurati che tutte le preferenze predefinite siano presenti
            for (const key in this.defaults) {
                if (this.preferences[key] === undefined) {
                    this.preferences[key] = this.defaults[key];
                }
            }
        } catch (error) {
            console.error('Errore nel caricamento delle preferenze:', error);
            this.preferences = {...this.defaults};
        }
        
        // Applica il tema iniziale
        this.applyTheme(this.preferences.theme);
    }
    
    // Salva le preferenze nel localStorage
    savePreferences() {
        try {
            localStorage.setItem(this.PREFS_KEY, JSON.stringify(this.preferences));
            return true;
        } catch (error) {
            console.error('Errore nel salvataggio delle preferenze:', error);
            return false;
        }
    }
    
    // Ottieni una preferenza specifica
    getPreference(key) {
        return this.preferences[key] !== undefined ? this.preferences[key] : this.defaults[key];
    }
    
    // Imposta una preferenza specifica
    setPreference(key, value) {
        this.preferences[key] = value;
        this.savePreferences();
        
        // Se la preferenza è il tema, applicalo
        if (key === 'theme') this.applyTheme(value);
    }
    
    // Reimposta tutte le preferenze ai valori predefiniti
    resetAllPreferences() {
        this.preferences = {...this.defaults};
        this.savePreferences();
        this.applyTheme(this.defaults.theme);
    }
    
    // Applica il tema all'interfaccia
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        const themeBtn = document.getElementById('theme-btn');
        if (themeBtn) {
            themeBtn.innerHTML = theme === 'light' 
                ? '<i class="fas fa-moon"></i>' 
                : '<i class="fas fa-sun"></i>';
            themeBtn.title = theme === 'light' ? 'Tema Scuro' : 'Tema Chiaro';
        }
        
        // Notifica altri componenti del cambio tema
        document.dispatchEvent(new CustomEvent('theme-changed', {detail: {theme}}));
    }
    
    // Inizializza il controllo del tema
    initThemeControl() {
        const themeBtn = document.getElementById('theme-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const currentTheme = this.getPreference('theme');
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                this.setPreference('theme', newTheme);
            });
        }
    }
}

// Esporta la classe per l'uso in altri script
window.PreferenceManager = PreferenceManager; 