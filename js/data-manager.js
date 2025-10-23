// ============================================
// DATA MANAGER - VERSION SUPABASE COMPLÈTE
// ============================================

class DataManager {
    constructor() {
        this.storageKey = 'rapportsApp';
        this.maxBrouillons = 10;
        this.maxRapports = 20;
        this.currentFolderId = null;
        this.syncInProgress = false;
    }

    // === VÉRIFIER SI ON PEUT UTILISER SUPABASE ===
    
    canUseSupabase() {
        const currentUser = window.appManager?.getCurrentUser();
        return !!(currentUser && currentUser.id && window.supabaseClient);
    }

    getUserId() {
        const currentUser = window.appManager?.getCurrentUser();
        return currentUser?.id || null;
    }

    // === SYNCHRONISATION INITIALE AU LOGIN ===
    
    async syncFromSupabase() {
        if (!this.canUseSupabase() || this.syncInProgress) return;
        
        this.syncInProgress = true;
        console.log('🔄 Synchronisation depuis Supabase...');
        
        try {
            const userId = this.getUserId();
            
            const [draftsResult, reportsResult, foldersResult] = await Promise.all([
                window.supabaseClient.from('drafts').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
                window.supabaseClient.from('reports').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
                window.supabaseClient.from('folders').select('*').eq('user_id', userId).order('created_at', { ascending: false })
            ]);
            
            if (draftsResult.error) throw draftsResult.error;
            if (reportsResult.error) throw reportsResult.error;
            if (foldersResult.error) throw foldersResult.error;
            
            const data = {
                brouillons: (draftsResult.data || []).map(d => this.convertDraftFromSupabase(d)),
                rapports: (reportsResult.data || []).map(r => this.convertReportFromSupabase(r)),
                folders: (foldersResult.data || []).map(f => this.convertFolderFromSupabase(f)),
                lastSaved: new Date().toISOString()
            };
            
            this.saveAppData(data);
            
            console.log('✅ Synchronisation terminée:', {
                brouillons: data.brouillons.length,
                rapports: data.rapports.length,
                folders: data.folders.length
            });
            
            return data;
            
        } catch (error) {
            console.error('❌ Erreur synchronisation:', error);
            Utils.showToast('Erreur de synchronisation. Mode hors ligne activé.', 'warning');
            return this.loadAppData();
        } finally {
            this.syncInProgress = false;
        }
    }

    // === CONVERSION SUPABASE → LOCAL ===
    
    convertDraftFromSupabase(draft) {
        return {
            id: draft.id,
            title: draft.title || t('new.report'),
            generatedReport: draft.generated_report,
            createdAt: draft.created_at,
            sourceType: draft.source_type || 'recording',
            sourceInfo: draft.source_info,
            audioUrl: draft.audio_url,
            status: draft.status || 'generating',
            isModified: draft.is_modified || false
        };
    }
    
    convertReportFromSupabase(report) {
        return {
            id: report.id ? report.id.toString() : Utils.generateId('rapport_'),
            title: report.title,
            content: report.content,
            validatedAt: report.validated_at || report.created_at,
            createdAt: report.created_at,
            folderId: report.folder_id,
            status: report.status,
            sourceType: report.source_type,
            sourceInfo: report.source_info,
            isModified: report.is_modified || false,
            hasPdf: report.has_pdf || false,
            pdfGenerated: report.pdf_generated || false,
            pdfUrl: report.pdf_url,
            isTranslation: report.is_translation || false,
            originalReportId: report.original_report_id,
            translatedTo: report.translated_to,
            detectedLanguage: report.detected_language,
            translatedAt: report.translated_at,
            sharedWith: report.shared_with || []
        };
    }
    
    convertFolderFromSupabase(folder) {
        return {
            id: folder.id.toString(),
            name: folder.name,
            color: folder.color || '#8B1538',
            createdAt: folder.created_at
        };
    }

    // === CONVERSION LOCAL → SUPABASE ===
    
    convertDraftToSupabase(draft) {
        const userId = this.getUserId();
        return {
            id: draft.id,
            user_id: userId,
            title: draft.title,
            generated_report: draft.generatedReport,
            created_at: draft.createdAt || new Date().toISOString(),
            source_type: draft.sourceType || 'recording',
            source_info: draft.sourceInfo,
            audio_url: draft.audioUrl,
            status: draft.status || 'generating',
            is_modified: draft.isModified || false
        };
    }
    
