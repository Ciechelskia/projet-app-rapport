// Application principale - Gestion de l'authentification et navigation
class AppManager {
    constructor() {
        this.currentUser = null;
        this.currentPage = PAGES.LOGIN;
        
        // Initialisation des managers
        this.audioManager = new AudioManager();
        this.dataManager = new DataManager();
        this.profileManager = null;
        
        // Initialiser le gestionnaire de langues
        window.languageManager = new LanguageManager();
        this.languageManager = window.languageManager;
        
        // Exposition globale pour les événements
        window.dataManager = this.dataManager;
        window.app = this;
        
        // Appeler initializeApp de manière asynchrone
        this.initializeApp().catch(error => {
            console.error('❌ Erreur initialisation:', error);
        });
        this.bindEvents();
    }

    // === INITIALISATION ===
    async initializeApp() {
        console.log('🔄 Vérification session existante...');
        
        // Attendre que Supabase soit initialisé
        const supabaseReady = await this.waitForSupabase();
        
        if (supabaseReady && window.supabaseClient) {
            try {
                const { data: { session }, error } = await window.supabaseClient.auth.getSession();
                
                if (!error && session) {
                    console.log('✅ SESSION ACTIVE DÉTECTÉE:', session.user.email);
                    await this.restoreUserSession(session);
                    return;
                } else {
                    console.log('ℹ️ Aucune session active');
                }
            } catch (error) {
                console.error('❌ Erreur vérification session:', error);
            }
        }
        
        // Pas de session = initialisation normale
        this.logout();
        this.showPage(PAGES.LOGIN);
        
        this.addToastStyles();
        
        console.log('🔄 Initialisation de la langue...');
        this.languageManager.init();
        console.log('✅ Langue initialisée:', this.languageManager.getCurrentLanguage());
        
        this.languageManager.injectStyles();
        this.initLanguageSelector();
        this.languageManager.updateUI();
        
        window.addEventListener('languageChanged', (e) => {
            this.onLanguageChanged(e.detail.language);
        });
        
        if (typeof initSupabase === 'function') {
            initSupabase();
        }
    }

    initLanguageSelector() {
        const headerContainer = document.getElementById('languageSelectorContainer');
        if (headerContainer) {
            const headerSelector = this.languageManager.createLanguageSelector();
            headerContainer.appendChild(headerSelector);
        }
        
        const loginContainer = document.getElementById('loginLanguageSelector');
        if (loginContainer) {
            const loginSelector = this.languageManager.createLanguageSelector();
            loginContainer.appendChild(loginSelector);
        }
    }

