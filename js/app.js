// Application principale - Gestion de l'authentification et navigation
class AppManager {
    constructor() {
        this.currentUser = null;
        this.currentPage = PAGES.LOGIN;
        
        // Initialisation des managers
        this.audioManager = new AudioManager();
        this.dataManager = new DataManager();
        this.profileManager = null; // Sera créé au besoin
        
        // Initialiser le gestionnaire de langues
        window.languageManager = new LanguageManager();
        this.languageManager = window.languageManager;
        
        // Exposition globale pour les événements
        window.dataManager = this.dataManager;
        window.app = this;
        
        this.initializeApp();
        this.bindEvents();
    }

    // === INITIALISATION ===

    initializeApp() {
        this.logout();
        this.showPage(PAGES.LOGIN);
        
        // Ajouter les styles CSS pour les animations toast
        this.addToastStyles();
        
        // IMPORTANT : Initialiser la langue AVANT tout le reste
        console.log('🔄 Initialisation de la langue...');
        this.languageManager.init();
        console.log('✅ Langue initialisée:', this.languageManager.getCurrentLanguage());
        
        // Injecter les styles du sélecteur de langue
        this.languageManager.injectStyles();
        
        // Créer et insérer les sélecteurs de langue (login + header)
        this.initLanguageSelector();
        
        // Mettre à jour l'interface avec la langue détectée
        this.languageManager.updateUI();
        
        // Écouter les changements de langue
        window.addEventListener('languageChanged', (e) => {
            this.onLanguageChanged(e.detail.language);
        });
        
        // Initialiser Supabase si disponible
        if (typeof initSupabase === 'function') {
            initSupabase();
        }
    }

    // Initialiser les sélecteurs de langue (login ET header)
    initLanguageSelector() {
        // Sélecteur dans le header (après connexion)
        const headerContainer = document.getElementById('languageSelectorContainer');
        if (headerContainer) {
            const headerSelector = this.languageManager.createLanguageSelector();
            headerContainer.appendChild(headerSelector);
        }
        
        // Sélecteur sur la page de login (avant connexion)
        const loginContainer = document.getElementById('loginLanguageSelector');
        if (loginContainer) {
            const loginSelector = this.languageManager.createLanguageSelector();
            loginContainer.appendChild(loginSelector);
        }
    }

    // Gérer le changement de langue
    onLanguageChanged(newLang) {
        console.log(`🌍 Changement de langue détecté: ${newLang}`);
        
        // Mettre à jour toute l'interface
        this.languageManager.updateUI();
        
        // Recharger les données avec les nouvelles traductions
        if (this.currentPage === PAGES.BROUILLON) {
            this.loadBrouillonsData();
        } else if (this.currentPage === PAGES.RAPPORTS) {
            this.loadRapportsData();
        } else if (this.currentPage === PAGES.PROFIL) {
            this.loadProfilData();
        }
        
        // Mettre à jour le titre de la page
        document.title = t('app.title');
    }

    addToastStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        // Login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Navigation
        this.bindNavigationEvents();

        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.dataManager.filterRapports(e.target.value);
            }, 300));
        }
    }

    bindNavigationEvents() {
        const navBrouillon = document.getElementById('navBrouillon');
        const navRapports = document.getElementById('navRapports');
        const navProfil = document.getElementById('navProfil');
        const logoutBtn = document.getElementById('logoutBtn');

        if (navBrouillon) {
            navBrouillon.addEventListener('click', () => {
                this.showPage(PAGES.BROUILLON);
            });
        }

        if (navRapports) {
            navRapports.addEventListener('click', () => {
                this.showPage(PAGES.RAPPORTS);
            });
        }

        if (navProfil) {
            navProfil.addEventListener('click', () => {
                this.showPage(PAGES.PROFIL);
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    // === GESTION DES PAGES ===

    showPage(pageId) {
        // Masquer toutes les pages
        ['loginPage', 'brouillonPage', 'rapportsPage', 'profilPage'].forEach(id => {
            const page = document.getElementById(id);
            if (page) page.style.display = 'none';
        });

        // Afficher la page demandée
        if (pageId === 'loginPage' && !this.currentUser) {
            const loginPage = document.getElementById('loginPage');
            if (loginPage) loginPage.style.display = 'block';
            const header = document.getElementById('header');
            if (header) header.style.display = 'none';
        } else if (this.currentUser) {
            const targetPage = document.getElementById(pageId);
            if (targetPage) targetPage.style.display = 'block';
            const header = document.getElementById('header');
            if (header) header.style.display = 'flex';
        }

        this.currentPage = pageId;
        this.updateNavigation();
        
        // Chargement des données selon la page
        if (pageId === PAGES.BROUILLON) {
            this.loadBrouillonsData();
        } else if (pageId === PAGES.RAPPORTS) {
            this.loadRapportsData();
        } else if (pageId === PAGES.PROFIL) {
            this.loadProfilData();
        }
    }

    updateNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        if (this.currentPage === PAGES.BROUILLON) {
            const navBrouillon = document.getElementById('navBrouillon');
            if (navBrouillon) navBrouillon.classList.add('active');
        } else if (this.currentPage === PAGES.RAPPORTS) {
            const navRapports = document.getElementById('navRapports');
            if (navRapports) navRapports.classList.add('active');
        } else if (this.currentPage === PAGES.PROFIL) {
            const navProfil = document.getElementById('navProfil');
            if (navProfil) navProfil.classList.add('active');
        }
    }

    // === AUTHENTIFICATION SUPABASE ===

    async handleLogin() {
        const usernameEl = document.getElementById('username');
        const passwordEl = document.getElementById('password');
        const errorDiv = document.getElementById('errorMessage');
        const loadingDiv = document.getElementById('loadingMessage');
        const loginBtn = document.getElementById('loginBtn');

        if (!usernameEl || !passwordEl) return;

        const emailOrUsername = usernameEl.value.trim();
        const password = passwordEl.value.trim();

        // Validation
        if (!emailOrUsername || !password) {
            this.showError(t('login.error.empty'));
            return;
        }

        // Reset UI
        if (errorDiv) errorDiv.style.display = 'none';
        if (loadingDiv) loadingDiv.style.display = 'block';
        if (loginBtn) loginBtn.disabled = true;

        try {
            console.log('🔐 Connexion avec Supabase Auth...');

            // Vérifier que Supabase est initialisé
            if (!window.supabaseClient) {
                throw new Error('Supabase non initialisé');
            }

            // 1. Connexion avec Supabase Auth
            const { data: authData, error: authError } = await window.supabaseClient.auth.signInWithPassword({
                email: emailOrUsername,
                password: password
            });

            if (authError) {
                console.error('❌ Erreur auth:', authError);
                
                if (authError.message.includes('Invalid login credentials')) {
                    throw new Error(t('login.error.wrongpass'));
                }
                
                if (authError.message.includes('Email not confirmed')) {
                    throw new Error('Email non confirmé. Vérifiez votre boîte mail.');
                }
                
                throw new Error(authError.message);
            }

            console.log('✅ Authentification réussie:', authData);

            // 2. Récupérer le profil depuis la table profiles
            console.log('🔍 Récupération du profil pour user ID:', authData.user.id);

            const { data: profile, error: profileError } = await window.supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (profileError) {
                console.error('❌ Erreur récupération profil:', profileError);
                console.error('❌ Détails erreur:', {
                    message: profileError.message,
                    details: profileError.details,
                    hint: profileError.hint,
                    code: profileError.code
                });
                
                if (profileError.code === 'PGRST116') {
                    throw new Error('Votre profil n\'existe pas. Veuillez vous réinscrire.');
                }
                
                throw new Error(`Impossible de récupérer votre profil: ${profileError.message}`);
            }

            console.log('✅ Profil chargé:', profile);

            // 3. Vérifier Device ID (2 appareils max)
            const deviceId = Utils.generateDeviceId();
            let deviceIds = profile.device_ids || [];

            // Si l'appareil n'est pas enregistré
            if (!deviceIds.includes(deviceId)) {
                // Si limite atteinte (2 appareils max)
                if (deviceIds.length >= 2) {
                    throw new Error(t('login.error.device.limit'));
                }

                // Ajouter le nouvel appareil
                deviceIds.push(deviceId);

                // Mettre à jour dans Supabase
                const { error: updateError } = await window.supabaseClient
                    .from('profiles')
                    .update({ device_ids: deviceIds })
                    .eq('id', authData.user.id);

                if (updateError) {
                    console.error('❌ Erreur mise à jour devices:', updateError);
                } else {
                    console.log(`✅ Device ${deviceIds.length}/2 enregistré`);
                }
            } else {
                console.log(`✅ Device déjà enregistré (${deviceIds.indexOf(deviceId) + 1}/2)`);
            }

            // 4. Créer l'objet utilisateur pour l'app
            this.currentUser = {
                id: authData.user.id,
                email: authData.user.email,
                nom: `${profile.first_name} ${profile.last_name}`,
                first_name: profile.first_name,
                last_name: profile.last_name,
                role: 'commercial', // Par défaut
                subscription_plan: profile.subscription_plan,
                reports_this_month: profile.reports_this_month,
                deviceId: JSON.stringify(deviceIds),
                loginTime: new Date().toISOString()
            };

            // 5. Afficher l'interface
            this.updateUserInterface();
            this.showPage(PAGES.BROUILLON);
            Utils.showToast(t('login.welcome', { name: profile.first_name }), 'success');

        } catch (error) {
            console.error('❌ Erreur lors de la connexion:', error);
            this.showError(error.message);
        } finally {
            if (loadingDiv) loadingDiv.style.display = 'none';
            if (loginBtn) loginBtn.disabled = false;
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    updateUserInterface() {
        if (this.currentUser) {
            const userNameEl = document.getElementById('userName');
            const userAvatarEl = document.getElementById('userAvatar');
            const userRoleEl = document.getElementById('userRole');
            
            if (userNameEl) userNameEl.textContent = this.currentUser.nom;
            if (userAvatarEl) {
                const initials = this.currentUser.nom.split(' ').map(n => n[0]).join('').substring(0, 2);
                userAvatarEl.textContent = initials;
            }
            
            // Rôle traduit avec compteur d'appareils
            if (userRoleEl) {
                const roleKey = `role.${this.currentUser.role}`;
                let devices = [];
                try {
                    devices = JSON.parse(this.currentUser.deviceId || '[]');
                } catch (e) {
                    devices = this.currentUser.deviceId ? [this.currentUser.deviceId] : [];
                }
                userRoleEl.textContent = `${t(roleKey)} (${devices.length}/2 📱)`;
            }
            
            // Forcer la mise à jour du sélecteur de langue dans le header
            if (this.languageManager) {
                this.languageManager.updateAllLanguageSelectors();
            }
        }
    }

    async logout() {
        // Déconnexion Supabase
        if (window.supabaseClient) {
            try {
                await window.supabaseClient.auth.signOut();
                console.log('✅ Déconnexion Supabase');
            } catch (error) {
                console.error('❌ Erreur déconnexion:', error);
            }
        }
        
        this.currentUser = null;
        
        // Reset audio manager
        if (this.audioManager) {
            this.audioManager.resetRecording();
        }
        
        // Reset formulaire
        const loginForm = document.getElementById('loginForm');
        const errorMessage = document.getElementById('errorMessage');
        const loadingMessage = document.getElementById('loadingMessage');
        
        if (loginForm) loginForm.reset();
        if (errorMessage) errorMessage.style.display = 'none';
        if (loadingMessage) loadingMessage.style.display = 'none';
        
        this.showPage(PAGES.LOGIN);
    }

    // === CHARGEMENT DES DONNÉES ===

    loadBrouillonsData() {
        const brouillons = this.dataManager.getBrouillons();
        this.dataManager.updateBrouillonsUI(brouillons);
    }

    loadRapportsData() {
        const rapports = this.dataManager.getRapports();
        this.dataManager.updateRapportsUI(rapports);
    }

    async loadProfilData() {
        if (!this.currentUser) return;
        
        // Créer le ProfileManager si inexistant
        if (!this.profileManager) {
            this.profileManager = new ProfileManager();
            
            // Binder les événements
            const saveBtn = document.getElementById('saveProfileBtn');
            const upgradeBtn = document.getElementById('upgradeBtn');
            const deleteBtn = document.getElementById('deleteAccountBtn');
            
            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    this.profileManager.saveProfile();
                });
            }
            
            if (upgradeBtn) {
                upgradeBtn.addEventListener('click', () => {
                    this.profileManager.handleUpgrade();
                });
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    this.profileManager.deleteAccount();
                });
            }
        }
        
        // Charger le profil
        await this.profileManager.loadProfile(this.currentUser.id);
    }

    // === MÉTHODES PUBLIQUES ===

    getCurrentUser() {
        return this.currentUser;
    }

    getDataManager() {
        return this.dataManager;
    }

    getAudioManager() {
        return this.audioManager;
    }

    // Redirection pour compatibilité
    editBrouillon(id) { return this.dataManager.editBrouillon(id); }
    validateBrouillon(id) { return this.dataManager.validateBrouillon(id); }
    deleteBrouillon(id) { return this.dataManager.deleteBrouillon(id); }
    saveEditedBrouillon(id, btn) { return this.dataManager.saveEditedBrouillon(id, btn); }
    viewRapport(id) { return this.dataManager.viewRapport(id); }
    shareRapport(id) { return this.dataManager.shareRapport(id); }
    exportRapport(id) { return this.dataManager.exportRapport(id); }
    downloadPDF(id) { return this.dataManager.downloadPDF(id); }
}

