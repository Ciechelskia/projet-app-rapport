// Gestionnaire de données pour localStorage et gestion des rapports
class DataManager {
    constructor() {
        this.storageKey = 'rapportsApp';
        this.maxBrouillons = 10;
        this.maxRapports = 20;
        this.currentFolderId = null; // Pour la navigation dans les dossiers
    }

    // === GESTION DU STOCKAGE ===

    loadAppData() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                return {
                    brouillons: data.brouillons || [],
                    rapports: data.rapports || [],
                    folders: data.folders || []
                };
            }
        } catch (error) {
            console.error('Erreur lecture localStorage:', error);
        }
        return { brouillons: [], rapports: [], folders: [] };
    }

    saveAppData(data) {
        try {
            const dataToSave = {
                ...data,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Erreur sauvegarde localStorage:', error);
            
            if (error.name === 'QuotaExceededError') {
                console.log('Tentative de nettoyage automatique...');
                this.cleanOldData(data);
            }
        }
    }

    cleanOldData(data) {
        try {
            const cleaned = {
                brouillons: data.brouillons ? data.brouillons.slice(0, this.maxBrouillons) : [],
                rapports: data.rapports ? data.rapports.slice(0, this.maxRapports) : [],
                folders: data.folders || [],
                lastSaved: new Date().toISOString()
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(cleaned));
            console.log('Nettoyage automatique effectué');
            Utils.showToast(t('toast.users.updated'), 'info');
        } catch (error) {
            console.error('Erreur lors du nettoyage:', error);
        }
    }

    // === MÉTHODE UTILITAIRE POUR TRADUIRE LE NOMBRE DE RAPPORTS ===
    
   // Méthode utilitaire pour traduire le nombre de rapports
getReportsCountText(count) {
    // Utiliser window.t() au lieu de t() pour garantir l'accès à la fonction globale
    if (count === 0) {
        return window.t('folder.reports.count', { count: 0 });
    } else if (count === 1) {
        return window.t('folder.reports.count', { count: 1 });
    } else {
        return window.t('folder.reports.count.plural', { count: count });
    }
}

    // === NAVIGATION DANS LES DOSSIERS ===

    openFolder(folderId) {
        this.currentFolderId = folderId;
        const data = this.loadAppData();
        this.updateRapportsUI(data.rapports);
    }

    closeFolder() {
        this.currentFolderId = null;
        const data = this.loadAppData();
        this.updateRapportsUI(data.rapports);
    }

    // === GESTION DES DOSSIERS ===

    getFolders() {
        const data = this.loadAppData();
        return data.folders || [];
    }

    createFolder(folderName) {
        if (!folderName || !folderName.trim()) {
            Utils.showToast(t('toast.folder.error.empty'), 'error');
            return null;
        }

        const data = this.loadAppData();
        data.folders = data.folders || [];

        if (data.folders.find(f => f.name.toLowerCase() === folderName.toLowerCase())) {
            Utils.showToast(t('toast.folder.error.exists'), 'error');
            return null;
        }

        const folder = {
            id: Utils.generateId('folder_'),
            name: folderName.trim(),
            createdAt: new Date().toISOString(),
            color: this.getRandomFolderColor()
        };

        data.folders.push(folder);
        this.saveAppData(data);
        
        Utils.showToast(t('toast.folder.created', { name: folderName }), 'success');
        return folder;
    }

    deleteFolder(folderId) {
        if (!confirm(t('folder.delete.confirm'))) {
            return;
        }

        const data = this.loadAppData();
        
        if (data.rapports) {
            data.rapports.forEach(rapport => {
                if (rapport.folderId === folderId) {
                    rapport.folderId = null;
                }
            });
        }

        data.folders = data.folders.filter(f => f.id !== folderId);
        this.saveAppData(data);
        
        // Retourner à la vue principale si on était dans ce dossier
        if (this.currentFolderId === folderId) {
            this.closeFolder();
        } else {
            this.updateRapportsUI(data.rapports);
        }
        
        Utils.showToast(t('toast.folder.deleted'), 'success');
    }

    renameFolder(folderId) {
        const data = this.loadAppData();
        const folder = data.folders.find(f => f.id === folderId);
        
        if (!folder) return;

        const modal = Utils.createModal(
            t('modal.folder.rename.title'),
            `
                <label style="display: block; margin-bottom: 10px; font-weight: bold;">
                    ${t('modal.folder.rename.label')}
                </label>
                <input type="text" id="folderNameInput" class="modal-input" value="${Utils.escapeHtml(folder.name)}" placeholder="${t('modal.folder.rename.placeholder')}">
            `,
            [
                { text: t('modal.edit.cancel'), class: 'btn-secondary', onclick: 'this.closest("[data-modal]").remove()' },
                { text: t('modal.edit.save'), class: 'btn-primary', onclick: `window.dataManager.saveFolderRename('${folderId}', this)` }
            ]
        );
    }

    saveFolderRename(folderId, buttonElement) {
        const modal = buttonElement.closest('[data-modal]');
        const newName = modal.querySelector('#folderNameInput').value.trim();
        
        if (!newName) {
            Utils.showToast(t('toast.folder.error.empty'), 'error');
            return;
        }

        const data = this.loadAppData();
        const folder = data.folders.find(f => f.id === folderId);
        
        if (folder) {
            folder.name = newName;
            this.saveAppData(data);
            this.updateRapportsUI(data.rapports);
            modal.remove();
            Utils.showToast(t('toast.folder.renamed'), 'success');
        }
    }

    moveRapportToFolder(rapportId, newFolderId) {
        const data = this.loadAppData();
        const rapport = data.rapports.find(r => r.id === rapportId);
        
        if (rapport) {
            rapport.folderId = newFolderId;
            this.saveAppData(data);
            this.updateRapportsUI(data.rapports);
            
            const folderName = newFolderId ? data.folders.find(f => f.id === newFolderId)?.name : t('folder.none');
            Utils.showToast(t('toast.report.moved', { folder: folderName }), 'success');
        }
    }

    getRandomFolderColor() {
        const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    showCreateFolderModal() {
        const modal = Utils.createModal(
            t('modal.folder.create.title'),
            `
                <label style="display: block; margin-bottom: 10px; font-weight: bold;">
                    ${t('modal.folder.create.label')}
                </label>
                <input type="text" id="newFolderName" class="modal-input" placeholder="${t('modal.folder.create.placeholder')}" autofocus>
            `,
            [
                { text: t('modal.edit.cancel'), class: 'btn-secondary', onclick: 'this.closest("[data-modal]").remove()' },
                { text: t('modal.folder.create.button'), class: 'btn-primary', onclick: 'window.dataManager.handleCreateFolder(this)' }
            ]
        );

        const input = modal.querySelector('#newFolderName');
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                window.dataManager.handleCreateFolder(e.target);
            }
        });
    }

    handleCreateFolder(element) {
        const modal = element.closest('[data-modal]');
        const input = modal.querySelector('#newFolderName');
        const folderName = input.value.trim();

        if (this.createFolder(folderName)) {
            modal.remove();
            this.updateRapportsUI(this.getRapports());
        }
    }

    showMoveFolderModal(rapportId) {
        const data = this.loadAppData();
        const folders = data.folders || [];
        const rapport = data.rapports.find(r => r.id === rapportId);

        const foldersOptions = [
            `<option value="">${t('folder.none')}</option>`,
            ...folders.map(folder => 
                `<option value="${folder.id}" ${rapport.folderId === folder.id ? 'selected' : ''}>
                    📁 ${Utils.escapeHtml(folder.name)}
                </option>`
            )
        ].join('');

        const modal = Utils.createModal(
            t('modal.move.title'),
            `
                <label style="display: block; margin-bottom: 10px; font-weight: bold;">
                    ${t('modal.move.label')}
                </label>
                <select id="folderSelect" class="modal-input" style="cursor: pointer;">
                    ${foldersOptions}
                </select>
            `,
            [
                { text: t('modal.edit.cancel'), class: 'btn-secondary', onclick: 'this.closest("[data-modal]").remove()' },
                { text: t('modal.move.button'), class: 'btn-primary', onclick: `window.dataManager.handleMoveRapport('${rapportId}', this)` }
            ]
        );
    }

    handleMoveRapport(rapportId, buttonElement) {
        const modal = buttonElement.closest('[data-modal]');
        const select = modal.querySelector('#folderSelect');
        const folderId = select.value || null;

        this.moveRapportToFolder(rapportId, folderId);
        modal.remove();
    }

    // === GESTION DES BROUILLONS ===

    getBrouillons() {
        const data = this.loadAppData();
        return data.brouillons || [];
    }

    addBrouillon(brouillon) {
        const data = this.loadAppData();
        data.brouillons = data.brouillons || [];
        data.brouillons.unshift(brouillon);
        
        this.saveAppData(data);
        this.updateBrouillonsUI(data.brouillons);
    }

    updateBrouillonWithReport(brouillonId, reportContent) {
        const data = this.loadAppData();
        const brouillon = data.brouillons.find(b => b.id === brouillonId);
        
        if (brouillon) {
            brouillon.generatedReport = reportContent;
            brouillon.status = 'ready';
            brouillon.title = this.extractTitleFromContent(reportContent);
            
            this.saveAppData(data);
            this.updateBrouillonsUI(data.brouillons);
        }
    }

    updateBrouillonStatus(brouillonId, status) {
        const data = this.loadAppData();
        const brouillon = data.brouillons.find(b => b.id === brouillonId);
        
        if (brouillon) {
            brouillon.status = status;
            if (status === 'error') {
                brouillon.title = t('drafts.status.error');
            }
            
            this.saveAppData(data);
            this.updateBrouillonsUI(data.brouillons);
        }
    }

    deleteBrouillon(brouillonId) {
        const data = this.loadAppData();
        data.brouillons = data.brouillons.filter(b => b.id !== brouillonId);
        
        this.saveAppData(data);
        this.updateBrouillonsUI(data.brouillons);
        Utils.showToast(t('toast.draft.deleted'), 'success');
    }

    editBrouillon(brouillonId) {
        const data = this.loadAppData();
        const brouillon = data.brouillons.find(b => b.id === brouillonId);
        
        if (brouillon) {
            const modal = Utils.createModal(
                t('modal.edit.title'),
                `
                    <label style="display: block; margin-bottom: 10px; font-weight: bold;">
                        ${t('modal.edit.title.label')}
                    </label>
                    <input type="text" id="editTitle" class="modal-input" value="${Utils.escapeHtml(brouillon.title || t('new.report'))}">
                    
                    <label style="display: block; margin-bottom: 10px; font-weight: bold;">
                        ${t('modal.edit.content.label')}
                    </label>
                    <textarea id="editContent" class="modal-textarea">${Utils.escapeHtml(brouillon.generatedReport || '')}</textarea>
                `,
                [
                    { text: t('modal.edit.cancel'), class: 'btn-secondary', onclick: 'this.closest("[data-modal]").remove()' },
                    { text: t('modal.edit.save'), class: 'btn-primary', onclick: `window.dataManager.saveEditedBrouillon('${brouillonId}', this)` }
                ]
            );
        }
    }

    saveEditedBrouillon(brouillonId, buttonElement) {
        const modal = buttonElement.closest('[data-modal]');
        const newTitle = modal.querySelector('#editTitle').value.trim();
        const newContent = modal.querySelector('#editContent').value.trim();
        
        if (!newTitle || !newContent) {
            Utils.showToast(t('toast.draft.error.empty'), 'error');
            return;
        }
        
        const data = this.loadAppData();
        const brouillon = data.brouillons.find(b => b.id === brouillonId);
        
        if (brouillon) {
            brouillon.title = newTitle;
            brouillon.generatedReport = newContent;
            brouillon.isModified = true;
            
            this.saveAppData(data);
            this.updateBrouillonsUI(data.brouillons);
            
            modal.remove();
            Utils.showToast(t('toast.draft.saved'), 'success');
        }
    }

    async validateBrouillon(brouillonId) {
        const data = this.loadAppData();
        const folders = data.folders || [];

        if (folders.length > 0) {
            const foldersOptions = [
                `<option value="">${t('folder.none')}</option>`,
                ...folders.map(folder => 
                    `<option value="${folder.id}">📁 ${Utils.escapeHtml(folder.name)}</option>`
                )
            ].join('');

            const modal = Utils.createModal(
                t('modal.validate.title'),
                `
                    <p style="margin-bottom: 20px;">${t('modal.validate.message')}</p>
                    <label style="display: block; margin-bottom: 10px; font-weight: bold;">
                        ${t('modal.validate.folder.label')}
                    </label>
                    <select id="validateFolderSelect" class="modal-input" style="cursor: pointer;">
                        ${foldersOptions}
                    </select>
                `,
                [
                    { text: t('modal.edit.cancel'), class: 'btn-secondary', onclick: 'this.closest("[data-modal]").remove()' },
                    { text: t('drafts.action.validate'), class: 'btn-primary', onclick: `window.dataManager.confirmValidateBrouillon('${brouillonId}', this)` }
                ]
            );
        } else {
            this.confirmValidateBrouillon(brouillonId);
        }
    }

    async confirmValidateBrouillon(brouillonId, buttonElement = null) {
    let selectedFolderId = null;

    if (buttonElement) {
        const modal = buttonElement.closest('[data-modal]');
        const select = modal.querySelector('#validateFolderSelect');
        selectedFolderId = select.value || null;
        modal.remove();
    }

    const data = this.loadAppData();
    const brouillonIndex = data.brouillons.findIndex(b => b.id === brouillonId);
    
    if (brouillonIndex !== -1) {
        const brouillon = data.brouillons[brouillonIndex];
        
        const rapport = {
            id: Utils.generateId('rapport_'),
            title: brouillon.title || `${t('new.report')} - ${new Date().toLocaleDateString()}`,
            content: brouillon.generatedReport,
            validatedAt: new Date().toISOString(),
            createdAt: brouillon.createdAt,
            folderId: selectedFolderId,
            sharedWith: [],
            status: 'validated',
            isModified: brouillon.isModified,
            sourceType: brouillon.sourceType,
            sourceInfo: brouillon.sourceInfo,
            hasPdf: false,
            pdfGenerated: false
        };

        try {
            Utils.showToast(t('toast.report.pdf.generating'), 'info');
            const pdf = await Utils.generatePDF(rapport.title, rapport.content);
            rapport.pdfData = pdf.output('datauristring');
            rapport.hasPdf = true;
            rapport.pdfGenerated = true;
            Utils.showToast(t('toast.report.pdf.generated'), 'success');
        } catch (error) {
            console.error('Erreur génération PDF:', error);
            Utils.showToast(t('toast.report.pdf.error'), 'error');
        }

        data.rapports = data.rapports || [];
        data.rapports.unshift(rapport);
        data.brouillons.splice(brouillonIndex, 1);
        
        this.saveAppData(data);
        
        this.updateBrouillonsUI(data.brouillons);
        this.updateRapportsUI(data.rapports);
        
        Utils.showToast(t('toast.draft.validated'), 'success');
        
        // ✅ NOUVEAU : Incrémenter le compteur dans Supabase et recharger le profil
        try {
            const currentUser = window.appManager?.getCurrentUser();
            
            if (currentUser && window.supabaseClient) {
                // 1. Incrémenter reports_this_month pour les utilisateurs FREE
                if (currentUser.subscription_plan === 'free') {
                    const { error: updateError } = await window.supabaseClient
                        .from('profiles')
                        .update({ 
                            reports_this_month: (currentUser.reports_this_month || 0) + 1
                        })
                        .eq('id', currentUser.id);
                    
                    if (updateError) {
                        console.error('❌ Erreur incrémentation compteur:', updateError);
                    } else {
                        console.log('✅ Compteur de rapports incrémenté');
                    }
                }
                
                // 2. Recharger le profil pour mettre à jour l'UI (badge, jauge, etc.)
                if (window.appManager?.profileManager) {
                    await window.appManager.profileManager.loadProfile(currentUser.id);
                    console.log('✅ Profil rechargé avec nouveau compteur');
                }
            }
        } catch (error) {
            console.error('❌ Erreur mise à jour profil après validation:', error);
            // Ne pas bloquer l'utilisateur, juste logger l'erreur
        }
    }
}

    // === GESTION DES RAPPORTS FINALISÉS ===

    getRapports() {
        const data = this.loadAppData();
        return data.rapports || [];
    }

    viewRapport(rapportId) {
        const data = this.loadAppData();
        const rapport = data.rapports.find(r => r.id === rapportId);
        
        if (!rapport) return;
        
        if (rapport.isTranslation && rapport.originalReportId) {
            const original = data.rapports.find(r => r.id === rapport.originalReportId);
            
            if (original) {
                this.viewComparison(original, rapport);
                return;
            }
        }
        
        const validatedDate = Utils.formatDate(rapport.validatedAt);
        const modifiedWarning = rapport.isModified ? `<br><em>${t('modal.view.modified')}</em>` : '';
        const pdfAvailable = rapport.hasPdf ? `<br><strong>${t('modal.view.pdf.available')}</strong>` : '';
        
        const modal = Utils.createModal(
            `📋 ${rapport.title}`,
            `
                <div style="background: #f8f9fa; padding: 10px; border-radius: 8px; margin-bottom: 15px; font-size: 14px; color: #666;">
                    <strong>${t('date.validated')}:</strong> ${validatedDate}
                    ${modifiedWarning}
                    ${pdfAvailable}
                </div>
                <div style="line-height: 1.6; font-size: 15px; white-space: pre-wrap;">
                    ${Utils.escapeHtml(rapport.content)}
                </div>
            `,
            []
        );
    }

    viewComparison(original, translated) {
        const modal = Utils.createModal(
            `🌐 ${t('modal.translate.title')} - ${translated.title}`,
            `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-height: 70vh; overflow: hidden;">
                    
                    <div style="border-right: 2px solid var(--gray-200); padding-right: 20px; overflow-y: auto;">
                        <div style="background: var(--gray-100); padding: 12px; border-radius: 10px; margin-bottom: 15px; position: sticky; top: 0; z-index: 1;">
                            <h4 style="margin: 0; color: var(--gray-800); font-size: 14px;">
                                📄 ${t('modal.translate.original')}
                                <span style="background: var(--gray-500); color: white; padding: 2px 8px; border-radius: 6px; font-size: 11px; margin-left: 8px;">
                                    ${this.getLanguageName(original.detectedLanguage || translated.detectedSourceLanguage)}
                                </span>
                            </h4>
                        </div>
                        <h3 style="color: var(--gray-900); font-size: 16px; margin-bottom: 15px;">${Utils.escapeHtml(original.title)}</h3>
                        <div style="line-height: 1.6; font-size: 14px; white-space: pre-wrap; color: var(--gray-700);">
                            ${Utils.escapeHtml(original.content)}
                        </div>
                    </div>
                    
                    <div style="overflow-y: auto;">
                        <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05)); padding: 12px; border-radius: 10px; margin-bottom: 15px; position: sticky; top: 0; z-index: 1;">
                            <h4 style="margin: 0; color: #7c3aed; font-size: 14px;">
                                🌐 ${t('report.translated.badge')}
                                <span style="background: #8b5cf6; color: white; padding: 2px 8px; border-radius: 6px; font-size: 11px; margin-left: 8px;">
                                    ${this.getLanguageName(translated.translatedTo)}
                                </span>
                            </h4>
                        </div>
                        <h3 style="color: var(--gray-900); font-size: 16px; margin-bottom: 15px;">${Utils.escapeHtml(translated.title)}</h3>
                        <div style="line-height: 1.6; font-size: 14px; white-space: pre-wrap; color: var(--gray-700);">
                            ${Utils.escapeHtml(translated.content)}
                        </div>
                    </div>
                    
                </div>
            `,
            [
                { 
                    text: `📄 PDF Original`, 
                    class: 'btn-secondary', 
                    onclick: `window.dataManager.downloadPDF('${original.id}'); this.closest("[data-modal]").remove();` 
                },
                { 
                    text: `📄 PDF Traduit`, 
                    class: 'btn-primary', 
                    onclick: `window.dataManager.downloadPDF('${translated.id}'); this.closest("[data-modal]").remove();` 
                }
            ]
        );
    }

    async shareRapport(rapportId) {
        const data = this.loadAppData();
        const rapport = data.rapports.find(r => r.id === rapportId);
        
        if (!rapport) return;
        
        if (rapport.hasPdf && rapport.pdfData) {
            try {
                const byteCharacters = atob(rapport.pdfData.split(',')[1]);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
                
                const filename = `${rapport.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
                
                if (navigator.share && navigator.canShare) {
                    const file = new File([pdfBlob], filename, { type: 'application/pdf' });
                    
                    if (navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            title: rapport.title,
                            text: `${t('new.report')}: ${rapport.title}`,
                            files: [file]
                        });
                        Utils.showToast(t('toast.report.shared'), 'success');
                        return;
                    }
                }
                
                const pdfUrl = URL.createObjectURL(pdfBlob);
                const emailSubject = encodeURIComponent(`${t('new.report')}: ${rapport.title}`);
                const emailBody = encodeURIComponent(
                    `Bonjour,\n\n${t('new.report')}: ${rapport.title}\n\n` +
                    `${t('date.generated')}: ${Utils.formatDate(rapport.validatedAt)}\n\n` +
                    `Le PDF est disponible en téléchargement : ${pdfUrl}\n\n` +
                    `Cordialement`
                );
                
                const mailtoLink = `mailto:?subject=${emailSubject}&body=${emailBody}`;
                window.open(mailtoLink, '_blank');
                
                const a = document.createElement('a');
                a.href = pdfUrl;
                a.download = filename;
                a.click();
                
                setTimeout(() => URL.revokeObjectURL(pdfUrl), 5000);
                
                Utils.showToast(t('toast.report.share.email'), 'success');
                
            } catch (error) {
                console.error('Erreur lors du partage PDF:', error);
                Utils.showToast(t('toast.report.share.error'), 'error');
                this.shareRapportAsText(rapport);
            }
        } else {
            Utils.showToast(t('toast.report.share.text'), 'info');
            this.shareRapportAsText(rapport);
        }
    }

    async shareRapportAsText(rapport) {
        const shareText = `${rapport.title}\n\n${rapport.content}`;
        
        const shared = await Utils.shareContent(rapport.title, shareText);
        
        if (!shared) {
            const copied = await Utils.copyToClipboard(shareText);
            if (copied) {
                Utils.showToast(t('toast.report.share.copied'), 'success');
            } else {
                Utils.showToast(t('toast.report.share.error'), 'error');
            }
        }
    }

    downloadPDF(rapportId) {
        const data = this.loadAppData();
        const rapport = data.rapports.find(r => r.id === rapportId);
        
        if (rapport && rapport.pdfData) {
            const byteCharacters = atob(rapport.pdfData.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            
            const filename = `${rapport.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
            Utils.downloadFile(blob, filename);
            Utils.showToast(t('toast.report.pdf.downloaded'), 'success');
        } else {
            Utils.showToast(t('toast.report.pdf.unavailable'), 'error');
        }
    }

    // === TRADUCTION DES RAPPORTS ===

    translateRapport(rapportId) {
        const data = this.loadAppData();
        const rapport = data.rapports.find(r => r.id === rapportId);
        
        if (!rapport) return;
        
        let sourceRapport = rapport;
        if (rapport.isTranslation && rapport.originalReportId) {
            sourceRapport = data.rapports.find(r => r.id === rapport.originalReportId) || rapport;
        }
        
        const modal = Utils.createModal(
            t('modal.translate.title'),
            `
                <div style="margin-bottom: 20px; padding: 15px; background: var(--gray-50); border-radius: 10px;">
                    <p style="margin: 0 0 10px 0;"><strong>${t('modal.translate.original')}:</strong></p>
                    <p style="color: var(--gray-600); font-size: 14px; margin: 0; font-weight: 600;">
                        ${Utils.escapeHtml(sourceRapport.title)}
                    </p>
                    <p style="color: var(--gray-500); font-size: 13px; margin-top: 8px;">
                        ${Utils.truncateText(sourceRapport.content, 200)}
                    </p>
                </div>
                
                <label style="display: block; margin-bottom: 10px; font-weight: bold; color: var(--gray-800);">
                    ${t('modal.translate.target')}
                </label>
                <select id="targetLanguage" class="modal-input" style="cursor: pointer;">
                    <option value="en">🇬🇧 English</option><option value="fr">🇫🇷 Français</option>
                    <option value="zh">🇨🇳 中文</option>
                    <option value="ja">🇯🇵 日本語</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="de">🇩🇪 Deutsch</option>
                </select>
                
                <div style="margin-top: 20px; padding: 15px; background: var(--primary-ultra-light); border-radius: 10px; border-left: 4px solid var(--primary);">
                    <p style="font-size: 13px; color: var(--gray-700); margin: 0; line-height: 1.6;">
                        <strong>ℹ️ Note:</strong> ${t('modal.translate.note')}
                    </p>
                </div>
            `,
            [
                { text: t('modal.edit.cancel'), class: 'btn-secondary', onclick: 'this.closest("[data-modal]").remove()' },
                { 
                    text: `🌐 ${t('modal.translate.button')}`, 
                    class: 'btn-primary', 
                    onclick: `window.dataManager.processTranslation('${sourceRapport.id}', this)` 
                }
            ]
        );
    }

    async processTranslation(rapportId, buttonElement) {
        const modal = buttonElement.closest('[data-modal]');
        const targetLang = modal.querySelector('#targetLanguage').value;
        
        buttonElement.disabled = true;
        buttonElement.innerHTML = '<div class="loading-spinner" style="display: inline-block; width: 16px; height: 16px; margin-right: 8px;"></div> ' + t('toast.translate.processing');
        
        const data = this.loadAppData();
        const rapport = data.rapports.find(r => r.id === rapportId);
        
        if (!rapport) {
            modal.remove();
            return;
        }
        
        try {
            console.log('=== DÉBUT TRADUCTION ===');
            console.log('Rapport ID:', rapportId);
            console.log('Langue cible:', targetLang);
            
            const response = await fetch(CONFIG.N8N_TRANSLATE_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reportId: rapportId,
                    title: rapport.title,
                    content: rapport.content,
                    targetLanguage: targetLang,
                    userId: window.app?.getCurrentUser()?.username || 'unknown',
                    timestamp: new Date().toISOString()
                })
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erreur N8n: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            console.log('Traduction reçue:', result);
            
            if (!result.success) {
                throw new Error('La traduction a échoué côté serveur');
            }
            
            const translatedRapport = {
                ...rapport,
                id: Utils.generateId('rapport_translated_'),
                title: result.translatedTitle || `[${targetLang.toUpperCase()}] ${rapport.title}`,
                content: result.translatedContent || result.content,
                validatedAt: new Date().toISOString(),
                
                isTranslation: true,
                originalReportId: rapportId,
                detectedSourceLanguage: result.detectedSourceLanguage || 'unknown',
                translatedTo: targetLang,
                translatedAt: new Date().toISOString(),
                
                folderId: rapport.folderId,
                
                hasPdf: false,
                pdfGenerated: false
            };
            
            modal.remove();
            
            try {
                Utils.showToast(t('toast.report.pdf.generating'), 'info', 2000);
                const pdf = await Utils.generatePDF(translatedRapport.title, translatedRapport.content);
                translatedRapport.pdfData = pdf.output('datauristring');
                translatedRapport.hasPdf = true;
                translatedRapport.pdfGenerated = true;
            } catch (pdfError) {
                console.warn('Erreur génération PDF:', pdfError);
            }
            
            data.rapports.unshift(translatedRapport);
            this.saveAppData(data);
            
            this.updateRapportsUI(data.rapports);
            
            const langName = this.getLanguageName(targetLang);
            Utils.showToast(t('toast.translate.success', { lang: langName }), 'success');
            
            console.log('=== TRADUCTION TERMINÉE ===');
            
        } catch (error) {
            console.error('Erreur traduction:', error);
            modal.remove();
            Utils.showToast(t('toast.translate.error') + ': ' + error.message, 'error');
        }
    }

    getLanguageName(code) {
        const languages = {
            'en': 'English',
            'fr': 'Français',
            'zh': '中文',
            'ja': '日本語',
            'es': 'Español',
            'de': 'Deutsch',
            'unknown': '?'
        };
        return languages[code] || code.toUpperCase();
    }

    filterRapports(searchTerm) {
        const data = this.loadAppData();
        const rapports = data.rapports || [];
        
        if (!searchTerm) {
            this.updateRapportsUI(rapports);
            return;
        }

        const filtered = rapports.filter(rapport => 
            rapport.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rapport.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        this.updateRapportsUI(filtered);
    }

    // === MÉTHODES UTILITAIRES ===

    extractTitleFromContent(content) {
        if (!content) return t('report.title.default');
        
        const patterns = [
            /titre\s*[:=]\s*([^\n\r]+)/i,
            /title\s*[:=]\s*([^\n\r]+)/i,
            /client\s*[:=]\s*([^\n\r]+)/i,
            /^([^\n\r]{10,80})/
        ];
        
        for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match && match[1]) {
                return match[1].trim().replace(/^[#\-*=\s]+|[#\-*=\s]+$/g, '');
            }
        }
        
        return t('report.title.default');
    }

    // === MISE À JOUR DE L'INTERFACE ===

    updateBrouillonsUI(brouillons) {
        const container = document.getElementById('brouillonsList');
        if (!container) return;
        
        if (!brouillons || brouillons.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📄</div>
                    <p>${t('drafts.empty')}</p>
                    <p class="empty-subtitle">${t('drafts.empty.subtitle')}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = brouillons.map(brouillon => {
            const date = Utils.formatDate(brouillon.createdAt);
            let statusClass = '';
            let statusIcon = '📄';
            
            if (brouillon.status === 'generating') {
                statusClass = 'status-generating';
                statusIcon = '⏳';
            } else if (brouillon.status === 'error') {
                statusClass = 'status-error';
                statusIcon = '⚠️';
            }

            const content = brouillon.generatedReport || t('status.generating');
            const truncatedContent = Utils.truncateText(content, 100);

            const sourceIndicator = brouillon.sourceType === 'upload' ? '📁' : '🎤';

            return `
                <div class="report-item ${statusClass}">
                    <div class="report-header">
                        <div class="report-title">${statusIcon} ${sourceIndicator} ${Utils.escapeHtml(brouillon.title || t('new.report'))}</div>
                        <div class="report-date">${date}</div>
                    </div>
                    <div class="report-content">${Utils.escapeHtml(truncatedContent)}</div>
                    <div class="report-actions">
                        ${brouillon.status === 'ready' ? `
                            <button class="action-btn edit-btn" onclick="window.dataManager.editBrouillon('${brouillon.id}')">${t('drafts.action.edit')}</button>
                            <button class="action-btn validate-btn" onclick="window.dataManager.validateBrouillon('${brouillon.id}')">${t('drafts.action.validate')}</button>
                        ` : ''}
                        ${brouillon.status === 'generating' ? `
                            <div class="loading-spinner"></div>
                        ` : ''}
                        ${brouillon.status === 'error' ? `
                            <button class="action-btn edit-btn" disabled>${t('drafts.action.audio.unavailable')}</button>
                        ` : ''}
                        <button class="action-btn delete-btn" onclick="window.dataManager.deleteBrouillon('${brouillon.id}')">${t('drafts.action.delete')}</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // === NOUVELLE VERSION : INTERFACE STYLE GOOGLE DRIVE ===
    updateRapportsUI(rapports) {
        const container = document.getElementById('rapportsList');
        const counter = document.getElementById('rapportsCount');
        const pdfCounter = document.getElementById('pdfCount');
        
        if (counter) {
            counter.textContent = rapports ? rapports.length : 0;
        }
        
        if (pdfCounter) {
            const pdfCount = rapports ? rapports.filter(r => r.hasPdf).length : 0;
            pdfCounter.textContent = pdfCount;
        }
        
        if (!container) return;
        
        const data = this.loadAppData();
        const folders = data.folders || [];

        if (!rapports || rapports.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📋</div>
                    <p>${t('reports.empty')}</p>
                    <p class="empty-subtitle">${t('reports.empty.subtitle')}</p>
                </div>
            `;
            return;
        }

        // SI ON EST DANS UN DOSSIER SPÉCIFIQUE
        if (this.currentFolderId) {
            const currentFolder = folders.find(f => f.id === this.currentFolderId);
            const folderRapports = rapports.filter(r => r.folderId === this.currentFolderId);
            
            container.innerHTML = `
                <!-- FIL D'ARIANE (BREADCRUMB) -->
                <div class="breadcrumb-container">
                    <button 
                        class="breadcrumb-back-btn"
                        onclick="window.dataManager.closeFolder()"
                    >
                        ← ${t('reports.action.back') || 'Retour'}
                    </button>
                    
                    <span class="breadcrumb-separator">›</span>
                    
                    <div class="breadcrumb-current">
                        <span class="breadcrumb-folder-icon">📁</span>
                        <h2 class="breadcrumb-folder-name">
                            ${Utils.escapeHtml(currentFolder?.name || 'Dossier')}
                        </h2>
                        <span class="breadcrumb-folder-count">
                            ${folderRapports.length}
                        </span>
                    </div>
                    
                    <div class="breadcrumb-actions" onclick="event.stopPropagation();">
                        <button class="action-btn" style="background: var(--warning); color: white;" onclick="window.dataManager.renameFolder('${this.currentFolderId}')">
                            ✏️ ${t('folder.action.rename')}
                        </button>
                        <button class="action-btn" style="background: var(--error); color: white;" onclick="window.dataManager.deleteFolder('${this.currentFolderId}')">
                            🗑️ ${t('folder.action.delete')}
                        </button>
                    </div>
                </div>
                
                <!-- LISTE DES RAPPORTS DU DOSSIER -->
                <div class="reports-grid">
                    ${folderRapports.length > 0 ? folderRapports.map(rapport => this.renderRapportCard(rapport)).join('') : `
                        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--gray-500);">
                            <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.5;">📭</div>
                            <p style="font-size: 18px; font-weight: 600;">${t('folder.empty')}</p>
                        </div>
                    `}
                </div>
            `;
            return;
        }

        // VUE PRINCIPALE : DOSSIERS EN HAUT, RAPPORTS SANS DOSSIER EN BAS
        const rapportsSansDossier = rapports.filter(r => !r.folderId);
        
        let html = '';

        // === SECTION DOSSIERS ===
        if (folders.length > 0) {
            html += `
                <div style="margin-bottom: 40px;">
                    <h3 class="reports-section-title">
                        📁 ${t('reports.folders') || 'Dossiers'}
                        <span class="count-badge">${folders.length}</span>
                    </h3>
                    
                    <div class="folder-card-grid">
                        ${folders.map(folder => {
                            const folderRapports = rapports.filter(r => r.folderId === folder.id);
                            
                            return `
                                <div 
                                    class="folder-card"
                                    onclick="window.dataManager.openFolder('${folder.id}')"
                                >
                                    <div class="folder-card-content">
                                        <div class="folder-icon">📁</div>
                                        <div class="folder-info">
                                            <div class="folder-name">${Utils.escapeHtml(folder.name)}</div>
                                            <div class="folder-count">${this.getReportsCountText(folderRapports.length)}</div>
                                        </div>
                                    </div>
                                    
                                    <div class="folder-actions" onclick="event.stopPropagation();">
                                        <button class="folder-action-btn" onclick="window.dataManager.renameFolder('${folder.id}')">
                                            ✏️
                                        </button>
                                        <button class="folder-action-btn" onclick="window.dataManager.deleteFolder('${folder.id}')">
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        // === SECTION RAPPORTS SANS DOSSIER ===
        if (rapportsSansDossier.length > 0) {
            html += `
                <div>
                    <h3 class="reports-section-title">
                        📄 ${t('folder.none')}
                        <span class="count-badge">${rapportsSansDossier.length}</span>
                    </h3>
                    
                    <div class="reports-compact-list">
                        ${rapportsSansDossier.map(rapport => this.renderRapportCardCompact(rapport)).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    // Rendu carte de rapport (pour vue dossier) - VERSION FINALE
    renderRapportCard(rapport) {
        const dateValidated = new Date(rapport.validatedAt).toLocaleDateString();
        const truncatedContent = Utils.truncateText(rapport.content, 150);
        
        // UN SEUL EMOJI pour le type de source
        let sourceIcon = '🎤'; // Par défaut vocal
        if (rapport.sourceType === 'upload') {
            sourceIcon = '📁';
        }
        
        const pdfIndicator = rapport.hasPdf ? '📄' : '';
        
        let translationBadge = '';
        let originalLink = '';
        
        if (rapport.isTranslation) {
            translationBadge = `
                <span style="
                    background: linear-gradient(135deg, #8b5cf6, #7c3aed); 
                    color: white; 
                    padding: 4px 10px; 
                    border-radius: 12px; 
                    font-size: 11px; 
                    font-weight: 700;
                    margin-left: 8px;
                ">
                    🌐 ${rapport.translatedTo.toUpperCase()}
                </span>
            `;
            
            if (rapport.originalReportId) {
                originalLink = `
                    <button class="action-btn" 
                            style="background: #6b7280; color: white; font-size: 11px; padding: 6px 12px;"
                            onclick="event.stopPropagation(); window.dataManager.viewRapport('${rapport.originalReportId}')">
                        🔗 Voir l'original
                    </button>
                `;
            }
        }
        
        return `
            <div class="report-item" onclick="window.dataManager.viewRapport('${rapport.id}')">
                <div class="report-header">
                    <div class="report-title">
                        ${sourceIcon} ${pdfIndicator} ${Utils.escapeHtml(rapport.title)}
                        ${translationBadge}
                    </div>
                    <div class="report-date">${t('reports.validated.on')} ${dateValidated}</div>
                </div>
                
                <div class="report-content">${Utils.escapeHtml(truncatedContent)}</div>
                
                <div class="report-actions">
                    <button class="action-btn view-btn" onclick="event.stopPropagation(); window.dataManager.viewRapport('${rapport.id}')">
                        👁️ Voir
                    </button>
                    
                    ${rapport.hasPdf ? `
                        <button class="action-btn download-pdf-btn" onclick="event.stopPropagation(); window.dataManager.downloadPDF('${rapport.id}')">
                            📄 PDF
                        </button>
                    ` : ''}
                    
                    <button class="action-btn translate-btn" 
                            onclick="event.stopPropagation(); window.dataManager.translateRapport('${rapport.id}')">
                        🌐 Traduire
                    </button>
                    
                    ${originalLink}
                    
                    <button class="action-btn share-btn" onclick="event.stopPropagation(); window.dataManager.shareRapport('${rapport.id}')">
                        📤 Partager
                    </button>
                    
                    <button class="action-btn move-btn" 
                            onclick="event.stopPropagation(); window.dataManager.showMoveFolderModal('${rapport.id}')">
                        📂 Déplacer
                    </button>
                </div>
            </div>
        `;
    }

    // Rendu compact pour les rapports sans dossier - VERSION FINALE
    renderRapportCardCompact(rapport) {
        const dateValidated = new Date(rapport.validatedAt).toLocaleDateString();
        const truncatedContent = Utils.truncateText(rapport.content, 150);
        
        // UN SEUL EMOJI pour le type de source
        let sourceIcon = '🎤'; // Par défaut vocal
        if (rapport.sourceType === 'upload') {
            sourceIcon = '📁';
        }
        
        const pdfIndicator = rapport.hasPdf ? '📄' : '';
        
        let translationBadge = '';
        let originalLink = '';
        
        if (rapport.isTranslation) {
            translationBadge = `
                <span class="translation-badge">
                    🌐 ${rapport.translatedTo.toUpperCase()}
                </span>
            `;
            
            if (rapport.originalReportId) {
                originalLink = `
                    <button class="action-btn" 
                            style="background: #6b7280; color: white; font-size: 11px; padding: 6px 12px;"
                            onclick="event.stopPropagation(); window.dataManager.viewRapport('${rapport.originalReportId}')">
                        🔗 Voir l'original
                    </button>
                `;
            }
        }
        
        return `
            <div 
                class="report-item-compact"
                onclick="window.dataManager.viewRapport('${rapport.id}')"
                style="
                    background: white;
                    border: 1px solid var(--gray-200);
                    border-radius: 10px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                    overflow: hidden;
                "
                onmouseover="
                    this.style.borderColor='#8B153840'; 
                    this.style.boxShadow='0 2px 8px rgba(139, 21, 56, 0.08)';
                    this.querySelector('.report-compact-indicator').style.opacity='1';
                " 
                onmouseout="
                    this.style.borderColor='var(--gray-200)'; 
                    this.style.boxShadow='none';
                    this.querySelector('.report-compact-indicator').style.opacity='0';
                "
            >
                <!-- Indicateur gauche -->
                <div class="report-compact-indicator" style="
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    background: var(--primary);
                    opacity: 0;
                    transition: all 0.2s ease;
                "></div>
                
                <!-- En-tête du rapport -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 15px;">
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap;">
                            <h4 style="
                                margin: 0; 
                                font-size: 16px; 
                                font-weight: 600; 
                                color: var(--gray-900);
                                display: flex;
                                align-items: center;
                                gap: 6px;
                            ">
                                ${sourceIcon} ${pdfIndicator} ${Utils.escapeHtml(rapport.title)}
                            </h4>
                            ${translationBadge}
                        </div>
                        
                        <p style="
                            margin: 0; 
                            font-size: 13px; 
                            color: var(--gray-500);
                            overflow: hidden;
                            text-overflow: ellipsis;
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            -webkit-box-orient: vertical;
                        ">
                            ${Utils.escapeHtml(truncatedContent)}
                        </p>
                    </div>
                    
                    <div style="
                        font-size: 12px; 
                        color: var(--gray-400); 
                        background: var(--gray-50);
                        padding: 4px 10px;
                        border-radius: 8px;
                        white-space: nowrap;
                        border: 1px solid var(--gray-200);
                        font-weight: 500;
                    ">
                        ${dateValidated}
                    </div>
                </div>
                
                <!-- Boutons d'action - CHARTE GRAPHIQUE COLORÉE -->
                <div style="
                    display: flex; 
                    gap: 8px; 
                    flex-wrap: wrap;
                    padding-top: 12px;
                    border-top: 1px solid var(--gray-100);
                " onclick="event.stopPropagation();">
                    <button class="action-btn view-btn" 
                            style="font-size: 11px; padding: 6px 12px;"
                            onclick="window.dataManager.viewRapport('${rapport.id}')">
                        👁️ Voir
                    </button>
                    
                    ${rapport.hasPdf ? `
                        <button class="action-btn download-pdf-btn" 
                                style="font-size: 11px; padding: 6px 12px;"
                                onclick="window.dataManager.downloadPDF('${rapport.id}')">
                            📄 PDF
                        </button>
                    ` : ''}
                    
                    <button class="action-btn translate-btn" 
                            style="font-size: 11px; padding: 6px 12px;"
                            onclick="window.dataManager.translateRapport('${rapport.id}')">
                        🌐 Traduire
                    </button>
                    
                    ${originalLink}
                    
                    <button class="action-btn share-btn" 
                            style="font-size: 11px; padding: 6px 12px;"
                            onclick="window.dataManager.shareRapport('${rapport.id}')">
                        📤 Partager
                    </button>
                    
                    <button class="action-btn move-btn" 
                            style="font-size: 11px; padding: 6px 12px;" 
                            onclick="window.dataManager.showMoveFolderModal('${rapport.id}')">
                        📂 Déplacer
                    </button>
                </div>
            </div>
        `;
    }
}