    onLanguageChanged(newLang) {
        console.log('🌍 Changement de langue détecté:', newLang);
        
        this.languageManager.updateUI();
        
        if (this.currentPage === PAGES.BROUILLON) {
            this.loadBrouillonsData();
        } else if (this.currentPage === PAGES.RAPPORTS) {
            this.loadRapportsData();
        } else if (this.currentPage === PAGES.PROFIL) {
            this.loadProfilData();
        }
        
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

    async waitForSupabase(maxAttempts = 50) {
        let attempts = 0;
        while (!window.supabaseClient && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        return window.supabaseClient !== undefined;
    }

    async restoreUserSession(session) {
        try {
            console.log('🔄 Restauration de la session utilisateur...');
            
            // ✅ NOUVEAU : Vérifier si on revient d'un paiement Stripe AVANT de charger le profil
            const paymentSuccess = sessionStorage.getItem('stripe_payment_success');
            
            if (paymentSuccess === 'true') {
                console.log('🎉 Retour après paiement Stripe détecté !');
                console.log('🔄 Rechargement du profil depuis Supabase...');
                
                // Nettoyer les flags
                sessionStorage.removeItem('stripe_payment_success');
                sessionStorage.removeItem('stripe_session_id');
                
                // Attendre un peu pour s'assurer que Supabase est prêt
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            const { data: profile, error: profileError } = await window.supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            
            if (profileError) {
                console.error('❌ Erreur récupération profil:', profileError);
                this.logout();
                return;
            }
            
            console.log('✅ Profil restauré:', profile);
            
            const deviceId = Utils.generateDeviceId();
            let deviceIds = profile.device_ids || [];
            
            this.currentUser = {
                id: session.user.id,
                email: session.user.email,
                nom: profile.first_name + ' ' + profile.last_name,
                first_name: profile.first_name,
                last_name: profile.last_name,
                role: 'commercial',
                subscription_plan: profile.subscription_plan,
                reports_this_month: profile.reports_this_month,
                deviceId: JSON.stringify(deviceIds),
                loginTime: new Date().toISOString()
            };
            
            this.addToastStyles();
            this.languageManager.init();
            this.languageManager.injectStyles();
            this.initLanguageSelector();
            this.languageManager.updateUI();
            
            window.addEventListener('languageChanged', (e) => {
                this.onLanguageChanged(e.detail.language);
            });
            
            this.updateUserInterface();
            
            await this.dataManager.syncFromSupabase();
            
            // ✅ NOUVEAU : Si retour Stripe, aller directement au profil avec notification
            if (paymentSuccess === 'true') {
                console.log('🎊 Affichage du profil après paiement réussi');
                this.showPage(PAGES.PROFIL);
                
                // Afficher la notification de succès
                setTimeout(() => {
                    Utils.showToast('🎉 Bienvenue dans le plan PRO ! Votre compte a été mis à jour.', 'success', 5000);
                }, 800);
                
                // Recharger le profil pour afficher les nouvelles données
                setTimeout(async () => {
                    if (this.profileManager) {
                        await this.profileManager.loadProfile(this.currentUser.id);
                    }
                }, 1500);
            } else {
                this.showPage(PAGES.BROUILLON);
            }
            
            console.log('✅ Session restaurée avec succès');
            
        } catch (error) {
            console.error('❌ Erreur restauration session:', error);
            this.logout();
        }
    }

    bindEvents() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        this.bindNavigationEvents();

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

    showPage(pageId) {
        const pages = ['loginPage', 'brouillonPage', 'rapportsPage', 'profilPage'];
        pages.forEach(id => {
            const page = document.getElementById(id);
            if (page) page.style.display = 'none';
        });

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

    async handleLogin() {
        const usernameEl = document.getElementById('username');
        const passwordEl = document.getElementById('password');
        const errorDiv = document.getElementById('errorMessage');
        const loadingDiv = document.getElementById('loadingMessage');
        const loginBtn = document.getElementById('loginBtn');

        if (!usernameEl || !passwordEl) return;

        const emailOrUsername = usernameEl.value.trim();
        const password = passwordEl.value.trim();

        if (!emailOrUsername || !password) {
            this.showError(t('login.error.empty'));
            return;
        }

        if (errorDiv) errorDiv.style.display = 'none';
        if (loadingDiv) loadingDiv.style.display = 'block';
        if (loginBtn) loginBtn.disabled = true;

        try {
            console.log('🔐 Connexion avec Supabase Auth...');

            if (!window.supabaseClient) {
                throw new Error('Supabase non initialisé');
            }

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

            console.log('🔍 Récupération du profil pour user ID:', authData.user.id);

            const { data: profile, error: profileError } = await window.supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (profileError) {
                console.error('❌ Erreur récupération profil:', profileError);
                
                if (profileError.code === 'PGRST116') {
                    throw new Error('Votre profil n\'existe pas. Veuillez vous réinscrire.');
                }
                
                throw new Error('Impossible de récupérer votre profil: ' + profileError.message);
            }

            console.log('✅ Profil chargé:', profile);

            if (profile.subscription_plan === 'free' && profile.last_reset_date) {
                const lastReset = new Date(profile.last_reset_date);
                const now = new Date();
                const daysSinceReset = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24));
                
                console.log('📅 Dernier reset: ' + lastReset.toLocaleDateString() + ' (il y a ' + daysSinceReset + ' jours)');
                
                if (daysSinceReset >= 30) {
                    console.log('🔄 Reset du compteur (30 jours écoulés)...');
                    
                    try {
                        const { data: resetResult, error: resetError } = await window.supabaseClient
                            .rpc('check_and_reset_user_reports', { user_id: authData.user.id });
                        
                        if (resetError) {
                            console.error('❌ Erreur reset compteur:', resetError);
                        } else {
                            console.log('✅ Compteur réinitialisé avec succès !');
                            
                            const { data: updatedProfile, error: reloadError } = await window.supabaseClient
                                .from('profiles')
                                .select('*')
                                .eq('id', authData.user.id)
                                .single();
                            
                            if (!reloadError && updatedProfile) {
                                profile.reports_this_month = updatedProfile.reports_this_month;
                                profile.last_reset_date = updatedProfile.last_reset_date;
                                
                                Utils.showToast('🎉 Nouveau mois ! Votre compteur a été réinitialisé. Vous avez 5 nouveaux rapports disponibles.', 'success', 6000);
                            }
                        }
                    } catch (error) {
                        console.error('❌ Exception lors du reset:', error);
                    }
                } else {
                    console.log('ℹ️ Pas de reset nécessaire (' + daysSinceReset + '/30 jours)');
                }
            }

            const deviceId = Utils.generateDeviceId();
            let deviceIds = profile.device_ids || [];

            if (!deviceIds.includes(deviceId)) {
                if (deviceIds.length >= 2) {
                    throw new Error(t('login.error.device.limit'));
                }

                deviceIds.push(deviceId);

                const { error: updateError } = await window.supabaseClient
                    .from('profiles')
                    .update({ device_ids: deviceIds })
                    .eq('id', authData.user.id);

                if (updateError) {
                    console.error('❌ Erreur mise à jour devices:', updateError);
                } else {
                    console.log('✅ Device ' + deviceIds.length + '/2 enregistré');
                }
            } else {
                console.log('✅ Device déjà enregistré (' + (deviceIds.indexOf(deviceId) + 1) + '/2)');
            }

            this.currentUser = {
                id: authData.user.id,
                email: authData.user.email,
                nom: profile.first_name + ' ' + profile.last_name,
                first_name: profile.first_name,
                last_name: profile.last_name,
                role: 'commercial',
                subscription_plan: profile.subscription_plan,
                reports_this_month: profile.reports_this_month,
                deviceId: JSON.stringify(deviceIds),
                loginTime: new Date().toISOString()
            };

            this.updateUserInterface();
            this.showPage(PAGES.BROUILLON);

            await this.dataManager.syncFromSupabase();
            
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
            
            if (userRoleEl) {
                const roleKey = 'role.' + this.currentUser.role;
                let devices = [];
                try {
                    devices = JSON.parse(this.currentUser.deviceId || '[]');
                } catch (e) {
                    devices = this.currentUser.deviceId ? [this.currentUser.deviceId] : [];
                }
                userRoleEl.textContent = t(roleKey) + ' (' + devices.length + '/2 📱)';
            }
            
            if (this.languageManager) {
                this.languageManager.updateAllLanguageSelectors();
            }
        }
    }

    async logout() {
        if (window.supabaseClient) {
            try {
                await window.supabaseClient.auth.signOut();
                console.log('✅ Déconnexion Supabase');
            } catch (error) {
                console.error('❌ Erreur déconnexion:', error);
            }
        }
        
        this.currentUser = null;
        
        if (this.audioManager) {
            this.audioManager.resetRecording();
        }
        
        const loginForm = document.getElementById('loginForm');
        const errorMessage = document.getElementById('errorMessage');
        const loadingMessage = document.getElementById('loadingMessage');
        
        if (loginForm) loginForm.reset();
        if (errorMessage) errorMessage.style.display = 'none';
        if (loadingMessage) loadingMessage.style.display = 'none';
        
        this.showPage(PAGES.LOGIN);
    }

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
        
        if (!this.profileManager) {
            this.profileManager = new ProfileManager();
            
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
        
        await this.profileManager.loadProfile(this.currentUser.id);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getDataManager() {
        return this.dataManager;
    }

    getAudioManager() {
        return this.audioManager;
    }

    editBrouillon(id) { return this.dataManager.editBrouillon(id); }
    validateBrouillon(id) { return this.dataManager.validateBrouillon(id); }
    deleteBrouillon(id) { return this.dataManager.deleteBrouillon(id); }
    saveEditedBrouillon(id, btn) { return this.dataManager.saveEditedBrouillon(id, btn); }
    viewRapport(id) { return this.dataManager.viewRapport(id); }
    shareRapport(id) { return this.dataManager.shareRapport(id); }
    exportRapport(id) { return this.dataManager.exportRapport(id); }
    downloadPDF(id) { return this.dataManager.downloadPDF(id); }
}

document.addEventListener('DOMContentLoaded', async function() {
    
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const type = urlParams.get('type');
    
    if (token && type === 'signup') {
        console.log('🔐 Confirmation email détectée...');
        
        let attempts = 0;
        const maxAttempts = 50;
        
        const waitForSupabase = setInterval(async () => {
            attempts++;
            
            if (window.supabaseClient || attempts >= maxAttempts) {
                clearInterval(waitForSupabase);
                
                if (!window.supabaseClient) {
                    console.error('❌ Supabase non disponible pour la confirmation');
                    Utils.showToast('Erreur de confirmation. Rechargez la page.', 'error');
                    return;
                }
                
                try {
                    const { error } = await window.supabaseClient.auth.verifyOtp({
                        token_hash: token,
                        type: 'signup'
                    });
                    
                    if (error) {
                        console.error('❌ Erreur confirmation:', error);
                        Utils.showToast('Erreur de confirmation. Le lien a peut-être expiré.', 'error');
                    } else {
                        console.log('✅ Email confirmé avec succès');
                        Utils.showToast('✅ Email confirmé ! Vous pouvez maintenant vous connecter.', 'success', 5000);
                    }
                    
                    window.history.replaceState({}, document.title, '/app.html');
                    
                } catch (error) {
                    console.error('❌ Exception confirmation:', error);
                    Utils.showToast('Erreur de confirmation. Contactez le support.', 'error');
                }
            }
        }, 100);
    }
    
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

    try {
        window.appManager = new AppManager();
        console.log('✅ Application initialisée avec succès (Mode Supabase Auth + Email Confirmation)');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
    }
});

window.addEventListener('beforeunload', function() {
    if (window.appManager && window.appManager.audioManager) {
        window.appManager.audioManager.stopAudioStream();
    }
});

window.addEventListener('error', function(event) {
    console.error('❌ Erreur globale:', event.error);
    
    if (typeof Utils !== 'undefined' && typeof t === 'function') {
        Utils.showToast(t('toast.error.unexpected'), 'error');
    }
});

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