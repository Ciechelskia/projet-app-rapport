// Gestionnaire de profil utilisateur pour VOCALIA
class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.supabase = window.supabaseClient;
    }

    // === CHARGEMENT DU PROFIL ===
    async loadProfile(userId) {
        try {
            console.log('🔄 Chargement du profil pour:', userId);

            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('❌ Erreur chargement profil:', error);
                Utils.showToast('Erreur lors du chargement du profil', 'error');
                return null;
            }

            console.log('✅ Profil chargé:', data);
            this.currentUser = data;
            this.updateProfileUI(data);
            return data;

        } catch (error) {
            console.error('❌ Exception loadProfile:', error);
            return null;
        }
    }

    // === MISE À JOUR DE L'INTERFACE ===
    updateProfileUI(profile) {
        // Informations personnelles
        const firstNameInput = document.getElementById('profileFirstName');
        const lastNameInput = document.getElementById('profileLastName');
        const emailInput = document.getElementById('profileEmail');

        if (firstNameInput) firstNameInput.value = profile.first_name || '';
        if (lastNameInput) lastNameInput.value = profile.last_name || '';
        if (emailInput) emailInput.value = profile.email || '';

        // Badge du plan
        const planBadge = document.getElementById('planBadge');
        if (planBadge) {
            const isPro = profile.subscription_plan === 'pro';
            planBadge.textContent = isPro ? 'PRO' : 'FREE';
            planBadge.className = isPro ? 'plan-badge pro' : 'plan-badge free';
        }

        // Date d'inscription
        const planDate = document.getElementById('planDate');
        if (planDate && profile.created_at) {
            const date = new Date(profile.created_at);
            const options = { year: 'numeric', month: 'long' };
            const formattedDate = date.toLocaleDateString('fr-FR', options);
            planDate.textContent = `Membre depuis ${formattedDate}`;
        }

        // Limites rapports
        const reportsCount = document.getElementById('reportsCountProfile');
        const reportsLimit = document.getElementById('reportsLimitProfile');
        const progressBar = document.getElementById('reportsProgressBar');

        if (reportsCount && reportsLimit && progressBar) {
            const isPro = profile.subscription_plan === 'pro';
            const count = profile.reports_this_month || 0;
            const limit = isPro ? '∞' : 5;

            reportsCount.textContent = count;
            reportsLimit.textContent = limit;

            if (isPro) {
                progressBar.style.width = '100%';
                progressBar.style.background = 'linear-gradient(90deg, #22C55E, #10B981)';
            } else {
                const percentage = (count / 5) * 100;
                progressBar.style.width = `${Math.min(percentage, 100)}%`;
                
                if (percentage >= 80) {
                    progressBar.style.background = 'linear-gradient(90deg, #EF4444, #DC2626)';
                } else if (percentage >= 50) {
                    progressBar.style.background = 'linear-gradient(90deg, #F59E0B, #D97706)';
                } else {
                    progressBar.style.background = 'linear-gradient(90deg, #8B1538, #F59E0B)';
                }
            }
        }

        // Bouton upgrade
        const upgradeBtn = document.getElementById('upgradeBtn');
        if (upgradeBtn) {
            if (profile.subscription_plan === 'pro') {
                upgradeBtn.style.display = 'none';
            } else {
                upgradeBtn.style.display = 'flex';
            }
        }

        // Appareils connectés
        this.displayDevices(profile.device_ids || []);
    }

    // === AFFICHAGE DES APPAREILS ===
    displayDevices(deviceIds) {
        const container = document.getElementById('devicesList');
        if (!container) return;

        if (!deviceIds || deviceIds.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 30px;">
                    <div class="icon">📱</div>
                    <p data-i18n="profile.devices.none">Aucun appareil connecté</p>
                </div>
            `;
            return;
        }

        container.innerHTML = deviceIds.map((deviceId, index) => {
            const shortId = deviceId.substring(0, 30);
            return `
                <div class="device-item">
                    <div class="device-icon">📱</div>
                    <div class="device-info">
                        <div class="device-name">Appareil ${index + 1}</div>
                        <div class="device-id">${shortId}...</div>
                    </div>
                    <div class="device-status">
                        <span class="status-dot"></span>
                        Connecté
                    </div>
                </div>
            `;
        }).join('');
    }

    // === SAUVEGARDE DU PROFIL ===
    async saveProfile() {
        const firstNameInput = document.getElementById('profileFirstName');
        const lastNameInput = document.getElementById('profileLastName');

        if (!firstNameInput || !lastNameInput) {
            Utils.showToast('Champs introuvables', 'error');
            return;
        }

        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();

        if (!firstName || !lastName) {
            Utils.showToast('Veuillez remplir tous les champs', 'error');
            return;
        }

        const saveBtn = document.getElementById('saveProfileBtn');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<div class="loading-spinner"></div> Sauvegarde...';
        }

        try {
            const { error } = await this.supabase
                .from('profiles')
                .update({
                    first_name: firstName,
                    last_name: lastName
                })
                .eq('id', this.currentUser.id);

            if (error) throw error;

            // Mettre à jour le header
            const userName = document.getElementById('userName');
            if (userName) {
                userName.textContent = `${firstName} ${lastName}`;
            }

            // Mettre à jour l'avatar
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar) {
                const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
                userAvatar.textContent = initials;
            }

            Utils.showToast('Profil mis à jour avec succès', 'success');

        } catch (error) {
            console.error('❌ Erreur sauvegarde profil:', error);
            Utils.showToast('Erreur lors de la sauvegarde', 'error');
        } finally {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '💾 <span data-i18n="profile.save">Sauvegarder</span>';
            }
        }
    }

    // === UPGRADE VERS PRO ===
    handleUpgrade() {
        // Créer une modal de comparaison FREE vs PRO avec traductions
        const modal = document.createElement('div');
        modal.className = 'upgrade-modal-overlay';
        modal.innerHTML = `
            <div class="upgrade-modal-content">
                <!-- Bouton fermer -->
                <button class="upgrade-modal-close" onclick="this.closest('.upgrade-modal-overlay').remove()">×</button>
                
                <!-- Header -->
                <div class="upgrade-header">
                    <div class="upgrade-icon">🚀</div>
                    <h2 data-i18n="upgrade.title">Passez au plan PRO</h2>
                    <p data-i18n="upgrade.subtitle">Débloquez toutes les fonctionnalités pour booster votre productivité</p>
                </div>
                
                <!-- Comparaison des plans -->
                <div class="plans-comparison">
                    <!-- Plan FREE -->
                    <div class="plan-card-modal free-plan">
                        <div class="plan-badge-modal free" data-i18n="upgrade.free.badge">GRATUIT</div>
                        <div class="plan-price-modal">
                            <span class="price-amount">0€</span>
                            <span class="price-period" data-i18n="upgrade.price.month">/mois</span>
                        </div>
                        <div class="plan-name" data-i18n="upgrade.free.name">Plan Free</div>
                        
                        <ul class="plan-features-modal">
                            <li class="feature-item">
                                <span class="feature-icon">✅</span>
                                <span data-i18n="upgrade.feature.reports.limited">5 rapports par mois</span>
                            </li>
                            <li class="feature-item">
                                <span class="feature-icon">✅</span>
                                <span data-i18n="upgrade.feature.devices.limited">2 appareils maximum</span>
                            </li>
                            <li class="feature-item">
                                <span class="feature-icon">✅</span>
                                <span data-i18n="upgrade.feature.transcription">Transcription IA</span>
                            </li>
                            <li class="feature-item">
                                <span class="feature-icon">✅</span>
                                <span data-i18n="upgrade.feature.pdf">Export PDF</span>
                            </li>
                            <li class="feature-item disabled">
                                <span class="feature-icon">❌</span>
                                <span data-i18n="upgrade.feature.translation">Traduction multilingue</span>
                            </li>
                            <li class="feature-item disabled">
                                <span class="feature-icon">❌</span>
                                <span data-i18n="upgrade.feature.folders">Dossiers illimités</span>
                            </li>
                            <li class="feature-item disabled">
                                <span class="feature-icon">❌</span>
                                <span data-i18n="upgrade.feature.support">Support prioritaire</span>
                            </li>
                        </ul>
                        
                        <button class="plan-button-modal current" disabled data-i18n="upgrade.current">
                            Plan actuel
                        </button>
                    </div>
                    
                    <!-- Plan PRO -->
                    <div class="plan-card-modal pro-plan">
                        <div class="plan-badge-modal pro" data-i18n="upgrade.pro.badge">RECOMMANDÉ</div>
                        <div class="plan-price-modal">
                            <span class="price-amount">14,99€</span>
                            <span class="price-period" data-i18n="upgrade.price.month">/mois</span>
                        </div>
                        <div class="plan-name" data-i18n="upgrade.pro.name">Plan PRO</div>
                        
                        <ul class="plan-features-modal">
                            <li class="feature-item">
                                <span class="feature-icon">✅</span>
                                <span><strong data-i18n="upgrade.feature.reports.unlimited">Rapports illimités</strong></span>
                            </li>
                            <li class="feature-item">
                                <span class="feature-icon">✅</span>
                                <span><strong data-i18n="upgrade.feature.devices.unlimited">Appareils illimités</strong></span>
                            </li>
                            <li class="feature-item">
                                <span class="feature-icon">✅</span>
                                <span data-i18n="upgrade.feature.transcription.advanced">Transcription IA avancée</span>
                            </li>
                            <li class="feature-item">
                                <span class="feature-icon">✅</span>
                                <span data-i18n="upgrade.feature.pdf.word">Export PDF + Word</span>
                            </li>
                            <li class="feature-item">
                                <span class="feature-icon">✅</span>
                                <span><strong data-i18n="upgrade.feature.translation.6">Traduction 6 langues</strong></span>
                            </li>
                            <li class="feature-item">
                                <span class="feature-icon">✅</span>
                                <span><strong data-i18n="upgrade.feature.folders">Dossiers illimités</strong></span>
                            </li>
                            <li class="feature-item">
                                <span class="feature-icon">✅</span>
                                <span><strong data-i18n="upgrade.feature.support.24">Support prioritaire 24/7</strong></span>
                            </li>
                        </ul>
                        
                        <button class="plan-button-modal upgrade" onclick="window.profileManager.initStripeCheckout()">
                            🚀 <span data-i18n="upgrade.button">Passer au PRO</span>
                        </button>
                    </div>
                </div>
                
                <!-- Note en bas -->
                <div class="upgrade-footer">
                    <p data-i18n="upgrade.footer">💳 Paiement sécurisé par Stripe • Annulation à tout moment</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // ✅ IMPORTANT : Traduire la modal après l'avoir ajoutée au DOM
        if (window.languageManager) {
            window.languageManager.updateUI();
        }
        
        // Animation d'entrée
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            modal.querySelector('.upgrade-modal-content').style.transform = 'scale(1)';
        });
    }

    // === INITIALISATION STRIPE (PRÉPARÉ POUR PLUS TARD) ===
    async initStripeCheckout() {
        // ⚠️ POUR L'INSTANT : Juste un message
        // 🔧 PLUS TARD : Décommenter le code Stripe ci-dessous
        
        alert('🚧 Intégration Stripe en cours !\n\nPour activer le paiement :\n1. Créez un compte Stripe\n2. Ajoutez votre clé API\n3. Décommentez le code Stripe dans profile-manager.js');
        
        /* 
        // ========================================
        // CODE STRIPE À DÉCOMMENTER PLUS TARD
        // ========================================
        
        try {
            // 1. Charger la librairie Stripe
            if (!window.Stripe) {
                await this.loadStripeScript();
            }
            
            // 2. Initialiser Stripe avec votre clé
            // ⚠️ REMPLACEZ 'pk_test_...' par votre vraie clé Stripe
            const stripe = window.Stripe('pk_test_VOTRE_CLE_STRIPE_ICI');
            
            // 3. Créer une session de paiement via votre backend
            const response = await fetch('https://VOTRE_BACKEND/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.currentUser.id,
                    email: this.currentUser.email,
                    priceId: 'price_VOTRE_PRICE_ID_STRIPE', // À récupérer depuis Stripe Dashboard
                })
            });
            
            const session = await response.json();
            
            // 4. Rediriger vers Stripe Checkout
            const result = await stripe.redirectToCheckout({
                sessionId: session.id
            });
            
            if (result.error) {
                console.error('Erreur Stripe:', result.error);
                Utils.showToast('Erreur lors du paiement', 'error');
            }
            
        } catch (error) {
            console.error('Erreur initStripeCheckout:', error);
            Utils.showToast('Erreur lors de l\'initialisation du paiement', 'error');
        }
        */
    }

    // Charger le script Stripe
    async loadStripeScript() {
        return new Promise((resolve, reject) => {
            if (document.querySelector('script[src*="stripe.com"]')) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // === SUPPRESSION DU COMPTE ===
    async deleteAccount() {
        const confirmed = confirm(
            '⚠️ ATTENTION ⚠️\n\n' +
            'Êtes-vous VRAIMENT sûr de vouloir supprimer votre compte ?\n\n' +
            'Cette action est IRRÉVERSIBLE et supprimera :\n' +
            '• Tous vos rapports\n' +
            '• Tous vos brouillons\n' +
            '• Tous vos dossiers\n' +
            '• Toutes vos données personnelles\n\n' +
            'Voulez-vous continuer ?'
        );

        if (!confirmed) return;

        // Double confirmation avec mot magique
        const magicWord = prompt(
            '🔒 CONFIRMATION FINALE\n\n' +
            'Pour confirmer la suppression, tapez exactement :\n' +
            'SUPPRIMER MON COMPTE'
        );

        if (magicWord !== 'SUPPRIMER MON COMPTE') {
            Utils.showToast('Suppression annulée', 'info');
            return;
        }

        const deleteBtn = document.getElementById('deleteAccountBtn');
        if (deleteBtn) {
            deleteBtn.disabled = true;
            deleteBtn.innerHTML = '<div class="loading-spinner"></div> Suppression...';
        }

        try {
            console.log('🗑️ Suppression du compte en cours...');

            // 1. Supprimer le profil (cascade supprimera rapports et dossiers)
            const { error: deleteError } = await this.supabase
                .from('profiles')
                .delete()
                .eq('id', this.currentUser.id);

            if (deleteError) throw deleteError;

            // 2. Supprimer l'utilisateur de l'authentification
            const { error: authError } = await this.supabase.auth.admin.deleteUser(
                this.currentUser.id
            );

            // Même si l'erreur auth, on continue (RLS peut bloquer)
            if (authError) {
                console.warn('⚠️ Erreur suppression auth (normal si RLS):', authError);
            }

            // 3. Déconnexion
            await this.supabase.auth.signOut();

            console.log('✅ Compte supprimé avec succès');
            Utils.showToast('Compte supprimé. Au revoir ! 👋', 'success');

            // 4. Redirection vers inscription
            setTimeout(() => {
                window.location.href = 'register.html';
            }, 2000);

        } catch (error) {
            console.error('❌ Erreur suppression compte:', error);
            Utils.showToast('Erreur lors de la suppression du compte', 'error');
            
            if (deleteBtn) {
                deleteBtn.disabled = false;
                deleteBtn.innerHTML = '<span data-i18n="profile.delete">Supprimer mon compte</span>';
            }
        }
    }
}

// Export global
window.ProfileManager = ProfileManager;