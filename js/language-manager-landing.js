// Gestionnaire de langues pour la landing page
class LanguageManagerLanding {
    constructor() {
        this.currentLang = 'fr'; // Langue par défaut temporaire
        this.storageKey = 'app_language'; // MÊME clé que l'app pour synchronisation
        this.supportedLanguages = {
            fr: { name: 'Français', flag: '🇫🇷' },
            en: { name: 'English', flag: '🇬🇧' },
            zh: { name: '中文', flag: '🇨🇳' },
            ja: { name: '日本語', flag: '🇯🇵' }
        };
        
        this.init();
    }

    // Initialisation - DÉTECTION LANGUE NAVIGATEUR EN PRIORITÉ
    init() {
        // 1. PRIORITÉ : Langue sauvegardée dans localStorage (synchronisée avec l'app)
        const savedLang = localStorage.getItem(this.storageKey);
        
        if (savedLang && this.supportedLanguages[savedLang]) {
            this.currentLang = savedLang;
            console.log(`🌍 Landing: Langue chargée depuis localStorage: ${this.currentLang}`);
        } 
        // 2. Détecter la langue du navigateur
        else {
            const browserLang = navigator.language.split('-')[0]; // 'fr-FR' -> 'fr'
            
            if (this.supportedLanguages[browserLang]) {
                this.currentLang = browserLang;
                console.log(`🌍 Landing: Langue détectée du navigateur: ${this.currentLang}`);
            } else {
                // 3. Fallback : Français par défaut
                this.currentLang = 'fr';
                console.log(`🌍 Landing: Langue par défaut (français) appliquée`);
            }
            
            // Sauvegarder le choix initial
            localStorage.setItem(this.storageKey, this.currentLang);
        }
        
        console.log(`✅ Landing: Langue initialisée: ${this.currentLang}`);
    }

    // Obtenir la langue actuelle
    getCurrentLanguage() {
        return this.currentLang;
    }

    // Changer la langue
    setLanguage(langCode) {
        if (!this.supportedLanguages[langCode]) {
            console.warn(`⚠️ Langue non supportée: ${langCode}`);
            return false;
        }

        this.currentLang = langCode;
        
        // Sauvegarder dans localStorage (partagé avec l'app)
        localStorage.setItem(this.storageKey, langCode);
        
        console.log(`🌍 Landing: Langue changée: ${langCode}`);
        
        // Mettre à jour tous les sélecteurs de langue
        this.updateAllLanguageSelectors();
        
        // Appliquer les traductions
        this.updateUI();
        
        return true;
    }

    // Mettre à jour tous les sélecteurs de langue
    updateAllLanguageSelectors() {
        const allSelectors = document.querySelectorAll('.language-selector');
        allSelectors.forEach(container => {
            this.updateLanguageSelector(container);
        });
    }

    // Traduire une clé
    translate(key, params = {}) {
        // Récupérer la traduction dans la langue courante
        let translation = TRANSLATIONS_LANDING[this.currentLang]?.[key];
        
        // Si pas de traduction, fallback vers le français
        if (!translation) {
            console.warn(`⚠️ Traduction manquante pour "${key}" en ${this.currentLang}`);
            translation = TRANSLATIONS_LANDING['fr']?.[key] || key;
        }
        
        // Remplacer les paramètres {name}, {count}, etc.
        return translation.replace(/\{(\w+)\}/g, (match, param) => {
            return params[param] !== undefined ? params[param] : match;
        });
    }

    // Alias court pour translate
    t(key, params = {}) {
        return this.translate(key, params);
    }

    // Obtenir toutes les langues supportées
    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    // Obtenir les infos de la langue actuelle
    getCurrentLanguageInfo() {
        return this.supportedLanguages[this.currentLang];
    }

