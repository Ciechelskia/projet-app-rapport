// ============================================
// PROFILE MANAGER - GESTION DU PROFIL UTILISATEUR
// VERSION AVEC DEBUG MAXIMUM POUR ERREUR 400
// ============================================

class ProfileManager {
    constructor(appManager) {
        this.appManager = appManager;
        this.currentProfile = null;
    }

    // === CHARGEMENT DU PROFIL ===
    
    async loadProfile(userId) {
        if (!userId || !window.supabaseClient) {
            console.warn('⚠️ Impossible de charger le profil');
            return null;
        }

        try {
            const { data: profile, error } = await window.supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            this.currentProfile = profile;
            this.updateProfileUI(profile);
            
            console.log('✅ Profil chargé:', profile);
            return profile;

        } catch (error) {
            console.error('❌ Erreur chargement profil:', error);
            return null;
        }
    }

    // === MISE À JOUR DE L'INTERFACE PROFIL ===
    
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
            const createdDate = new Date(profile.created_at);
            const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
            const formattedDate = `${createdDate.getDate()} ${monthNames[createdDate.getMonth()]} ${createdDate.getFullYear()}`;
            planDate.textContent = `${t('profile.member.since')} ${formattedDate}`;
        }

        // Compteur de rapports
        this.updateReportsCounter(profile);

        // Boutons d'abonnement
        this.updateSubscriptionButtons(profile);

        // Appareils connectés
        this.updateDevicesList(profile);
    }

    // === MISE À JOUR DU COMPTEUR DE RAPPORTS ===
    
    updateReportsCounter(profile) {
        const isPro = profile.subscription_plan === 'pro';
        const count = profile.reports_this_month || 0;
        const limit = isPro ? '∞' : '5';

        const countElement = document.getElementById('reportsCountProfile');
        const limitElement = document.getElementById('reportsLimitProfile');
        const progressBar = document.getElementById('reportsProgressBar');

        if (countElement) countElement.textContent = count;
        if (limitElement) limitElement.textContent = limit;

        if (progressBar) {
            if (isPro) {
                progressBar.style.width = '100%';
                progressBar.style.background = 'linear-gradient(90deg, #10b981, #059669)';
            } else {
                const percentage = Math.min((count / 5) * 100, 100);
                progressBar.style.width = percentage + '%';
                
                if (percentage >= 100) {
                    progressBar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
                } else if (percentage >= 80) {
                    progressBar.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
                } else {
                    progressBar.style.background = 'linear-gradient(90deg, #8B1538, #F59E0B)';
                }
            }
        }

        // ✅ AFFICHAGE DE LA DATE DU PROCHAIN RESET (pour FREE uniquement)
        const nextResetInfo = document.getElementById('nextResetInfo');
        if (nextResetInfo && !isPro) {
            const nextReset = this.getNextResetDate();
            const daysUntilReset = this.getDaysUntilReset();
            
            nextResetInfo.innerHTML = `
                <div style="
                    margin-top: 15px;
                    padding: 12px;
                    background: linear-gradient(135deg, rgba(139, 21, 56, 0.05), rgba(245, 158, 11, 0.05));
                    border-left: 3px solid var(--primary);
                    border-radius: 8px;
                    font-size: 13px;
                    color: var(--gray-700);
                ">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <span style="font-size: 16px;">🔄</span>
                        <strong>Prochain reset :</strong>
                    </div>
                    <div style="color: var(--gray-600); margin-left: 24px;">
                        ${nextReset} (dans ${daysUntilReset} jour${daysUntilReset > 1 ? 's' : ''})
                    </div>
                </div>
            `;
        } else if (nextResetInfo) {
            nextResetInfo.innerHTML = '';
        }
    }

    // === CALCUL DE LA DATE DU PROCHAIN RESET ===
    
    getNextResetDate() {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        return `1er ${monthNames[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`;
    }

    getDaysUntilReset() {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const diffTime = nextMonth - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // === MISE À JOUR DES BOUTONS D'ABONNEMENT ===
    
    updateSubscriptionButtons(profile) {
        const upgradeBtn = document.getElementById('upgradeBtn');
        const cancelBtn = document.getElementById('cancelSubscriptionBtn');

        const isPro = profile.subscription_plan === 'pro';

        if (upgradeBtn) {
            upgradeBtn.style.display = isPro ? 'none' : 'flex';
        }

        if (cancelBtn) {
            cancelBtn.style.display = isPro ? 'flex' : 'none';
        }

        // Affichage des informations d'annulation si applicable
        if (isPro && profile.subscription_cancel_at) {
            const planDate = document.getElementById('planDate');
            if (planDate) {
                const cancelDate = new Date(profile.subscription_cancel_at);
                const formattedDate = cancelDate.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });

                planDate.innerHTML = `
                    <div style="color: var(--warning); font-weight: 600; margin-bottom: 10px;">
                        ⚠️ ${t('profile.cancellation.scheduled')}
                    </div>
                    <div style="font-size: 14px; color: var(--gray-600);">
                        ${t('profile.cancellation.date')} <strong>${formattedDate}</strong>
                    </div>
                    <div style="font-size: 13px; color: var(--gray-500); margin-top: 5px;">
                        ${t('profile.cancellation.keep.access')}
                    </div>
                `;
            }
        }
    }

    // === MISE À JOUR DE LA LISTE DES APPAREILS ===
    
    updateDevicesList(profile) {
        const devicesList = document.getElementById('devicesList');
        if (!devicesList) return;

        const devices = profile.devices || [];

        if (devices.length === 0) {
            devicesList.innerHTML = `
                <p style="color: var(--gray-500); font-size: 14px; text-align: center; padding: 20px;">
                    ${t('profile.devices.none')}
                </p>
            `;
            return;
        }

        devicesList.innerHTML = devices.map((device, index) => `
            <div style="
                padding: 15px;
                background: var(--gray-50);
                border-radius: 10px;
                margin-bottom: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <div>
                    <div style="font-weight: 600; color: var(--gray-800); margin-bottom: 5px;">
                        ${t('profile.device')} ${index + 1}
                    </div>
                    <div style="font-size: 12px; color: var(--gray-500);">
                        ${t('profile.device.connected')} ${new Date(device.connected_at || Date.now()).toLocaleDateString()}
                    </div>
                </div>
                <div style="
                    width: 10px;
                    height: 10px;
                    background: var(--success);
                    border-radius: 50%;
                "></div>
            </div>
        `).join('');
    }

    // === SAUVEGARDE DU PROFIL ===
    
    async saveProfile() {
        const firstNameInput = document.getElementById('profileFirstName');
        const lastNameInput = document.getElementById('profileLastName');

        const firstName = firstNameInput?.value.trim();
        const lastName = lastNameInput?.value.trim();

        if (!firstName || !lastName) {
            Utils.showToast('Veuillez remplir tous les champs', 'error');
            return;
        }

        const currentUser = this.appManager.getCurrentUser();
        if (!currentUser || !currentUser.id) {
            Utils.showToast('Utilisateur non connecté', 'error');
            return;
        }

        try {
            const { error } = await window.supabaseClient
                .from('profiles')
                .update({
                    first_name: firstName,
                    last_name: lastName
                })
                .eq('id', currentUser.id);

            if (error) throw error;

            // Mise à jour du nom affiché dans le header
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = `${firstName} ${lastName}`;
            }

            Utils.showToast('✅ Profil sauvegardé avec succès', 'success');
            
            // Recharger le profil
            await this.loadProfile(currentUser.id);

        } catch (error) {
            console.error('❌ Erreur sauvegarde profil:', error);
            Utils.showToast('Erreur lors de la sauvegarde', 'error');
        }
    }

    // === GESTION DE L'UPGRADE - VERSION CORRIGÉE ===
    
    async handleUpgrade() {
        const currentUser = this.appManager.getCurrentUser();
        if (!currentUser || !currentUser.id) {
            Utils.showToast('Utilisateur non connecté', 'error');
            return;
        }

        try {
            console.log('========== DÉBUT CRÉATION SESSION STRIPE ==========');
            console.log('🚀 Création de la session Stripe...');
            
            // ✅ CORRECTION : Envoyer les paramètres attendus par l'Edge Function
            const priceId = window.STRIPE_CONFIG?.PRICE_ID || 'price_1QI5lqEuhOtEuBa0Xny7QrOt'; // Votre Price ID Stripe
            const successUrl = `${window.location.origin}/app.html?status=success`;
            const cancelUrl = `${window.location.origin}/app.html?status=cancel`;
            
            console.log('📊 Données envoyées:', {
                userId: currentUser.id,
                priceId: priceId,
                successUrl: successUrl,
                cancelUrl: cancelUrl
            });

            // Appel à la fonction Edge
            const response = await window.supabaseClient.functions.invoke('create-checkout-session', {
                body: { 
                    userId: currentUser.id,
                    priceId: priceId,
                    successUrl: successUrl,
                    cancelUrl: cancelUrl
                }
            });

            console.log('========== RÉPONSE EDGE FUNCTION ==========');
            console.log('📦 Réponse COMPLÈTE:', response);
            console.log('📦 response.data:', response.data);
            console.log('📦 response.error:', response.error);

            // Si erreur dans response.error
            if (response.error) {
                console.error('========== ERREUR DÉTECTÉE ==========');
                console.error('❌ response.error:', response.error);
                throw response.error;
            }

            // Si erreur dans response.data
            if (response.data && response.data.error) {
                console.error('========== ERREUR DANS DATA ==========');
                console.error('❌ response.data.error:', response.data.error);
                throw new Error(response.data.error);
            }

            // ✅ CORRECTION : L'Edge Function retourne sessionId, pas url
            if (!response.data || !response.data.sessionId) {
                console.error('========== PAS DE SESSION ID ==========');
                console.error('❌ response.data:', response.data);
                throw new Error('Session ID non reçue');
            }

            // ✅ Construire l'URL Stripe Checkout manuellement
            const checkoutUrl = `https://checkout.stripe.com/c/pay/${response.data.sessionId}`;

            // Succès !
            console.log('========== SUCCÈS ==========');
            console.log('✅ Session ID reçue:', response.data.sessionId);
            console.log('✅ URL Checkout:', checkoutUrl);
            console.log('✅ Redirection vers Stripe Checkout...');
            window.location.href = checkoutUrl;

        } catch (error) {
            console.error('========== ERREUR CATCH ==========');
            console.error('❌ Erreur création session Stripe:', error);
            console.error('❌ Type d\'erreur:', error.constructor.name);
            console.error('❌ Message:', error.message);
            console.error('❌ Stack:', error.stack);
            console.error('❌ Toutes les propriétés:', Object.keys(error));
            console.error('❌ JSON.stringify:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
            
            // Message d'erreur pour l'utilisateur
            let errorMessage = 'Erreur lors de la création de la session de paiement';
            
            if (error.message) {
                errorMessage += `: ${error.message}`;
            }
            
            Utils.showToast(errorMessage, 'error', 5000);
        }
    }

    // === ANNULATION DE L'ABONNEMENT ===
    
    async cancelSubscription() {
        const confirmMessage = t('profile.cancel.confirm');
        
        if (!confirm(confirmMessage)) {
            return;
        }

        const currentUser = this.appManager.getCurrentUser();
        if (!currentUser || !currentUser.id) {
            Utils.showToast('Utilisateur non connecté', 'error');
            return;
        }

        try {
            console.log('🚫 Annulation de l\'abonnement...');

            const { data, error } = await window.supabaseClient.functions.invoke('cancel-subscription', {
                body: { userId: currentUser.id }
            });

            if (error) throw error;

            if (data && data.success) {
                const cancelDate = new Date(data.cancel_at * 1000).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });

                Utils.showToast(
                    `${t('profile.cancel.success')} ${cancelDate}`,
                    'success',
                    5000
                );

                // Recharger le profil pour mettre à jour l'UI
                await this.loadProfile(currentUser.id);

            } else {
                throw new Error('Réponse invalide du serveur');
            }

        } catch (error) {
            console.error('❌ Erreur annulation abonnement:', error);
            Utils.showToast(t('profile.cancel.error'), 'error');
        }
    }

    // === SUPPRESSION DU COMPTE ===
    
    async deleteAccount() {
        const confirmMessage = `⚠️ ATTENTION ⚠️

Êtes-vous ABSOLUMENT SÛR de vouloir supprimer votre compte ?

Cette action est DÉFINITIVE et IRRÉVERSIBLE :
- Tous vos rapports seront supprimés
- Tous vos brouillons seront supprimés
- Tous vos dossiers seront supprimés
- Votre abonnement sera annulé
- Toutes vos données seront effacées

Tapez "SUPPRIMER" pour confirmer :`;

        const userInput = prompt(confirmMessage);

        if (userInput !== 'SUPPRIMER') {
            Utils.showToast('Suppression annulée', 'info');
            return;
        }

        const currentUser = this.appManager.getCurrentUser();
        if (!currentUser || !currentUser.id) {
            Utils.showToast('Utilisateur non connecté', 'error');
            return;
        }

        try {
            console.log('🗑️ Suppression du compte...');

            // Suppression de tous les rapports
            await window.supabaseClient
                .from('reports')
                .delete()
                .eq('user_id', currentUser.id);

            // Suppression de tous les brouillons
            await window.supabaseClient
                .from('drafts')
                .delete()
                .eq('user_id', currentUser.id);

            // Suppression de tous les dossiers
            await window.supabaseClient
                .from('folders')
                .delete()
                .eq('user_id', currentUser.id);

            // Suppression du profil
            const { error: profileError } = await window.supabaseClient
                .from('profiles')
                .delete()
                .eq('id', currentUser.id);

            if (profileError) throw profileError;

            // Suppression de l'utilisateur Auth
            const { error: authError } = await window.supabaseClient.auth.admin.deleteUser(
                currentUser.id
            );

            if (authError) {
                console.warn('⚠️ Erreur suppression Auth (normal si pas admin):', authError);
            }

            Utils.showToast('✅ Compte supprimé avec succès', 'success');

            // Déconnexion et redirection
            setTimeout(() => {
                this.appManager.logout();
            }, 2000);

        } catch (error) {
            console.error('❌ Erreur suppression compte:', error);
            Utils.showToast('Erreur lors de la suppression du compte', 'error');
        }
    }

    // === VÉRIFICATION DU STATUT PRO ===
    
    async checkProStatus() {
        if (!this.currentProfile) {
            const currentUser = this.appManager.getCurrentUser();
            if (currentUser && currentUser.id) {
                await this.loadProfile(currentUser.id);
            }
        }

        return this.currentProfile?.subscription_plan === 'pro';
    }

    // === OBTENIR LE PROFIL ACTUEL ===
    
    getCurrentProfile() {
        return this.currentProfile;
    }
}