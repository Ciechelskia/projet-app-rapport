// ============================================
// APP MANAGER - VERSION SUPABASE COMPLÈTE
// ============================================

class AppManager {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'login';
        this.audioManager = null;
        this.dataManager = null;
        this.profileManager = null;
        this.languageManager = null;
        
        this.initializeApp();
    }

    async initializeApp() {
        console.log('🚀 Initialisation de l\'application...');
        
        // Vérifier la configuration Supabase
        if (!window.supabaseClient) {
            console.error('❌ Supabase client non initialisé');
            this.showError('Erreur de configuration. Contactez l\'administrateur.');
            return;
        }

        // Initialiser les managers
        this.audioManager = new AudioManager();
        this.dataManager = new DataManager();
        this.profileManager = new ProfileManager(this);
        
        // Exposer les managers globalement pour faciliter les appels
        window.audioManager = this.audioManager;
        window.dataManager = this.dataManager;
        window.appManager = this;

        // Initialiser le gestionnaire de langue
        if (typeof LanguageManager !== 'undefined') {
            this.languageManager = new LanguageManager();
            console.log('✅ LanguageManager initialisé');
        }

        // Gérer la session Supabase
        await this.checkSession();

        // Bind des événements
        this.bindEvents();

        console.log('✅ Application initialisée avec succès');
    }

    // === GESTION DE LA SESSION ===

    async checkSession() {
        try {
            const { data: { session }, error } = await window.supabaseClient.auth.getSession();
            
            if (error) throw error;

            if (session) {
                console.log('✅ Session active détectée');
                await this.handleSuccessfulLogin(session.user);
            } else {
                console.log('ℹ️ Aucune session active');
                this.showPage('login');
            }
        } catch (error) {
            console.error('❌ Erreur vérification session:', error);
            this.showPage('login');
        }

        // Écouter les changements d'authentification
        window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
            console.log('🔄 Auth state changed:', event);
            
            if (event === 'SIGNED_IN' && session) {
                await this.handleSuccessfulLogin(session.user);
            } else if (event === 'SIGNED_OUT') {
                this.handleLogout();
            }
        });
    }

    // === BIND DES ÉVÉNEMENTS ===

    bindEvents() {
        // Login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Navigation
        const navBrouillon = document.getElementById('navBrouillon');
        const navRapports = document.getElementById('navRapports');
        const navProfil = document.getElementById('navProfil');
        const logoutBtn = document.getElementById('logoutBtn');

        if (navBrouillon) navBrouillon.addEventListener('click', () => this.showPage('brouillon'));
        if (navRapports) navRapports.addEventListener('click', () => this.showPage('rapports'));
        if (navProfil) navProfil.addEventListener('click', () => this.showPage('profil'));
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());

        // Recherche de rapports
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.dataManager.filterRapports(e.target.value);
            }, 300));
        }

        // Surveillance de la connexion réseau
        Utils.onNetworkChange((isOnline) => {
            if (isOnline) {
                Utils.showToast('✅ Connexion rétablie', 'success');
                this.syncData();
            } else {
                Utils.showToast(t('toast.network.offline'), 'warning');
            }
        });
    }

    // === GESTION DU LOGIN ===

    async handleLogin(event) {
        event.preventDefault();

        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const errorMessage = document.getElementById('errorMessage');
        const loadingMessage = document.getElementById('loadingMessage');
        const loginBtn = document.getElementById('loginBtn');

        const email = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            this.showError(t('login.error.empty'));
            return;
        }

        // Afficher le loading
        if (loginBtn) loginBtn.disabled = true;
        if (errorMessage) errorMessage.style.display = 'none';
        if (loadingMessage) loadingMessage.style.display = 'flex';

        try {
            console.log('🔐 Tentative de connexion...');

            // Connexion via Supabase Auth
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error('❌ Erreur Supabase Auth:', error);
                
                if (error.message.includes('Invalid login credentials')) {
                    throw new Error(t('login.error.wrongpass'));
                } else if (error.message.includes('Email not confirmed')) {
                    throw new Error('Email non confirmé. Vérifiez votre boîte mail.');
                } else {
                    throw new Error(error.message);
                }
            }

            if (!data.user) {
                throw new Error(t('login.error.notfound'));
            }

            console.log('✅ Authentification réussie');

            // Le onAuthStateChange gérera la suite automatiquement
            // Mais on peut aussi appeler directement :
            await this.handleSuccessfulLogin(data.user);

        } catch (error) {
            console.error('❌ Erreur login:', error);
            this.showError(error.message);
        } finally {
            if (loginBtn) loginBtn.disabled = false;
            if (loadingMessage) loadingMessage.style.display = 'none';
        }
    }

    async handleSuccessfulLogin(user) {
        console.log('✅ Login réussi pour:', user.email);

        try {
            // Récupérer le profil complet depuis la table profiles
            const { data: profile, error: profileError } = await window.supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;

            // Créer l'objet utilisateur complet
            this.currentUser = {
                id: user.id,
                email: user.email,
                username: user.email,
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                subscription_plan: profile.subscription_plan || 'free',
                subscription_status: profile.subscription_status || 'active',
                reports_this_month: profile.reports_this_month || 0,
                devices: profile.devices || [],
                created_at: profile.created_at
            };

            console.log('👤 Utilisateur actuel:', this.currentUser);

            // Enregistrer l'appareil
            await this.registerDevice(user.id);

            // Synchroniser les données depuis Supabase
            await this.syncData();

            // Charger le profil dans le ProfileManager
            if (this.profileManager) {
                await this.profileManager.loadProfile(user.id);
            }

            // Afficher l'interface principale
            this.showMainUI();

            // Message de bienvenue
            const displayName = this.currentUser.first_name 
                ? `${this.currentUser.first_name} ${this.currentUser.last_name}` 
                : this.currentUser.email;
            
            Utils.showToast(t('login.welcome', { name: displayName }), 'success');

        } catch (error) {
            console.error('❌ Erreur post-login:', error);
            this.showError('Erreur lors de la connexion. Veuillez réessayer.');
            await window.supabaseClient.auth.signOut();
        }
    }

    // === ENREGISTREMENT DE L'APPAREIL ===

    async registerDevice(userId) {
        try {
            const deviceId = Utils.generateDeviceId();
            console.log('📱 Enregistrement de l\'appareil:', deviceId.substring(0, 20) + '...');

            const { data: profile, error: fetchError } = await window.supabaseClient
                .from('profiles')
                .select('devices')
                .eq('id', userId)
                .single();

            if (fetchError) throw fetchError;

            let devices = profile.devices || [];
            
            // Vérifier si l'appareil existe déjà
            const existingDevice = devices.find(d => d.device_id === deviceId);
            
            if (!existingDevice) {
                const newDevice = {
                    device_id: deviceId,
                    connected_at: new Date().toISOString(),
                    last_used: new Date().toISOString()
                };

                devices.push(newDevice);

                // Limiter à 10 appareils (pour PRO, 2 pour FREE sera géré côté serveur)
                if (devices.length > 10) {
                    devices = devices.slice(-10);
                }

                const { error: updateError } = await window.supabaseClient
                    .from('profiles')
                    .update({ devices })
                    .eq('id', userId);

                if (updateError) throw updateError;

                console.log('✅ Appareil enregistré');
            } else {
                // Mettre à jour last_used
                existingDevice.last_used = new Date().toISOString();

                const { error: updateError } = await window.supabaseClient
                    .from('profiles')
                    .update({ devices })
                    .eq('id', userId);

                if (updateError) throw updateError;

                console.log('✅ Appareil mis à jour');
            }

        } catch (error) {
            console.error('❌ Erreur enregistrement appareil:', error);
        }
    }

    // === SYNCHRONISATION DES DONNÉES ===

    async syncData() {
        if (!Utils.isOnline()) {
            console.log('📴 Mode hors ligne - Pas de synchronisation');
            return;
        }

        try {
            console.log('🔄 Synchronisation des données...');
            await this.dataManager.syncFromSupabase();
            
            // Recharger l'affichage
            if (this.currentPage === 'brouillon') {
                this.dataManager.loadBrouillonsData();
            } else if (this.currentPage === 'rapports') {
                this.dataManager.loadRapportsData();
            }

            console.log('✅ Synchronisation terminée');
        } catch (error) {
            console.error('❌ Erreur synchronisation:', error);
        }
    }

    // === AFFICHAGE DE L'INTERFACE PRINCIPALE ===

    showMainUI() {
        const header = document.getElementById('header');
        const loginPage = document.getElementById('loginPage');

        if (header) header.style.display = 'flex';
        if (loginPage) loginPage.style.display = 'none';

        // Mettre à jour les infos utilisateur dans le header
        this.updateUserInfo();

        // Afficher la page Brouillons par défaut
        this.showPage('brouillon');
    }

    updateUserInfo() {
        const userNameElement = document.getElementById('userName');
        const userRoleElement = document.getElementById('userRole');
        const userAvatar = document.getElementById('userAvatar');

        if (this.currentUser) {
            const displayName = this.currentUser.first_name 
                ? `${this.currentUser.first_name} ${this.currentUser.last_name}` 
                : this.currentUser.email;

            if (userNameElement) {
                userNameElement.textContent = displayName;
            }

            if (userRoleElement) {
                const isPro = this.currentUser.subscription_plan === 'pro';
                userRoleElement.textContent = isPro ? '👑 PRO' : '🆓 FREE';
                userRoleElement.style.color = isPro ? '#FFD700' : '#666';
            }

            if (userAvatar) {
                const initial = this.currentUser.first_name 
                    ? this.currentUser.first_name.charAt(0).toUpperCase()
                    : this.currentUser.email.charAt(0).toUpperCase();
                userAvatar.textContent = initial;
            }
        }
    }

    // === NAVIGATION ENTRE LES PAGES ===

    showPage(pageName) {
        console.log('📄 Navigation vers:', pageName);

        const pages = ['loginPage', 'brouillonPage', 'rapportsPage', 'profilPage'];
        const navButtons = document.querySelectorAll('.nav-btn:not(.logout)');

        // Cacher toutes les pages
        pages.forEach(page => {
            const element = document.getElementById(page);
            if (element) {
                element.style.display = 'none';
            }
        });

        // Désactiver tous les boutons de navigation
        navButtons.forEach(btn => btn.classList.remove('active'));

        // Afficher la page demandée
        const targetPage = document.getElementById(pageName + 'Page');
        if (targetPage) {
            targetPage.style.display = 'block';
        }

        // Activer le bouton correspondant
        let activeButton = null;
        if (pageName === 'brouillon') {
            activeButton = document.getElementById('navBrouillon');
            this.dataManager.loadBrouillonsData();
        } else if (pageName === 'rapports') {
            activeButton = document.getElementById('navRapports');
            this.dataManager.loadRapportsData();
        } else if (pageName === 'profil') {
            activeButton = document.getElementById('navProfil');
            if (this.profileManager && this.currentUser) {
                this.profileManager.loadProfile(this.currentUser.id);
            }
        }

        if (activeButton) {
            activeButton.classList.add('active');
        }

        this.currentPage = pageName;
    }

    // === GESTION DU LOGOUT ===

    async logout() {
        try {
            console.log('🚪 Déconnexion...');

            // Déconnexion Supabase
            const { error } = await window.supabaseClient.auth.signOut();
            if (error) throw error;

            // Le onAuthStateChange gérera le reste
            this.handleLogout();

        } catch (error) {
            console.error('❌ Erreur logout:', error);
            // Forcer le logout même en cas d'erreur
            this.handleLogout();
        }
    }

    handleLogout() {
        console.log('👋 Logout effectué');

        // Réinitialiser l'état
        this.currentUser = null;
        this.currentPage = 'login';

        // Cacher le header
        const header = document.getElementById('header');
        if (header) header.style.display = 'none';

        // Afficher la page de login
        this.showPage('login');

        // Réinitialiser le formulaire
        const loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.reset();

        // Nettoyer les données locales (optionnel)
        // localStorage.clear();

        Utils.showToast('Déconnexion réussie', 'info');
    }

    // === AFFICHAGE DES ERREURS ===

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';

            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 5000);
        }

        Utils.showToast(message, 'error');
    }

    // === GETTERS ===

    getCurrentUser() {
        return this.currentUser;
    }

    getCurrentPage() {
        return this.currentPage;
    }

    getAudioManager() {
        return this.audioManager;
    }

    getDataManager() {
        return this.dataManager;
    }

    getProfileManager() {
        return this.profileManager;
    }

    // === MÉTHODES UTILITAIRES ===

    async checkIfUserIsPro() {
        if (!this.currentUser || !this.currentUser.id) {
            return false;
        }

        try {
            const { data: profile, error } = await window.supabaseClient
                .from('profiles')
                .select('subscription_plan')
                .eq('id', this.currentUser.id)
                .single();

            if (error) throw error;

            return profile.subscription_plan === 'pro';
        } catch (error) {
            console.error('❌ Erreur vérification plan:', error);
            return false;
        }
    }

    async refreshUserData() {
        if (!this.currentUser || !this.currentUser.id) {
            return;
        }

        try {
            const { data: profile, error } = await window.supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (error) throw error;

            // Mettre à jour les données locales
            this.currentUser = {
                ...this.currentUser,
                subscription_plan: profile.subscription_plan,
                subscription_status: profile.subscription_status,
                reports_this_month: profile.reports_this_month,
                devices: profile.devices
            };

            // Mettre à jour l'UI
            this.updateUserInfo();

            // Recharger le profil si on est sur la page profil
            if (this.currentPage === 'profil' && this.profileManager) {
                await this.profileManager.loadProfile(this.currentUser.id);
            }

            console.log('✅ Données utilisateur rafraîchies');
        } catch (error) {
            console.error('❌ Erreur rafraîchissement données:', error);
        }
    }
}