    convertReportToSupabase(report) {
        const userId = this.getUserId();
        return {
            user_id: userId,
            title: report.title,
            content: report.content,
            validated_at: report.validatedAt || new Date().toISOString(),
            created_at: report.createdAt || new Date().toISOString(),
            folder_id: report.folderId || null,
            status: 'validated',
            source_type: report.sourceType || 'recording',
            source_info: report.sourceInfo,
            is_modified: report.isModified || false,
            has_pdf: report.hasPdf || false,
            pdf_generated: report.pdfGenerated || false,
            pdf_url: report.pdfUrl || null,
            is_translation: report.isTranslation || false,
            original_report_id: report.originalReportId || null,
            translated_to: report.translatedTo || null,
            detected_language: report.detectedLanguage || null,
            translated_at: report.translatedAt || null,
            shared_with: report.sharedWith || []
        };
    }
    
    convertFolderToSupabase(folder) {
        const userId = this.getUserId();
        return {
            user_id: userId,
            name: folder.name,
            color: folder.color || '#8B1538',
            created_at: folder.createdAt || new Date().toISOString()
        };
    }

    // === UPLOAD PDF VERS SUPABASE STORAGE ===
    
    async uploadPdfToStorage(pdfData, filename) {
        if (!this.canUseSupabase()) {
            console.warn('⚠️ Supabase non disponible, PDF stocké en localStorage');
            return null;
        }
        
        try {
            console.log('📤 Upload PDF vers Supabase Storage...');
            
            const base64Data = pdfData.includes('base64,') 
                ? pdfData.split('base64,')[1] 
                : pdfData;
            
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            
            const userId = this.getUserId();
            const timestamp = Date.now();
            const safeName = filename.replace(/[^a-z0-9_-]/gi, '_');
            const filePath = `${userId}/${timestamp}_${safeName}.pdf`;
            
            const { data, error } = await window.supabaseClient.storage
                .from('vocalia-files')
                .upload(filePath, blob, {
                    contentType: 'application/pdf',
                    cacheControl: '3600',
                    upsert: false
                });
            
            if (error) throw error;
            
            const { data: urlData } = await window.supabaseClient.storage
                .from('vocalia-files')
                .createSignedUrl(filePath, 31536000);
            
            console.log('✅ PDF uploadé:', urlData.signedUrl);
            return urlData.signedUrl;
            
        } catch (error) {
            console.error('❌ Erreur upload PDF:', error);
            return null;
        }
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
    }// === GESTION DES BROUILLONS ===

    getBrouillons() {
        const data = this.loadAppData();
        return data.brouillons || [];
    }

    async addBrouillon(brouillon) {
        const data = this.loadAppData();
        data.brouillons = data.brouillons || [];
        data.brouillons.unshift(brouillon);
        
        this.saveAppData(data);
        this.updateBrouillonsUI(data.brouillons);
        
        if (this.canUseSupabase()) {
            try {
                const supabaseDraft = this.convertDraftToSupabase(brouillon);
                const { error } = await window.supabaseClient
                    .from('drafts')
                    .insert([supabaseDraft]);
                
                if (error) throw error;
                console.log('✅ Brouillon sauvegardé dans Supabase');
            } catch (error) {
                console.error('❌ Erreur sauvegarde brouillon Supabase:', error);
            }
        }
    }

    async updateBrouillonWithReport(brouillonId, reportContent) {
        const data = this.loadAppData();
        const brouillon = data.brouillons.find(b => b.id === brouillonId);
        
        if (brouillon) {
            brouillon.generatedReport = reportContent;
            brouillon.status = 'ready';
            brouillon.title = this.extractTitleFromContent(reportContent);
            
            this.saveAppData(data);
            this.updateBrouillonsUI(data.brouillons);
            
            if (this.canUseSupabase()) {
                try {
                    const { error } = await window.supabaseClient
                        .from('drafts')
                        .update({
                            generated_report: reportContent,
                            status: 'ready',
                            title: brouillon.title
                        })
                        .eq('id', brouillonId);
                    
                    if (error) throw error;
                    console.log('✅ Brouillon mis à jour dans Supabase');
                } catch (error) {
                    console.error('❌ Erreur mise à jour brouillon:', error);
                }
            }
        }
    }

