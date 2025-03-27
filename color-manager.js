/**
 * DVD Logo Bounce - Gestore Colori
 * Gestisce la personalizzazione dei colori e i temi predefiniti.
 */

// Temi predefiniti
const COLOR_THEMES = {
    classic: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3', '#FF00FF'],
    retrowave: ['#FF2975', '#6B15F7', '#00FFFF', '#FE9A00', '#7D5FFF', '#F11A7B', '#3F00FF', '#00FDFF'],
    pastello: ['#ABDEE6', '#CBAACB', '#FFFFB5', '#FFCCB6', '#F3B0C3', '#C6DBDA', '#FEE1E8', '#FED7C3'],
    neon: ['#FF00FF', '#00FFFF', '#FF9933', '#39FF14', '#FF3333', '#FFFF33', '#FF6EFF', '#00FF7F']
};

// Chiave per salvare i colori personalizzati
const CUSTOM_COLORS_KEY = 'dvd_bounce_custom_colors';

class ColorManager {
    constructor() {
        // Cache elementi DOM
        const $ = id => document.getElementById(id);
        this.colorsPanel = $('colors-panel');
        this.colorsPanelBtn = $('colors-btn');
        this.closePanelBtn = $('close-colors-panel');
        this.resetColorsBtn = $('reset-colors');
        this.themeButtons = document.querySelectorAll('.theme-btn');
        this.colorInputs = [];
        
        // Raccoglie tutti gli input dei colori
        for (let i = 1; i <= 8; i++) this.colorInputs.push($(`color${i}`));
        
        this.currentColors = [...COLOR_THEMES.classic]; // Default
        this.activeTheme = 'classic';
        
        // Carica i colori salvati e inizializza eventi
        this.loadSavedColors();
        this.initEventListeners();
    }
    
    // Carica colori salvati se esistono
    loadSavedColors() {
        try {
            const savedColors = localStorage.getItem(CUSTOM_COLORS_KEY);
            if (savedColors) {
                const colors = JSON.parse(savedColors);
                this.currentColors = colors.colors || [...COLOR_THEMES.classic];
                this.activeTheme = colors.theme || 'classic';
                
                this.updateColorInputs();
                this.updateActiveThemeButton();
                this.applyColorsToGame();
            } else {
                this.setTheme('classic');
            }
        } catch (error) {
            console.error('Errore nel caricamento dei colori personalizzati:', error);
            this.setTheme('classic');
        }
    }
    
    // Salva i colori personalizzati
    saveCustomColors() {
        try {
            const customColors = {
                colors: this.currentColors,
                theme: this.activeTheme,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(customColors));
            return true;
        } catch (error) {
            console.error('Errore nel salvataggio dei colori personalizzati:', error);
            return false;
        }
    }
    
    // Imposta un tema predefinito
    setTheme(themeName) {
        if (!COLOR_THEMES[themeName]) return false;
        
        this.currentColors = [...COLOR_THEMES[themeName]];
        this.activeTheme = themeName;
        
        // Aggiorna gli input di colore
        this.updateColorInputs();
        
        // Evidenzia il pulsante del tema attivo
        this.updateActiveThemeButton();
        
        // Applica i colori al gioco
        this.applyColorsToGame();
        
        // Cambia istantaneamente il colore del logo principale con un colore casuale dal tema
        const dvdPath = document.getElementById('dvd-path');
        if (dvdPath) {
            const randomColorIndex = Math.floor(Math.random() * this.currentColors.length);
            const randomColor = this.currentColors[randomColorIndex];
            
            dvdPath.style.transition = 'fill 0.3s ease';
            dvdPath.setAttribute('fill', randomColor);
            
            // Reset transition after color change
            setTimeout(() => {
                dvdPath.style.transition = '';
            }, 300);
        }
        
        // Salva le preferenze
        this.saveCustomColors();
        
        return true;
    }
    
    // Aggiorna gli input di colore in base ai colori attuali
    updateColorInputs() {
        this.colorInputs.forEach((input, index) => {
            if (this.currentColors[index]) input.value = this.currentColors[index];
        });
    }
    
    // Aggiorna l'evidenziazione del pulsante tema attivo
    updateActiveThemeButton() {
        this.themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === this.activeTheme);
        });
    }
    
    // Raccoglie i valori dei colori dagli input
    getColorsFromInputs() {
        return this.colorInputs.map(input => input.value);
    }
    
    // Applica i colori al gioco
    applyColorsToGame() {
        // Comunica con lo script principale per applicare i colori
        if (window.updateGameColors) {
            window.updateGameColors(this.currentColors);
        } else {
            // Fallback nel caso in cui la funzione non sia ancora disponibile
            window.COLORS = this.currentColors;
            // Aggiorna il colore attuale del logo
            const dvdPath = document.getElementById('dvd-path');
            if (dvdPath) {
                const colorIndex = Math.floor(Math.random() * this.currentColors.length);
                dvdPath.setAttribute('fill', this.currentColors[colorIndex]);
            }
        }
    }
    
    // Reimposta i colori al tema predefinito (classico)
    resetToDefault() {
        this.setTheme('classic');
        this.showToast('Colori reimpostati al tema classico');
    }
    
    // Mostra/nascondi il pannello dei colori
    toggleColorsPanel() {
        this.colorsPanel.classList.toggle('hidden');
    }
    
    // Mostra un messaggio toast
    showToast(message) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), 3000);
        }
    }
    
    // Applica il colore in tempo reale quando cambia un input
    handleColorChange(index, color) {
        this.currentColors[index] = color;
        this.activeTheme = 'custom';
        this.updateActiveThemeButton();
        this.applyColorsToGame();
        this.saveCustomColors();
        
        // Cambia istantaneamente il colore del logo principale
        const dvdPath = document.getElementById('dvd-path');
        if (dvdPath) {
            dvdPath.style.transition = 'fill 0.3s ease';
            dvdPath.setAttribute('fill', color);
            
            // Reset transition after color change
            setTimeout(() => {
                dvdPath.style.transition = '';
            }, 300);
        }
    }
    
    // Inizializza tutti gli event listener
    initEventListeners() {
        // Toggle del pannello
        this.colorsPanelBtn.addEventListener('click', () => this.toggleColorsPanel());
        this.closePanelBtn.addEventListener('click', () => this.toggleColorsPanel());
        
        // Pulsanti dei temi
        this.themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                if (theme) {
                    this.setTheme(theme);
                    this.showToast(`Tema ${theme} applicato`);
                }
            });
        });
        
        // Aggiunge listener per modifiche in tempo reale
        this.colorInputs.forEach((input, index) => {
            input.addEventListener('input', () => {
                this.handleColorChange(index, input.value);
            });
        });
        
        // Pulsante reset colori
        this.resetColorsBtn.addEventListener('click', () => this.resetToDefault());
    }
}

// Inizializza il gestore dei colori quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    window.colorManager = new ColorManager();
    
    // Espone la funzione per aggiornare i colori nel gioco
    window.updateGameColors = (colors) => {
        window.COLORS = colors;
    };
}); 