// ============================================
// INITIALISATION DE L'APPLICATION
// ============================================

let app;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 DOM loaded - Démarrage de l\'application...');
    
    // Attendre que Supabase soit initialisé
    if (window.supabaseClient) {
        app = new AppManager();
        window.app = app;
    } else {
        console.error('❌ Supabase client non disponible');
        
        // Réessayer après un court délai
        setTimeout(() => {
            if (window.supabaseClient) {
                app = new AppManager();
                window.app = app;
            } else {
                alert('Erreur critique: Impossible de se connecter au serveur. Veuillez recharger la page.');
            }
        }, 1000);
    }
});

// ============================================
// GESTION DES ERREURS GLOBALES
// ============================================

window.addEventListener('error', (event) => {
    console.error('❌ Erreur globale:', event.error);
    
    // Ne pas afficher les erreurs de chargement de ressources
    if (event.message && event.message.includes('Script error')) {
        return;
    }
    
    // Afficher une erreur user-friendly
    if (window.app) {
        Utils.showToast(t('toast.error.unexpected'), 'error');
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rejetée:', event.reason);
    
    if (window.app) {
        Utils.showToast(t('toast.error.unexpected'), 'error');
    }
});

// ============================================
// GESTION DU BEFOREUNLOAD (sauvegarde avant fermeture)
// ============================================

window.addEventListener('beforeunload', (event) => {
    // Sauvegarder les données locales si nécessaire
    if (window.dataManager && window.audioManager) {
        const hasUnsavedAudio = window.audioManager.hasAudioReady();
        
        if (hasUnsavedAudio) {
            event.preventDefault();
            event.returnValue = 'Vous avez un enregistrement non sauvegardé. Voulez-vous vraiment quitter ?';
            return event.returnValue;
        }
    }
});

// ============================================
// GESTION DU RETOUR STRIPE (SUCCESS/CANCEL)
// ============================================

window.addEventListener('load', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const status = urlParams.get('status');

    if (sessionId && status === 'success') {
        console.log('✅ Paiement Stripe réussi');
        
        // Attendre que l'app soit initialisée
        const waitForApp = setInterval(async () => {
            if (window.app && window.app.currentUser) {
                clearInterval(waitForApp);
                
                Utils.showToast('🎉 Bienvenue dans le plan PRO ! Profitez de toutes les fonctionnalités.', 'success', 5000);
                
                // Rafraîchir les données utilisateur
                await window.app.refreshUserData();
                
                // Synchroniser les données
                await window.app.syncData();
                
                // Nettoyer l'URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }, 500);
        
        // Timeout après 10 secondes
        setTimeout(() => {
            clearInterval(waitForApp);
        }, 10000);
    }

    if (status === 'cancel') {
        console.log('❌ Paiement Stripe annulé');
        Utils.showToast('Paiement annulé. Vous pouvez réessayer quand vous voulez.', 'info');
        
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});