    async updateBrouillonStatus(brouillonId, status) {
        const data = this.loadAppData();
        const brouillon = data.brouillons.find(b => b.id === brouillonId);
        
        if (brouillon) {
            brouillon.status = status;
            if (status === 'error') {
                brouillon.title = t('drafts.status.error');
            }
            
            this.saveAppData(data);
            this.updateBrouillonsUI(data.brouillons);
            
            if (this.canUseSupabase()) {
                try {
                    const { error } = await window.supabaseClient
                        .from('drafts')
                        .update({ status, title: brouillon.title })
                        .eq('id', brouillonId);
                    
                    if (error) throw error;
                } catch (error) {
                    console.error('❌ Erreur mise à jour status:', error);
                }
            }
        }
    }

    async deleteBrouillon(brouillonId) {
        const data = this.loadAppData();
        data.brouillons = data.brouillons.filter(b => b.id !== brouillonId);
        
        this.saveAppData(data);
        this.updateBrouillonsUI(data.brouillons);
        Utils.showToast(t('toast.draft.deleted'), 'success');
        
        if (this.canUseSupabase()) {
            try {
                const { error } = await window.supabaseClient
                    .from('drafts')
                    .delete()
                    .eq('id', brouillonId);
                
                if (error) throw error;
                console.log('✅ Brouillon supprimé de Supabase');
            } catch (error) {
                console.error('❌ Erreur suppression brouillon:', error);
            }
        }
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

    async saveEditedBrouillon(brouillonId, buttonElement) {
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
            
            if (this.canUseSupabase()) {
                try {
                    const { error } = await window.supabaseClient
                        .from('drafts')
                        .update({
                            title: newTitle,
                            generated_report: newContent,
                            is_modified: true
                        })
                        .eq('id', brouillonId);
                    
                    if (error) throw error;
                    console.log('✅ Brouillon édité dans Supabase');
                } catch (error) {
                    console.error('❌ Erreur édition brouillon:', error);
                }
            }
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
                pdfGenerated: false,
                pdfUrl: null
            };

            try {
                Utils.showToast(t('toast.report.pdf.generating'), 'info');
                const pdf = await Utils.generatePDF(rapport.title, rapport.content);
                
                if (this.canUseSupabase()) {
                    const pdfUrl = await this.uploadPdfToStorage(
                        pdf.output('datauristring'), 
                        rapport.title
                    );
                    
                    if (pdfUrl) {
                        rapport.pdfUrl = pdfUrl;
                        rapport.hasPdf = true;
                        rapport.pdfGenerated = true;
                        console.log('✅ PDF uploadé vers Supabase Storage');
                    } else {
                        rapport.pdfData = pdf.output('datauristring');
                        rapport.hasPdf = true;
                        rapport.pdfGenerated = true;
                    }
                } else {
                    rapport.pdfData = pdf.output('datauristring');
                    rapport.hasPdf = true;
                    rapport.pdfGenerated = true;
                }
                
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
            
            if (this.canUseSupabase()) {
                try {
                    const userId = this.getUserId();
                    const currentUser = window.appManager?.getCurrentUser();
                    
                    const supabaseReport = this.convertReportToSupabase(rapport);
                    const { data: insertedReport, error: reportError } = await window.supabaseClient
                        .from('reports')
                        .insert([supabaseReport])
                        .select()
                        .single();
                    
                    if (reportError) throw reportError;
                    console.log('✅ Rapport sauvegardé dans Supabase:', insertedReport.id);
                    
                    await window.supabaseClient
                        .from('drafts')
                        .delete()
                        .eq('id', brouillonId);
                    
                    if (currentUser && currentUser.subscription_plan === 'free') {
                        const { data: profileData, error: fetchError } = await window.supabaseClient
                            .from('profiles')
                            .select('reports_this_month')
                            .eq('id', userId)
                            .single();
                        
                        if (!fetchError) {
                            const newCount = (profileData.reports_this_month || 0) + 1;
                            
                            await window.supabaseClient
                                .from('profiles')
                                .update({ reports_this_month: newCount })
                                .eq('id', userId);
                            
                            console.log(`✅ Compteur mis à jour: ${newCount}/5`);
                            
                            if (window.appManager?.profileManager) {
                                await window.appManager.profileManager.loadProfile(userId);
                            }
                        }
                    }
                } catch (error) {
                    console.error('❌ Erreur sauvegarde rapport Supabase:', error);
                }
            }
        }
    }

    // === GESTION DES RAPPORTS ===

    getRapports() {
        const data = this.loadAppData();
        return data.rapports || [];
    }

    // === GESTION DES DOSSIERS ===

