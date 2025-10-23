// Gestionnaire de profil utilisateur pour VOCALIA - Version finale avec traductions
class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.supabase = window.supabaseClient;
    }

    // Fonction helper pour traduire
    translate(key) {
        return window.languageManager ? window.languageManager.translate(key) : key;
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
        console.log('🎨 Mise à jour UI profil:', profile);
        
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

        // ✅ Afficher les détails de l'abonnement avec traductions
        const planDate = document.getElementById('planDate');
        if (planDate && profile.created_at) {
            const createdDate = new Date(profile.created_at);
            const monthNames = [
                this.translate('month.january'), this.translate('month.february'),
                this.translate('month.march'), this.translate('month.april'),
                this.translate('month.may'), this.translate('month.june'),
                this.translate('month.july'), this.translate('month.august'),
                this.translate('month.september'), this.translate('month.october'),
                this.translate('month.november'), this.translate('month.december')
            ];
            
            const formattedDate = `${monthNames[createdDate.getMonth()]} ${createdDate.getFullYear()}`;
            
            if (profile.subscription_plan === 'pro') {
                let statusHTML = `<div style="margin-top: 15px;">`;
                
                // Date de début
                const memberSinceText = this.translate('profile.member.since');
                statusHTML += `
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <span style="font-size: 20px;">📅</span>
                        <div>
                            <div style="font-weight: 600; color: var(--gray-900); font-size: 14px;">${memberSinceText}</div>
                            <div style="color: var(--gray-600); font-size: 13px;">${formattedDate}</div>
                        </div>
                    </div>
                `;
                
                // Statut de l'abonnement
                if (profile.subscription_status === 'canceling' && profile.subscription_end_date) {
                    // Abonnement en cours d'annulation
                    const endDate = new Date(profile.subscription_end_date);
                    const endMonthName = monthNames[endDate.getMonth()];
                    const formattedEndDate = `${endDate.getDate()} ${endMonthName} ${endDate.getFullYear()}`;
                    
                    const cancelScheduledText = this.translate('profile.cancellation.scheduled');
                    const cancelDateText = this.translate('profile.cancellation.date');
                    const keepAccessText = this.translate('profile.cancellation.keep.access');
                    
                    statusHTML += `
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 12px; background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); border-radius: 10px; border-left: 3px solid #EF4444;">
                            <span style="font-size: 20px;">⚠️</span>
                            <div>
                                <div style="font-weight: 700; color: #DC2626; font-size: 14px;">${cancelScheduledText}</div>
                                <div style="color: var(--gray-700); font-size: 13px; margin-top: 3px;">
                                    ${cancelDateText} <strong>${formattedEndDate}</strong>
                                </div>
                                <div style="color: var(--gray-600); font-size: 12px; margin-top: 5px;">
                                    ${keepAccessText}
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    // Abonnement actif
                    const startDate = new Date(profile.created_at);
                    const today = new Date();
                    
                    const monthsElapsed = (today.getFullYear() - startDate.getFullYear()) * 12 + 
                                         (today.getMonth() - startDate.getMonth());
                    
                    const nextRenewal = new Date(startDate);
                    nextRenewal.setMonth(startDate.getMonth() + monthsElapsed + 1);
                    
                    const renewalMonthName = monthNames[nextRenewal.getMonth()];
                    const formattedRenewalDate = `${nextRenewal.getDate()} ${renewalMonthName} ${nextRenewal.getFullYear()}`;
                    
                    const daysUntilRenewal = Math.ceil((nextRenewal - today) / (1000 * 60 * 60 * 24));
                    
                    const activeText = this.translate('profile.subscription.active');
                    const nextRenewalText = this.translate('profile.next.renewal');
                    const daysText = daysUntilRenewal > 0 
                        ? this.translate('profile.renewal.in.days').replace('{days}', daysUntilRenewal).replace('{plural}', daysUntilRenewal > 1 ? 's' : '')
                        : this.translate('profile.renewal.today');
                    
                    statusHTML += `
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 12px; background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05)); border-radius: 10px; border-left: 3px solid #10B981;">
                            <span style="font-size: 20px;">🔄</span>
                            <div>
                                <div style="font-weight: 700; color: #059669; font-size: 14px;">${activeText}</div>
                                <div style="color: var(--gray-700); font-size: 13px; margin-top: 3px;">
                                    ${nextRenewalText} : <strong>${formattedRenewalDate}</strong>
                                </div>
                                <div style="color: var(--gray-600); font-size: 12px; margin-top: 5px;">
                                    ${daysText} • 14,99€
                                </div>
                            </div>
                        </div>
                    `;
                }
                
                statusHTML += `</div>`;
                planDate.innerHTML = statusHTML;
                
            } else {
                // Pour les utilisateurs FREE
                const memberSinceText = this.translate('profile.member.since');
                planDate.innerHTML = `
                    <div style="margin-top: 15px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 20px;">📅</span>
                            <div>
                                <div style="font-weight: 600; color: var(--gray-900); font-size: 14px;">${memberSinceText}</div>
                                <div style="color: var(--gray-600); font-size: 13px;">${formattedDate}</div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        // ✅ LIMITES RAPPORTS (COMPTEUR)
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

        // ✅ AFFICHER LA DATE DU PROCHAIN RESET (pour FREE)
        const nextResetContainer = document.getElementById('nextResetInfo');
        if (nextResetContainer && profile.subscription_plan === 'free') {
            const lastReset = new Date(profile.last_reset_date || profile.created_at);
            const nextReset = new Date(lastReset);
            nextReset.setDate(nextReset.getDate() + 30);
            
            const now = new Date();
            const daysUntilReset = Math.ceil((nextReset - now) / (1000 * 60 * 60 * 24));
            
            const monthNames = [
                this.translate('month.january'), this.translate('month.february'),
                this.translate('month.march'), this.translate('month.april'),
                this.translate('month.may'), this.translate('month.june'),
                this.translate('month.july'), this.translate('month.august'),
                this.translate('month.september'), this.translate('month.october'),
                this.translate('month.november'), this.translate('month.december')
            ];
            
            const resetMonthName = monthNames[nextReset.getMonth()];
            const formattedResetDate = `${nextReset.getDate()} ${resetMonthName} ${nextReset.getFullYear()}`;
            
            const nextRenewalText = this.translate('profile.next.renewal');
            const daysText = daysUntilReset > 0 
                ? this.translate('profile.renewal.in.days').replace('{days}', daysUntilReset).replace('{plural}', daysUntilReset > 1 ? 's' : '')
                : this.translate('profile.renewal.today');
            
            nextResetContainer.innerHTML = `
                <div style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, rgba(139, 21, 56, 0.05), rgba(255, 111, 0, 0.05)); border-radius: 12px; border-left: 4px solid var(--primary);">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <span style="font-size: 24px;">📅</span>
                        <span style="font-weight: 700; color: var(--gray-900); font-size: 15px;">
                            ${nextRenewalText}
                        </span>
                    </div>
                    <p style="margin: 0; color: var(--gray-700); font-size: 14px; font-weight: 500;">
                        ${formattedResetDate}
                    </p>
                    <p style="margin: 5px 0 0 0; color: var(--primary); font-size: 14px; font-weight: 700;">
                        ${daysText} 🎉
                    </p>
                    <p style="margin: 10px 0 0 0; color: var(--gray-500); font-size: 12px; line-height: 1.4;">
                        💡 Votre compteur sera automatiquement remis à 0 et vous aurez 5 nouveaux rapports disponibles.
                    </p>
                </div>
            `;
        } else if (nextResetContainer) {
            nextResetContainer.innerHTML = '';
        }

        // ✅ GESTION DES BOUTONS UPGRADE / CANCEL
        const upgradeBtn = document.getElementById('upgradeBtn');
        const cancelBtn = document.getElementById('cancelSubscriptionBtn');

        if (profile.subscription_plan === 'pro') {
            if (upgradeBtn) upgradeBtn.style.display = 'none';
            
            if (cancelBtn) {
                cancelBtn.style.display = 'flex';
                
                if (profile.subscription_status === 'canceling') {
                    cancelBtn.disabled = true;
                    cancelBtn.setAttribute('data-i18n', 'profile.cancellation.pending');
                    const pendingText = this.translate('profile.cancellation.pending');
                    cancelBtn.textContent = `⏳ ${pendingText}`;
                    cancelBtn.style.opacity = '0.6';
                    cancelBtn.style.cursor = 'not-allowed';
                } else {
                    cancelBtn.disabled = false;
                    cancelBtn.setAttribute('data-i18n', 'profile.cancel');
                    const cancelText = this.translate('profile.cancel');
                    cancelBtn.textContent = cancelText;
                    cancelBtn.style.opacity = '1';
                    cancelBtn.style.cursor = 'pointer';
                }
            }
        } else {
            if (upgradeBtn) upgradeBtn.style.display = 'flex';
            if (cancelBtn) cancelBtn.style.display = 'none';
        }

        // Appareils connectés
        this.displayDevices(profile.device_ids || []);
        
        // ✅ Mettre à jour les textes des boutons directement avec data-i18n
        const deleteBtn = document.getElementById('deleteAccountBtn');
        if (deleteBtn) {
            deleteBtn.setAttribute('data-i18n', 'profile.delete');
            const deleteText = this.translate('profile.delete');
            deleteBtn.textContent = deleteText;
        }
        
        // ✅ S'assurer que le bouton d'annulation a l'attribut data-i18n
        if (profile.subscription_plan === 'pro' && profile.subscription_status !== 'canceling') {
            const cancelBtnFinal = document.getElementById('cancelSubscriptionBtn');
            if (cancelBtnFinal && !cancelBtnFinal.disabled) {
                cancelBtnFinal.setAttribute('data-i18n', 'profile.cancel');
                const cancelTextFinal = this.translate('profile.cancel');
                cancelBtnFinal.textContent = cancelTextFinal;
            }
        }
        
        // ✅ Forcer la mise à jour des traductions après modification du DOM
        if (window.languageManager) {
            setTimeout(() => window.languageManager.updateUI(), 100);
        }
    }

    // === AFFICHAGE DES APPAREILS ===
    displayDevices(deviceIds) {
        const container = document.getElementById('devicesList');
        if (!container) return;

        if (!deviceIds || deviceIds.length === 0) {
            const noDevicesText = this.translate('profile.devices.none');
            container.innerHTML = `
                <div class="empty-state" style="padding: 30px;">
                    <div class="icon">📱</div>
                    <p>${noDevicesText}</p>
                </div>
            `;
            return;
        }

        const deviceText = this.translate('profile.device');
        const connectedText = this.translate('profile.device.connected');
        
        container.innerHTML = deviceIds.map((deviceId, index) => {
            const shortId = deviceId.substring(0, 30);
            return `
                <div class="device-item">
                    <div class="device-icon">📱</div>
                    <div class="device-info">
                        <div class="device-name">${deviceText} ${index + 1}</div>
                        <div class="device-id">${shortId}...</div>
                    </div>
                    <div class="device-status">
                        <span class="status-dot"></span>
                        ${connectedText}
                    </div>
                </div>
            `;
        }).join('');
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

        try {
            console.log('💾 Sauvegarde du profil...');

            const { data, error } = await this.supabase
                .from('profiles')
                .update({
                    first_name: firstName,
                    last_name: lastName
                })
                .eq('id', this.currentUser.id)
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Profil mis à jour:', data);
            this.currentUser = data;
            
            const successText = this.translate('profile.save.success');
            Utils.showToast(successText, 'success');

        } catch (error) {
            console.error('❌ Erreur sauvegarde profil:', error);
            const errorText = this.translate('profile.save.error');
            Utils.showToast(errorText, 'error');
        }
    }

    // === UPGRADE MODAL ===
    handleUpgrade() {
        const modal = document.createElement('div');
        modal.className = 'upgrade-modal-overlay';
        modal.innerHTML = `
            <div class="upgrade-modal-content">
                <button class="upgrade-modal-close" onclick="this.closest('.upgrade-modal-overlay').remove()">×</button>
                
                <div class="upgrade-modal-header">
                    <h2 class="upgrade-modal-title" data-i18n="upgrade.title">Choisissez votre plan</h2>
                    <p class="upgrade-modal-subtitle" data-i18n="upgrade.subtitle">Débloquez tout le potentiel de VOCALIA</p>
                </div>
                
                <div class="plans-comparison">
                    <div class="plan-card-modal free-plan">
                        <div class="plan-name" data-i18n="upgrade.free.name">Plan FREE</div>
                        <div class="plan-price-modal">
                            <span class="price-amount">0€</span>
                            <span class="price-period" data-i18n="upgrade.price.month">/mois</span>
                        </div>
                        
                        <ul class="plan-features-modal">
                            <li class="feature-item">
                                <span class="feature-icon">✅</span>
                                <span data-i18n="upgrade.feature.reports.5">5 rapports/mois</span>
                            </li>
                            <li class="feature-item">
                                <span class="feature-icon">✅</span>
                                <span data-i18n="upgrade.feature.devices.2">2 appareils max</span>
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
                        
                        <button class="plan-button-modal upgrade" onclick="window.appManager.profileManager.initStripeCheckout()">
                            🚀 <span data-i18n="upgrade.button">Passer au PRO</span>
                        </button>
                    </div>
                </div>
                
                <div class="upgrade-footer">
                    <p data-i18n="upgrade.footer">💳 Paiement sécurisé par Stripe • Annulation à tout moment</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        if (window.languageManager) {
            window.languageManager.updateUI();
        }
        
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            modal.querySelector('.upgrade-modal-content').style.transform = 'scale(1)';
        });
    }

    // === MODAL UPGRADE (limite atteinte) ===
    showUpgradeModal() {
        const modal = Utils.createModal(
            '🚫 Limite atteinte !',
            `<div style="text-align: center; padding: 20px;">
                <div style="font-size: 64px; margin-bottom: 20px;">📊</div>
                <h3 style="color: var(--error); margin-bottom: 15px;">
                    Vous avez atteint votre limite mensuelle
                </h3>
                <p style="font-size: 16px; color: var(--gray-700); margin-bottom: 30px; line-height: 1.6;">
                    Votre plan <strong>FREE</strong> vous permet de créer <strong>5 rapports par mois</strong>.<br>
                    Vous avez utilisé <strong>5/5 rapports ce mois</strong>.
                </p>
                <div style="background: linear-gradient(135deg, rgba(139, 21, 56, 0.1), rgba(255, 111, 0, 0.1)); padding: 25px; border-radius: 15px; margin-bottom: 25px;">
                    <h4 style="color: var(--primary); margin-bottom: 15px; font-size: 18px;">
                        ✨ Passez au plan PRO pour débloquer :
                    </h4>
                    <ul style="text-align: left; list-style: none; padding: 0; margin: 0;">
                        <li style="padding: 8px 0; color: var(--gray-800);">
                            <strong>✅ Rapports illimités</strong> - Créez autant de rapports que vous voulez
                        </li>
                        <li style="padding: 8px 0; color: var(--gray-800);">
                            <strong>✅ Appareils illimités</strong> - Connectez tous vos appareils
                        </li>
                        <li style="padding: 8px 0; color: var(--gray-800);">
                            <strong>✅ Transcription IA avancée</strong> - Meilleure qualité
                        </li>
                        <li style="padding: 8px 0; color: var(--gray-800);">
                            <strong>✅ Export Word</strong> - PDF + DOCX
                        </li>
                        <li style="padding: 8px 0; color: var(--gray-800);">
                            <strong>✅ Support prioritaire 24/7</strong>
                        </li>
                    </ul>
                </div>
                <div style="display: flex; gap: 15px; justify-content: center; align-items: center; margin-bottom: 15px;">
                    <div style="text-align: center;">
                        <div style="font-size: 32px; font-weight: 700; color: var(--primary);">14,99€</div>
                        <div style="font-size: 14px; color: var(--gray-600);">/mois</div>
                    </div>
                </div>
                <p style="font-size: 12px; color: var(--gray-500); margin-top: 20px;">
                    🔒 Paiement sécurisé par Stripe • Annulation à tout moment
                </p>
            </div>`,
            [
                { text: 'Plus tard', class: 'btn-secondary', onclick: 'this.closest("[data-modal]").remove()' },
                { text: '🚀 Passer au PRO maintenant', class: 'btn-primary', onclick: 'window.appManager.profileManager.handleUpgrade(); this.closest("[data-modal]").remove();' }
            ]
        );
    }

    // === INITIALISATION STRIPE ===
    async initStripeCheckout() {
        try {
            console.log('🚀 Initialisation du paiement Stripe...');

            const modal = document.querySelector('.upgrade-modal-overlay');
            if (modal) modal.remove();

            Utils.showToast('Redirection vers le paiement sécurisé...', 'info');

            await this.loadStripeScript();
            const stripe = window.Stripe(window.STRIPE_CONFIG.publishableKey);

            const response = await fetch('https://alsyhwaplkwmwddirxwu.supabase.co/functions/v1/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await this.supabase.auth.getSession()).data.session?.access_token}`
                },
                body: JSON.stringify({
                    userId: this.currentUser.id,
                    priceId: window.STRIPE_CONFIG.priceId,
                    successUrl: window.STRIPE_CONFIG.successUrl,
                    cancelUrl: window.STRIPE_CONFIG.cancelUrl
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la création de la session');
            }

            const { sessionId } = await response.json();
            const { error } = await stripe.redirectToCheckout({ sessionId });

            if (error) throw error;

        } catch (error) {
            console.error('❌ Erreur paiement Stripe:', error);
            Utils.showToast('Erreur lors de l\'initialisation du paiement. Réessayez plus tard.', 'error');
        }
    }

    // === ANNULATION DE L'ABONNEMENT ===
    async cancelSubscription() {
        const confirmMessage = this.translate('profile.cancel.confirm');
        const confirmed = confirm(confirmMessage);

        if (!confirmed) return;

        const cancelBtn = document.getElementById('cancelSubscriptionBtn');
        if (cancelBtn) {
            cancelBtn.disabled = true;
            const cancelingText = this.translate('profile.canceling');
            cancelBtn.innerHTML = `<div class="loading-spinner"></div> ${cancelingText}`;
        }

        try {
            console.log('🚫 Annulation de l\'abonnement...');

            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (!session) {
                throw new Error(this.translate('profile.no.session'));
            }

            const response = await fetch(
                'https://alsyhwaplkwmwddirxwu.supabase.co/functions/v1/cancel-subscription',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || this.translate('profile.cancel.error'));
            }

            const data = await response.json();
            console.log('✅ Abonnement annulé:', data);

            const endDate = new Date(data.end_date);
            const monthNames = [
                this.translate('month.january'), this.translate('month.february'),
                this.translate('month.march'), this.translate('month.april'),
                this.translate('month.may'), this.translate('month.june'),
                this.translate('month.july'), this.translate('month.august'),
                this.translate('month.september'), this.translate('month.october'),
                this.translate('month.november'), this.translate('month.december')
            ];
            
            const endMonthName = monthNames[endDate.getMonth()];
            const formattedDate = `${endDate.getDate()} ${endMonthName} ${endDate.getFullYear()}`;

            const successMessage = this.translate('profile.cancel.success');
            Utils.showToast(`${successMessage} ${formattedDate}`, 'success');

            await this.loadProfile(this.currentUser.id);

        } catch (error) {
            console.error('❌ Erreur annulation:', error);
            Utils.showToast(this.translate('profile.cancel.error'), 'error');
        } finally {
            if (cancelBtn) {
                cancelBtn.disabled = false;
                cancelBtn.setAttribute('data-i18n', 'profile.cancel');
                const cancelText = this.translate('profile.cancel');
                cancelBtn.textContent = cancelText;
            }
        }
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

            const { error: deleteError } = await this.supabase
                .from('profiles')
                .delete()
                .eq('id', this.currentUser.id);

            if (deleteError) throw deleteError;

            const { error: authError } = await this.supabase.auth.admin.deleteUser(
                this.currentUser.id
            );

            if (authError) {
                console.warn('⚠️ Erreur suppression auth (normal si RLS):', authError);
            }

            await this.supabase.auth.signOut();

            console.log('✅ Compte supprimé avec succès');
            Utils.showToast('Compte supprimé. Au revoir ! 👋', 'success');

            setTimeout(() => {
                window.location.href = 'register.html';
            }, 2000);

        } catch (error) {
            console.error('❌ Erreur suppression compte:', error);
            Utils.showToast('Erreur lors de la suppression du compte', 'error');
            
            if (deleteBtn) {
                deleteBtn.disabled = false;
                const deleteText = this.translate('profile.delete');
                deleteBtn.textContent = deleteText;
            }
        }
    }
}

// Export global
window.ProfileManager = ProfileManager;