    // Créer le sélecteur de langue HTML
    createLanguageSelector() {
        const container = document.createElement('div');
        container.className = 'language-selector';
        container.innerHTML = `
            <button class="lang-btn" id="langBtn">
                <span class="lang-flag">${this.getCurrentLanguageInfo().flag}</span>
                <span class="lang-code">${this.currentLang.toUpperCase()}</span>
                <span class="lang-arrow">▼</span>
            </button>
            <div class="lang-dropdown" id="langDropdown" style="display: none;">
                ${Object.entries(this.supportedLanguages).map(([code, info]) => `
                    <button class="lang-option ${code === this.currentLang ? 'active' : ''}" data-lang="${code}">
                        <span class="lang-flag">${info.flag}</span>
                        <span class="lang-name">${info.name}</span>
                        ${code === this.currentLang ? '<span class="lang-check">✓</span>' : ''}
                    </button>
                `).join('')}
            </div>
        `;

        // Événements
        const langBtn = container.querySelector('#langBtn');
        const langDropdown = container.querySelector('#langDropdown');
        const langOptions = container.querySelectorAll('.lang-option');

        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = langDropdown.style.display === 'block';
            langDropdown.style.display = isVisible ? 'none' : 'block';
        });

        langOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const newLang = option.dataset.lang;
                
                if (this.setLanguage(newLang)) {
                    // L'interface est déjà mise à jour par setLanguage
                }
                
                langDropdown.style.display = 'none';
            });
        });

        // Fermer le dropdown si on clique ailleurs
        document.addEventListener('click', () => {
            langDropdown.style.display = 'none';
        });

        return container;
    }

    // Mettre à jour le sélecteur de langue
    updateLanguageSelector(container) {
        const langBtn = container.querySelector('.lang-btn');
        const langFlag = langBtn?.querySelector('.lang-flag');
        const langCode = langBtn?.querySelector('.lang-code');
        const langOptions = container.querySelectorAll('.lang-option');

        if (langFlag) langFlag.textContent = this.getCurrentLanguageInfo().flag;
        if (langCode) langCode.textContent = this.currentLang.toUpperCase();

        langOptions.forEach(option => {
            const optionLang = option.dataset.lang;
            const isActive = optionLang === this.currentLang;
            
            option.classList.toggle('active', isActive);
            
            const check = option.querySelector('.lang-check');
            if (check) {
                check.remove();
            }
            
            if (isActive) {
                const checkSpan = document.createElement('span');
                checkSpan.className = 'lang-check';
                checkSpan.textContent = '✓';
                option.appendChild(checkSpan);
            }
        });
    }

    // Mettre à jour toute l'interface avec les nouvelles traductions
    updateUI() {
        console.log(`🔄 Mise à jour UI landing avec langue: ${this.currentLang}`);
        
        // Mettre à jour les éléments avec data-i18n-landing
        document.querySelectorAll('[data-i18n-landing]').forEach(element => {
            const key = element.getAttribute('data-i18n-landing');
            const translatedText = this.t(key);
            element.textContent = translatedText;
        });

        // Mettre à jour les placeholders
        document.querySelectorAll('[data-i18n-landing-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-landing-placeholder');
            element.placeholder = this.t(key);
        });

        // Mettre à jour les href pour synchroniser avec l'app
        document.querySelectorAll('a[href="index.html"], a[href="./index.html"]').forEach(link => {
            // Pas besoin de paramètre, localStorage est partagé
            link.href = 'index.html';
        });

        console.log(`✅ Interface landing mise à jour avec la langue: ${this.currentLang}`);
    }

    // Injecter les styles CSS pour le sélecteur de langue
    injectStyles() {
        if (document.getElementById('language-selector-styles-landing')) return;
        
        const style = document.createElement('style');
        style.id = 'language-selector-styles-landing';
        style.textContent = `
            .language-selector {
                position: relative;
                display: inline-block;
            }

            .lang-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                border: 2px solid var(--gray-300);
                border-radius: 12px;
                background: white;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.3s ease;
                color: var(--gray-700);
            }

            .lang-btn:hover {
                border-color: var(--primary);
                background: rgba(139, 21, 56, 0.05);
                transform: translateY(-1px);
            }

            .lang-flag {
                font-size: 18px;
                line-height: 1;
            }

            .lang-code {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .lang-arrow {
                font-size: 10px;
                transition: transform 0.3s ease;
            }

            .lang-btn:hover .lang-arrow {
                transform: translateY(2px);
            }

            .lang-dropdown {
                position: absolute;
                top: calc(100% + 8px);
                right: 0;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                border: 1px solid var(--gray-200);
                min-width: 180px;
                z-index: 1000;
                animation: dropdownSlideIn 0.3s ease;
                overflow: hidden;
            }

            @keyframes dropdownSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .lang-option {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                border: none;
                background: white;
                cursor: pointer;
                width: 100%;
                text-align: left;
                transition: background 0.2s ease;
                color: var(--gray-700);
                font-size: 14px;
                font-weight: 500;
            }

            .lang-option:hover {
                background: rgba(139, 21, 56, 0.05);
            }

            .lang-option.active {
                background: linear-gradient(135deg, rgba(139, 21, 56, 0.1), rgba(245, 158, 11, 0.1));
                color: var(--primary);
                font-weight: 600;
            }

            .lang-option .lang-name {
                flex: 1;
            }

            .lang-check {
                color: var(--primary);
                font-weight: bold;
                font-size: 16px;
            }

            /* Responsive */
            @media (max-width: 480px) {
                .lang-btn {
                    padding: 6px 10px;
                    gap: 6px;
                }
                
                .lang-code {
                    display: none;
                }
                
                .lang-dropdown {
                    right: -10px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Fonction globale de traduction (raccourci)
window.tLanding = function(key, params = {}) {
    if (window.languageManagerLanding) {
        return window.languageManagerLanding.t(key, params);
    }
    return key;
};