// === INITIALISATION ===

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    // Vérification des dépendances
    if (typeof CONFIG === 'undefined') {
        console.error('❌ CONFIG non défini. Vérifiez que config.js est chargé.');
        return;
    }

    if (typeof Utils === 'undefined') {
        console.error('❌ Utils non défini. Vérifiez que utils.js est chargé.');
        return;
    }

    if (typeof TRANSLATIONS === 'undefined') {
        console.error('❌ TRANSLATIONS non défini. Vérifiez que translations.js est chargé.');
        return;
    }

    if (typeof LanguageManager === 'undefined') {
        console.error('❌ LanguageManager non défini. Vérifiez que language-manager.js est chargé.');
        return;
    }

    // Initialisation de l'app
    try {
        window.appManager = new AppManager();
        console.log('✅ Application initialisée avec succès (Mode Supabase Auth)');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
    }
});

// Nettoyage lors de la fermeture
window.addEventListener('beforeunload', function() {
    if (window.appManager && window.appManager.audioManager) {
        window.appManager.audioManager.stopAudioStream();
    }
});

// Gestion des erreurs globales
window.addEventListener('error', function(event) {
    console.error('❌ Erreur globale:', event.error);
    
    if (typeof Utils !== 'undefined' && typeof t === 'function') {
        Utils.showToast(t('toast.error.unexpected'), 'error');
    }
});

// Exposition globale pour les événements onclick (compatibilité)
window.editBrouillon = function(id) { 
    if (window.dataManager) window.dataManager.editBrouillon(id); 
};
window.validateBrouillon = function(id) { 
    if (window.dataManager) window.dataManager.validateBrouillon(id); 
};
window.deleteBrouillon = function(id) { 
    if (window.dataManager) window.dataManager.deleteBrouillon(id); 
};
window.saveEditedBrouillon = function(id, btn) { 
    if (window.dataManager) window.dataManager.saveEditedBrouillon(id, btn); 
};
window.viewRapport = function(id) { 
    if (window.dataManager) window.dataManager.viewRapport(id); 
};
window.shareRapport = function(id) { 
    if (window.dataManager) window.dataManager.shareRapport(id); 
};
window.exportRapport = function(id) { 
    if (window.dataManager) window.dataManager.exportRapport(id); 
};
window.downloadPDF = function(id) { 
    if (window.dataManager) window.dataManager.downloadPDF(id); 
};