    getFolders() {
        const data = this.loadAppData();
        return data.folders || [];
    }async createFolder(folderName) {
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
        
        if (this.canUseSupabase()) {
            try {
                const supabaseFolder = this.convertFolderToSupabase(folder);
                const { data: insertedFolder, error } = await window.supabaseClient
                    .from('folders')
                    .insert([supabaseFolder])
                    .select()
                    .single();
                
                if (error) throw error;
                
                folder.id = insertedFolder.id.toString();
                data.folders[data.folders.length - 1] = folder;
                this.saveAppData(data);
                
                console.log('✅ Dossier sauvegardé dans Supabase:', insertedFolder.id);
            } catch (error) {
                console.error('❌ Erreur création dossier Supabase:', error);
            }
        }
        
        return folder;
    }

    async deleteFolder(folderId) {
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
        
        if (this.currentFolderId === folderId) {
            this.closeFolder();
        } else {
            this.updateRapportsUI(data.rapports);
        }
        
        Utils.showToast(t('toast.folder.deleted'), 'success');
        
        if (this.canUseSupabase()) {
            try {
                await window.supabaseClient
                    .from('reports')
                    .update({ folder_id: null })
                    .eq('folder_id', folderId);
                
                const { error } = await window.supabaseClient
                    .from('folders')
                    .delete()
                    .eq('id', parseInt(folderId));
                
                if (error) throw error;
                console.log('✅ Dossier supprimé de Supabase');
            } catch (error) {
                console.error('❌ Erreur suppression dossier:', error);
            }
        }
    }

    getRandomFolderColor() {
        const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getReportsCountText(count) {
        if (count === 0) {
            return window.t('folder.reports.count', { count: 0 });
        } else if (count === 1) {
            return window.t('folder.reports.count', { count: 1 });
        } else {
            return window.t('folder.reports.count.plural', { count: count });
        }
    }

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

    async saveFolderRename(folderId, buttonElement) {
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
            
            if (this.canUseSupabase()) {
                try {
                    const { error } = await window.supabaseClient
                        .from('folders')
                        .update({ name: newName })
                        .eq('id', parseInt(folderId));
                    
                    if (error) throw error;
                    console.log('✅ Dossier renommé dans Supabase');
                } catch (error) {
                    console.error('❌ Erreur renommage dossier:', error);
                }
            }
        }
    }

    async moveRapportToFolder(rapportId, newFolderId) {
        const data = this.loadAppData();
        const rapport = data.rapports.find(r => r.id === rapportId);
        
        if (rapport) {
            rapport.folderId = newFolderId;
            this.saveAppData(data);
            this.updateRapportsUI(data.rapports);
            
            const folderName = newFolderId ? data.folders.find(f => f.id === newFolderId)?.name : t('folder.none');
            Utils.showToast(t('toast.report.moved', { folder: folderName }), 'success');
            
            if (this.canUseSupabase()) {
                try {
                    const { error } = await window.supabaseClient
                        .from('reports')
                        .update({ folder_id: newFolderId })
                        .eq('id', parseInt(rapportId));
                    
                    if (error) throw error;
                    console.log('✅ Rapport déplacé dans Supabase');
                } catch (error) {
                    console.error('❌ Erreur déplacement rapport:', error);
                }
            }
        }
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

    async downloadPDF(rapportId) {
        const data = this.loadAppData();
        const rapport = data.rapports.find(r => r.id === rapportId);
        
        if (!rapport) return;
        
        if (rapport.pdfUrl) {
            try {
                Utils.showToast(t('toast.report.pdf.downloading'), 'info');
                
                const link = document.createElement('a');
                link.href = rapport.pdfUrl;
                link.download = `${rapport.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
                link.target = '_blank';
                link.click();
                
                Utils.showToast(t('toast.report.pdf.downloaded'), 'success');
                return;
            } catch (error) {
                console.error('❌ Erreur téléchargement PDF:', error);
            }
        }
        
        if (rapport.pdfData) {
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

    async shareRapport(rapportId) {
        const data = this.loadAppData();
        const rapport = data.rapports.find(r => r.id === rapportId);
        
        if (!rapport) return;
        
        if (rapport.pdfUrl) {
            try {
                if (navigator.share) {
                    await navigator.share({
                        title: rapport.title,
                        text: `${t('new.report')}: ${rapport.title}`,
                        url: rapport.pdfUrl
                    });
                    Utils.showToast(t('toast.report.shared'), 'success');
                    return;
                } else {
                    await Utils.copyToClipboard(rapport.pdfUrl);
                    Utils.showToast('Lien PDF copié dans le presse-papier', 'success');
                    return;
                }
            } catch (error) {
                console.error('Erreur partage PDF:', error);
            }
        }
        
        this.shareRapportAsText(rapport);
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
                    <option value="en">🇬🇧 English</option>
                    <option value="fr">🇫🇷 Français</option>
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
            
            const response = await fetch(CONFIG.N8N_TRANSLATE_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reportId: rapportId,
                    title: rapport.title,
                    content: rapport.content,
                    targetLanguage: targetLang,
                    userId: window.appManager?.getCurrentUser()?.id || 'unknown',
                    timestamp: new Date().toISOString()
                })
            });
            
            if (!response.ok) {
                throw new Error(`Erreur N8n: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error('La traduction a échoué côté serveur');
            }
            
            const translatedRapport = {
                id: Utils.generateId('rapport_translated_'),
                title: result.translatedTitle || `[${targetLang.toUpperCase()}] ${rapport.title}`,
                content: result.translatedContent || result.content,
                validatedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                
                isTranslation: true,
                originalReportId: rapportId,
                detectedLanguage: result.detectedSourceLanguage || 'unknown',
                translatedTo: targetLang,
                translatedAt: new Date().toISOString(),
                
                folderId: rapport.folderId,
                
                hasPdf: false,
                pdfGenerated: false,
                pdfUrl: null
            };
            
            modal.remove();
            
            try {
                Utils.showToast(t('toast.report.pdf.generating'), 'info', 2000);
                const pdf = await Utils.generatePDF(translatedRapport.title, translatedRapport.content);
                
                if (this.canUseSupabase()) {
                    const pdfUrl = await this.uploadPdfToStorage(
                        pdf.output('datauristring'),
                        translatedRapport.title
                    );
                    
                    if (pdfUrl) {
                        translatedRapport.pdfUrl = pdfUrl;
                        translatedRapport.hasPdf = true;
                        translatedRapport.pdfGenerated = true;
                    } else {
                        translatedRapport.pdfData = pdf.output('datauristring');
                        translatedRapport.hasPdf = true;
                        translatedRapport.pdfGenerated = true;
                    }
                } else {
                    translatedRapport.pdfData = pdf.output('datauristring');
                    translatedRapport.hasPdf = true;
                    translatedRapport.pdfGenerated = true;
                }
            } catch (pdfError) {
                console.warn('Erreur génération PDF:', pdfError);
            }
            
            data.rapports.unshift(translatedRapport);
            this.saveAppData(data);
            this.updateRapportsUI(data.rapports);
            
            const langName = this.getLanguageName(targetLang);
            Utils.showToast(t('toast.translate.success', { lang: langName }), 'success');
            
            if (this.canUseSupabase()) {
                try {
                    const supabaseReport = this.convertReportToSupabase(translatedRapport);
                    const { error } = await window.supabaseClient
                        .from('reports')
                        .insert([supabaseReport]);
                    
                    if (error) throw error;
                    console.log('✅ Traduction sauvegardée dans Supabase');
                } catch (error) {
                    console.error('❌ Erreur sauvegarde traduction:', error);
                }
            }
            
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
                                    ${this.getLanguageName(original.detectedLanguage || translated.detectedLanguage)}
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

    loadBrouillonsData() {
        const brouillons = this.getBrouillons();
        this.updateBrouillonsUI(brouillons);
    }

    loadRapportsData() {
        const rapports = this.getRapports();
        this.updateRapportsUI(rapports);
    }

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

    exportRapport(id) {
        this.downloadPDF(id);
    }

    // === AFFICHAGE DES BROUILLONS ===
    
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

    // === AFFICHAGE DES RAPPORTS ===
    
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

        const data = this.loadAppData();
        const folders = data.folders || [];

        if (this.currentFolderId) {
            const currentFolder = folders.find(f => f.id === this.currentFolderId);
            const folderRapports = rapports.filter(r => r.folderId === this.currentFolderId);
            
            container.innerHTML = `
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

        const rapportsSansDossier = rapports.filter(r => !r.folderId);
        
        let html = '';

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

    renderRapportCard(rapport) {
        const dateValidated = new Date(rapport.validatedAt).toLocaleDateString();
        const truncatedContent = Utils.truncateText(rapport.content, 150);
        
        let sourceIcon = '🎤';
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

    renderRapportCardCompact(rapport) {
        const dateValidated = new Date(rapport.validatedAt).toLocaleDateString();
        const truncatedContent = Utils.truncateText(rapport.content, 150);
        
        let sourceIcon = '🎤';
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
                    padding: 3px 8px; 
                    border-radius: 10px; 
                    font-size: 10px; 
                    font-weight: 700;
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