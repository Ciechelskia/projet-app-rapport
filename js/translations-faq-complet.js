// VOCALIA - FAQ TRANSLATIONS COMPLETE (30 questions x 4 langues)
const faqTranslations = {
    fr: {
        nav: { features: "Fonctionnalités", demo: "Démo", pricing: "Tarifs", faq: "FAQ", login: "Connexion", start: "Commencer" },
        footer: { product: "Produit", features: "Fonctionnalités", pricing: "Tarifs", application: "Application", support: "Support", contact: "Contact", documentation: "Documentation", faq: "FAQ", legal: "Légal", privacy: "Confidentialité", terms: "CGU", legal_notices: "Mentions légales", made_with: "Fait avec", in_france: "en France", rights: "Tous droits réservés" },
        faq: {
            title: "Questions Fréquentes", subtitle: "Trouvez rapidement des réponses à vos questions", search_placeholder: "Rechercher une question...", all: "Toutes", questions: "questions", no_results: "Aucun résultat", no_results_desc: "Essayez avec d'autres mots-clés",
            categories: { pricing: "Abonnement", usage: "Utilisation", reports: "Rapports", multilingual: "Multilingue", security: "Sécurité", technical: "Technique" },
            q1: { question: "Quelle est la différence entre le plan FREE et PRO ?", answer: "Le plan FREE limite à 5 rapports par mois, 1 seule langue, et n'inclut pas les dossiers ni la traduction automatique. Le plan PRO offre des rapports illimités, 6 langues, traduction automatique, système de dossiers, partage de rapports, et support prioritaire pour 49€/mois." },
            q2: { question: "Combien coûte VOCALIA ?", answer: "VOCALIA propose 3 plans : FREE (0€/mois, 5 rapports max), PRO (49€/mois ou 490€/an, rapports illimités), et Entreprise (sur devis, à partir de 499€/mois avec fonctionnalités sur mesure)." },
            q3: { question: "Comment fonctionne la limite de 5 rapports du plan FREE ?", answer: "Le compteur se réinitialise automatiquement le 1er de chaque mois. Une fois 5 rapports générés, vous verrez un message vous invitant à upgrader vers PRO pour continuer à créer des rapports." },
            q4: { question: "Puis-je passer du plan FREE au plan PRO à tout moment ?", answer: "Oui, vous pouvez upgrader instantanément vers le plan PRO depuis votre tableau de bord. L'upgrade est immédiat et vous bénéficiez de toutes les fonctionnalités PRO dès le paiement effectué." },
            q5: { question: "Y a-t-il une réduction pour l'abonnement annuel ?", answer: "Oui ! L'abonnement annuel PRO coûte 490€/an au lieu de 588€ (12 x 49€), soit une économie de 2 mois. Vous économisez environ 17% en payant annuellement." },
            q6: { question: "Puis-je annuler mon abonnement PRO à tout moment ?", answer: "Oui, vous pouvez annuler à tout moment depuis vos paramètres. L'annulation prend effet à la fin de votre période de facturation en cours. Vous gardez l'accès aux fonctionnalités PRO jusqu'à cette date." },
            q7: { question: "Que se passe-t-il avec mes rapports si je repasse au plan FREE ?", answer: "Tous vos rapports existants restent accessibles en consultation et téléchargement. Cependant, vous perdez l'accès aux dossiers personnalisés et à la traduction automatique. Vous ne pourrez créer que 5 nouveaux rapports par mois." },
            q8: { question: "Le plan Entreprise, c'est pour qui ?", answer: "Le plan Entreprise est idéal pour les grandes organisations, réseaux de franchises ou multinationales. Il inclut le white-label, un agent IA personnalisé, des templates sur mesure, un support 24/7 dédié, et des intégrations CRM personnalisées. Contactez-nous pour un devis." },
            q9: { question: "Comment créer mon premier rapport ?", answer: "C'est très simple ! Connectez-vous, cliquez sur 'Nouveau rapport', appuyez sur le bouton microphone rouge pour enregistrer votre visite client en parlant naturellement, puis cliquez sur 'Stop' quand vous avez terminé. L'IA transcrit et génère automatiquement un rapport professionnel en quelques secondes." },
            q10: { question: "Y a-t-il une durée maximale d'enregistrement ?", answer: "Non, il n'y a pas de limite de durée d'enregistrement. Vous pouvez enregistrer aussi longtemps que nécessaire pour capturer l'intégralité de votre rendez-vous client. L'IA traite les enregistrements longs sans problème." },
            q11: { question: "Que sont les brouillons et comment fonctionnent-ils ?", answer: "Les brouillons sont des enregistrements sauvegardés automatiquement avant d'être transformés en rapport final. Vous pouvez les éditer manuellement, ajouter des notes, puis les valider pour générer le rapport PDF. Cela vous permet de vérifier et modifier avant la génération finale." },
            q12: { question: "Puis-je mettre en pause un enregistrement en cours ?", answer: "Oui, vous pouvez mettre en pause et reprendre un enregistrement à tout moment. L'enregistrement est sauvegardé automatiquement en brouillon, vous permettant de continuer plus tard ou de le finaliser quand vous êtes prêt." },
            q13: { question: "VOCALIA fonctionne-t-il hors ligne ?", answer: "VOCALIA fonctionne partiellement hors ligne grâce à la technologie PWA (Progressive Web App). Vous pouvez enregistrer vos visites hors ligne, et les enregistrements seront synchronisés et traités automatiquement dès que vous retrouvez une connexion internet." },
            q14: { question: "Sur combien d'appareils puis-je utiliser VOCALIA ?", answer: "Vous pouvez utiliser VOCALIA sur maximum 2 appareils (ordinateur, smartphone, tablette) avec le même compte. Vos données se synchronisent automatiquement entre vos appareils. Si vous avez besoin de plus d'appareils, contactez-nous pour le plan Entreprise." },
            q15: { question: "Quelle qualité audio est recommandée ?", answer: "L'IA fonctionne très bien avec l'audio standard d'un smartphone moderne. Pour de meilleurs résultats, évitez les environnements trop bruyants et parlez clairement. La visualisation en temps réel (waveform) vous aide à vérifier que le son est bien capté." },
            q16: { question: "Que contient un rapport généré par VOCALIA ?", answer: "Chaque rapport inclut automatiquement : un titre généré intelligemment, un résumé exécutif, les points clés de la visite, les actions à suivre, et une conclusion. Le tout est structuré professionnellement et exportable en PDF immédiatement." },
            q17: { question: "Puis-je modifier un rapport après sa génération ?", answer: "Oui, vous pouvez éditer manuellement les brouillons avant de les valider en rapport final. Une fois validé, le rapport PDF est figé, mais vous pouvez toujours le consulter, le télécharger ou le partager. Pour faire des modifications, créez un nouveau rapport." },
            q18: { question: "Comment fonctionnent les dossiers ?", answer: "Les dossiers (disponibles en plan PRO uniquement) vous permettent d'organiser vos rapports par client, projet, date ou tout autre critère. Vous pouvez créer un nombre illimité de dossiers, leur attribuer des couleurs pour identification rapide, et les renommer ou supprimer à tout moment." },
            q19: { question: "Puis-je partager mes rapports avec mon équipe ?", answer: "Oui, avec le plan PRO, vous pouvez partager vos rapports via un lien sécurisé. Vous pouvez également télécharger le PDF et l'envoyer par email. Le plan Entreprise offre des fonctionnalités de collaboration avancées avec partage d'équipe." },
            q20: { question: "Combien de temps mes rapports sont-ils conservés ?", answer: "Vos rapports sont conservés indéfiniment tant que votre compte est actif. Le plan PRO offre un historique complet, tandis que le plan FREE conserve tous les rapports créés. Vous pouvez supprimer manuellement les rapports dont vous n'avez plus besoin." },
            q21: { question: "Puis-je personnaliser le design de mes rapports ?", answer: "Le plan PRO permet d'ajouter votre logo personnalisé sur les rapports PDF. Le plan Entreprise offre des templates de rapports entièrement personnalisables avec votre charte graphique, vos couleurs, et votre mise en page sur mesure." },
            q22: { question: "Quelles langues sont supportées par VOCALIA ?", answer: "VOCALIA supporte 6 langues : Français, Anglais, Chinois simplifié, Japonais, Espagnol et Allemand. Le plan FREE vous limite à 1 langue (celle choisie à l'inscription), tandis que le plan PRO donne accès aux 6 langues avec traduction automatique." },
            q23: { question: "Comment fonctionne la traduction automatique des rapports ?", answer: "Avec le plan PRO, vous pouvez traduire automatiquement vos rapports dans n'importe laquelle des 6 langues supportées. La traduction génère un nouveau PDF traduit tout en conservant un lien vers le rapport original. Idéal pour les clients internationaux !" },
            q24: { question: "Puis-je parler dans une langue et obtenir le rapport dans une autre ?", answer: "Oui ! L'IA détecte automatiquement la langue de votre enregistrement. Avec le plan PRO, vous pouvez ensuite traduire le rapport généré dans n'importe quelle autre langue supportée. Par exemple, enregistrez en français et obtenez un rapport en anglais pour vos clients internationaux." },
            q25: { question: "Comment changer la langue de l'interface VOCALIA ?", answer: "La langue de l'interface est détectée automatiquement selon votre navigateur. Vous pouvez la changer à tout moment via le sélecteur de langue en haut à droite. Le changement est instantané et affecte toute l'interface de l'application." },
            q26: { question: "Mes données sont-elles sécurisées ?", answer: "Oui, absolument. VOCALIA utilise Supabase Auth pour une authentification sécurisée avec mots de passe cryptés. Toutes vos données sont protégées par RLS (Row Level Security) garantissant l'isolation totale entre utilisateurs. Vos enregistrements et rapports ne sont jamais partagés ni utilisés pour entraîner l'IA." },
            q27: { question: "Ai-je besoin de confirmer mon email ?", answer: "Oui, la confirmation d'email est obligatoire lors de l'inscription. Vous recevrez un email avec un lien de confirmation à cliquer. Cette mesure garantit la sécurité de votre compte et permet la récupération de mot de passe si nécessaire." },
            q28: { question: "Que se passe-t-il si je supprime mon compte ?", answer: "Si vous supprimez votre compte, toutes vos données (enregistrements, rapports, brouillons, dossiers) sont définitivement supprimées de nos serveurs. Cette action est irréversible. Pensez à exporter vos rapports importants avant la suppression." },
            q29: { question: "Sur quels navigateurs VOCALIA fonctionne-t-il ?", answer: "VOCALIA fonctionne sur tous les navigateurs modernes : Chrome, Firefox, Safari, et Edge (versions récentes). Pour une expérience optimale avec l'enregistrement audio, nous recommandons Chrome ou Firefox. VOCALIA est également disponible en application PWA installable sur mobile et desktop." },
            q30: { question: "Qu'est-ce que la PWA et comment l'installer ?", answer: "PWA (Progressive Web App) permet d'installer VOCALIA comme une vraie application sur votre smartphone ou ordinateur. Sur mobile, cliquez sur 'Ajouter à l'écran d'accueil' dans le menu de votre navigateur. Sur desktop, Chrome et Edge proposent un bouton 'Installer' dans la barre d'adresse. L'app installée charge ultra-rapidement et fonctionne partiellement hors ligne." }
        }
    },
    en: {
        nav: { features: "Features", demo: "Demo", pricing: "Pricing", faq: "FAQ", login: "Login", start: "Get Started" },
        footer: { product: "Product", features: "Features", pricing: "Pricing", application: "Application", support: "Support", contact: "Contact", documentation: "Documentation", faq: "FAQ", legal: "Legal", privacy: "Privacy", terms: "Terms", legal_notices: "Legal Notices", made_with: "Made with", in_france: "in France", rights: "All rights reserved" },
        faq: {
            title: "Frequently Asked Questions", subtitle: "Find answers to your questions quickly", search_placeholder: "Search a question...", all: "All", questions: "questions", no_results: "No results", no_results_desc: "Try with different keywords",
            categories: { pricing: "Pricing", usage: "Usage", reports: "Reports", multilingual: "Multilingual", security: "Security", technical: "Technical" },
            q1: { question: "What's the difference between FREE and PRO plans?", answer: "FREE plan limits to 5 reports per month, 1 language only, and doesn't include folders or automatic translation. PRO plan offers unlimited reports, 6 languages, automatic translation, folder system, report sharing, and priority support for €49/month." },
            q2: { question: "How much does VOCALIA cost?", answer: "VOCALIA offers 3 plans: FREE (€0/month, 5 reports max), PRO (€49/month or €490/year, unlimited reports), and Enterprise (on quote, starting at €499/month with custom features)." },
            q3: { question: "How does the 5-report limit work on FREE plan?", answer: "The counter resets automatically on the 1st of each month. Once 5 reports are generated, you'll see a message inviting you to upgrade to PRO to continue creating reports." },
            q4: { question: "Can I upgrade from FREE to PRO anytime?", answer: "Yes, you can upgrade instantly to PRO from your dashboard. The upgrade is immediate and you get all PRO features as soon as payment is processed." },
            q5: { question: "Is there a discount for annual subscription?", answer: "Yes! Annual PRO subscription costs €490/year instead of €588 (12 x €49), saving you 2 months. You save about 17% by paying annually." },
            q6: { question: "Can I cancel my PRO subscription anytime?", answer: "Yes, you can cancel anytime from your settings. Cancellation takes effect at the end of your current billing period. You keep access to PRO features until that date." },
            q7: { question: "What happens to my reports if I downgrade to FREE?", answer: "All your existing reports remain accessible for viewing and download. However, you lose access to custom folders and automatic translation. You can only create 5 new reports per month." },
            q8: { question: "Who is the Enterprise plan for?", answer: "Enterprise plan is ideal for large organizations, franchise networks, or multinationals. It includes white-label, custom AI agent, bespoke templates, 24/7 dedicated support, and custom CRM integrations. Contact us for a quote." },
            q9: { question: "How do I create my first report?", answer: "It's very simple! Log in, click 'New report', press the red microphone button to record your client visit while speaking naturally, then click 'Stop' when finished. AI transcribes and automatically generates a professional report in seconds." },
            q10: { question: "Is there a maximum recording duration?", answer: "No, there's no recording time limit. You can record as long as needed to capture your entire client meeting. AI processes long recordings without issues." },
            q11: { question: "What are drafts and how do they work?", answer: "Drafts are recordings automatically saved before being turned into final reports. You can edit them manually, add notes, then validate to generate the PDF report. This lets you review and modify before final generation." },
            q12: { question: "Can I pause a recording in progress?", answer: "Yes, you can pause and resume a recording anytime. The recording is automatically saved as a draft, allowing you to continue later or finalize when ready." },
            q13: { question: "Does VOCALIA work offline?", answer: "VOCALIA works partially offline thanks to PWA (Progressive Web App) technology. You can record visits offline, and recordings will be synchronized and processed automatically once you're back online." },
            q14: { question: "On how many devices can I use VOCALIA?", answer: "You can use VOCALIA on maximum 2 devices (computer, smartphone, tablet) with the same account. Your data syncs automatically between devices. If you need more devices, contact us for Enterprise plan." },
            q15: { question: "What audio quality is recommended?", answer: "AI works great with standard smartphone audio. For best results, avoid very noisy environments and speak clearly. Real-time visualization (waveform) helps verify sound is properly captured." },
            q16: { question: "What does a VOCALIA-generated report contain?", answer: "Each report automatically includes: an intelligently generated title, executive summary, key visit points, action items, and conclusion. Everything is professionally structured and immediately exportable to PDF." },
            q17: { question: "Can I edit a report after generation?", answer: "Yes, you can manually edit drafts before validating them as final reports. Once validated, the PDF report is frozen, but you can still view, download, or share it. To make changes, create a new report." },
            q18: { question: "How do folders work?", answer: "Folders (PRO plan only) let you organize reports by client, project, date or any criteria. You can create unlimited folders, assign colors for quick identification, and rename or delete them anytime." },
            q19: { question: "Can I share reports with my team?", answer: "Yes, with PRO plan you can share reports via secure link. You can also download PDF and email it. Enterprise plan offers advanced collaboration features with team sharing." },
            q20: { question: "How long are my reports kept?", answer: "Your reports are kept indefinitely while your account is active. PRO plan offers complete history, while FREE plan keeps all created reports. You can manually delete reports you no longer need." },
            q21: { question: "Can I customize my report design?", answer: "PRO plan allows adding your custom logo to PDF reports. Enterprise plan offers fully customizable report templates with your brand guidelines, colors, and custom layout." },
            q22: { question: "Which languages does VOCALIA support?", answer: "VOCALIA supports 6 languages: French, English, Simplified Chinese, Japanese, Spanish and German. FREE plan limits you to 1 language (chosen at signup), while PRO plan gives access to all 6 languages with automatic translation." },
            q23: { question: "How does automatic report translation work?", answer: "With PRO plan, you can automatically translate reports into any of the 6 supported languages. Translation generates a new translated PDF while keeping a link to the original report. Perfect for international clients!" },
            q24: { question: "Can I speak in one language and get the report in another?", answer: "Yes! AI automatically detects your recording language. With PRO plan, you can then translate the generated report into any other supported language. For example, record in French and get an English report for your international clients." },
            q25: { question: "How do I change VOCALIA interface language?", answer: "Interface language is automatically detected from your browser. You can change it anytime via the language selector at top right. Change is instant and affects the entire application interface." },
            q26: { question: "Is my data secure?", answer: "Yes, absolutely. VOCALIA uses Supabase Auth for secure authentication with encrypted passwords. All your data is protected by RLS (Row Level Security) ensuring complete isolation between users. Your recordings and reports are never shared or used to train AI." },
            q27: { question: "Do I need to confirm my email?", answer: "Yes, email confirmation is mandatory at signup. You'll receive an email with a confirmation link to click. This ensures your account security and enables password recovery if needed." },
            q28: { question: "What happens if I delete my account?", answer: "If you delete your account, all your data (recordings, reports, drafts, folders) is permanently deleted from our servers. This action is irreversible. Remember to export important reports before deletion." },
            q29: { question: "Which browsers does VOCALIA work on?", answer: "VOCALIA works on all modern browsers: Chrome, Firefox, Safari, and Edge (recent versions). For optimal audio recording experience, we recommend Chrome or Firefox. VOCALIA is also available as PWA app installable on mobile and desktop." },
            q30: { question: "What is PWA and how to install it?", answer: "PWA (Progressive Web App) lets you install VOCALIA like a real app on your smartphone or computer. On mobile, click 'Add to home screen' in your browser menu. On desktop, Chrome and Edge offer an 'Install' button in address bar. Installed app loads ultra-fast and works partially offline." }
        }
    },
    zh: {
        nav: { features: "功能", demo: "演示", pricing: "价格", faq: "常见问题", login: "登录", start: "开始使用" },
        footer: { product: "产品", features: "功能", pricing: "价格", application: "应用", support: "支持", contact: "联系", documentation: "文档", faq: "常见问题", legal: "法律", privacy: "隐私", terms: "条款", legal_notices: "法律声明", made_with: "制作于", in_france: "法国", rights: "版权所有" },
        faq: {
            title: "常见问题", subtitle: "快速找到问题答案", search_placeholder: "搜索问题...", all: "全部", questions: "问题", no_results: "无结果", no_results_desc: "请尝试其他关键词",
            categories: { pricing: "订阅", usage: "使用", reports: "报告", multilingual: "多语言", security: "安全", technical: "技术" },
            q1: { question: "免费版和专业版有什么区别？", answer: "免费版限制每月5份报告、仅1种语言，不包含文件夹和自动翻译。专业版提供无限报告、6种语言、自动翻译、文件夹系统、报告分享和优先支持，每月49欧元。" },
            q2: { question: "VOCALIA的价格是多少？", answer: "VOCALIA提供3个套餐：免费版（0欧元/月，最多5份报告）、专业版（49欧元/月或490欧元/年，无限报告）和企业版（定制报价，起价499欧元/月，包含定制功能）。" },
            q3: { question: "免费版的5份报告限制如何运作？", answer: "计数器在每月1号自动重置。生成5份报告后，您将看到提示消息邀请升级到专业版以继续创建报告。" },
            q4: { question: "我可以随时从免费版升级到专业版吗？", answer: "是的，您可以从仪表板立即升级到专业版。升级立即生效，付款完成后即可使用所有专业版功能。" },
            q5: { question: "年度订阅有折扣吗？", answer: "有！年度专业版订阅费用为490欧元/年，而非588欧元（12 x 49欧元），节省2个月费用。年付可节省约17%。" },
            q6: { question: "我可以随时取消专业版订阅吗？", answer: "是的，您可以随时从设置中取消。取消在当前计费周期结束时生效。在该日期之前您仍可使用专业版功能。" },
            q7: { question: "如果我降级到免费版，我的报告会怎样？", answer: "您所有现有报告仍可查看和下载。但您将失去对自定义文件夹和自动翻译的访问权限。您每月只能创建5份新报告。" },
            q8: { question: "企业版适合谁？", answer: "企业版适合大型组织、连锁加盟网络或跨国公司。包含白标签、定制AI代理、定制模板、24/7专属支持和定制CRM集成。请联系我们获取报价。" },
            q9: { question: "如何创建我的第一份报告？", answer: "非常简单！登录后点击新建报告，按下红色麦克风按钮自然讲述您的客户访问，完成后点击停止。AI会自动转录并在几秒钟内生成专业报告。" },
            q10: { question: "录音有最大时长限制吗？", answer: "没有录音时长限制。您可以根据需要录制任意时长以完整记录客户会议。AI可以处理长时间录音。" },
            q11: { question: "什么是草稿，它们如何运作？", answer: "草稿是在转换为最终报告之前自动保存的录音。您可以手动编辑它们，添加笔记，然后验证以生成PDF报告。这让您可以在最终生成前审查和修改。" },
            q12: { question: "我可以暂停正在进行的录音吗？", answer: "是的，您可以随时暂停和恢复录音。录音会自动保存为草稿，让您可以稍后继续或在准备好时完成。" },
            q13: { question: "VOCALIA可以离线使用吗？", answer: "得益于PWA技术，VOCALIA可以部分离线使用。您可以离线录制访问，一旦恢复网络连接，录音将自动同步和处理。" },
            q14: { question: "我可以在多少设备上使用VOCALIA？", answer: "您可以使用同一账户在最多2台设备上使用VOCALIA。您的数据会在设备间自动同步。如需更多设备，请联系我们了解企业版。" },
            q15: { question: "推荐什么音频质量？", answer: "AI可以很好地处理现代智能手机的标准音频。为获得最佳效果，避免过于嘈杂的环境并清晰讲话。实时可视化帮助您验证声音是否被正确捕获。" },
            q16: { question: "VOCALIA生成的报告包含什么？", answer: "每份报告自动包含：智能生成的标题、执行摘要、访问要点、行动项目和结论。所有内容都经过专业结构化处理，可立即导出为PDF。" },
            q17: { question: "生成后我可以编辑报告吗？", answer: "是的，您可以在将草稿验证为最终报告之前手动编辑它们。验证后，PDF报告将被锁定，但您仍可查看、下载或分享。要进行修改，请创建新报告。" },
            q18: { question: "文件夹如何工作？", answer: "文件夹（仅限专业版）让您可以按客户、项目、日期或任何标准组织报告。您可以创建无限数量的文件夹，分配颜色以便快速识别，并随时重命名或删除它们。" },
            q19: { question: "我可以与团队分享报告吗？", answer: "是的，使用专业版您可以通过安全链接分享报告。您也可以下载PDF并通过电子邮件发送。企业版提供具有团队分享功能的高级协作特性。" },
            q20: { question: "我的报告会保存多久？", answer: "只要您的账户处于活跃状态，您的报告就会无限期保存。专业版提供完整历史记录，而免费版保留所有已创建的报告。您可以手动删除不再需要的报告。" },
            q21: { question: "我可以自定义报告设计吗？", answer: "专业版允许在PDF报告上添加您的自定义徽标。企业版提供完全可定制的报告模板，包含您的品牌指南、颜色和自定义布局。" },
            q22: { question: "VOCALIA支持哪些语言？", answer: "VOCALIA支持6种语言：法语、英语、简体中文、日语、西班牙语和德语。免费版限制您使用1种语言，而专业版提供所有6种语言的访问和自动翻译。" },
            q23: { question: "报告自动翻译如何工作？", answer: "使用专业版，您可以将报告自动翻译成6种支持语言中的任何一种。翻译会生成新的翻译PDF，同时保留指向原始报告的链接。非常适合国际客户！" },
            q24: { question: "我可以用一种语言讲话并获得另一种语言的报告吗？", answer: "可以！AI会自动检测您的录音语言。使用专业版，您可以将生成的报告翻译成任何其他支持的语言。例如，用法语录制并获得英文报告供您的国际客户使用。" },
            q25: { question: "如何更改VOCALIA界面语言？", answer: "界面语言会根据您的浏览器自动检测。您可以随时通过右上角的语言选择器更改它。更改是即时的，会影响整个应用程序界面。" },
            q26: { question: "我的数据安全吗？", answer: "是的，绝对安全。VOCALIA使用Supabase Auth进行加密密码的安全认证。您的所有数据都受RLS保护，确保用户之间完全隔离。您的录音和报告永远不会被共享或用于训练AI。" },
            q27: { question: "我需要确认电子邮件吗？", answer: "是的，注册时必须确认电子邮件。您将收到一封带有确认链接的电子邮件需要点击。这确保了您的账户安全，并在需要时可以恢复密码。" },
            q28: { question: "如果我删除账户会怎样？", answer: "如果您删除账户，您的所有数据将从我们的服务器上永久删除。此操作不可逆转。记得在删除前导出重要报告。" },
            q29: { question: "VOCALIA支持哪些浏览器？", answer: "VOCALIA支持所有现代浏览器：Chrome、Firefox、Safari和Edge。为获得最佳音频录制体验，我们推荐Chrome或Firefox。VOCALIA也可作为PWA应用安装在移动设备和桌面上。" },
            q30: { question: "什么是PWA，如何安装？", answer: "PWA让您可以像真正的应用一样在智能手机或电脑上安装VOCALIA。在移动设备上，点击浏览器菜单中的添加到主屏幕。在桌面上，Chrome和Edge在地址栏中提供安装按钮。安装的应用加载超快，并可部分离线工作。" }
        }
    },
    ja: {
        nav: { features: "機能", demo: "デモ", pricing: "料金", faq: "よくある質問", login: "ログイン", start: "始める" },
        footer: { product: "製品", features: "機能", pricing: "料金", application: "アプリ", support: "サポート", contact: "お問い合わせ", documentation: "ドキュメント", faq: "よくある質問", legal: "法的情報", privacy: "プライバシー", terms: "利用規約", legal_notices: "法的通知", made_with: "で作成", in_france: "フランスにて", rights: "全著作権所有" },
        faq: {
            title: "よくある質問", subtitle: "質問の答えをすばやく見つける", search_placeholder: "質問を検索...", all: "すべて", questions: "質問", no_results: "結果がありません", no_results_desc: "他のキーワードで試してください",
            categories: { pricing: "サブスクリプション", usage: "使用方法", reports: "レポート", multilingual: "多言語", security: "セキュリティ", technical: "技術" },
            q1: { question: "無料プランとプロプランの違いは何ですか？", answer: "無料プランは月5レポート制限、1言語のみで、フォルダと自動翻訳は含まれません。プロプランは無制限レポート、6言語、自動翻訳、フォルダシステム、レポート共有、優先サポートを月額49ユーロで提供します。" },
            q2: { question: "VOCALIAの料金はいくらですか？", answer: "VOCALIAは3つのプランを提供：無料、プロ、エンタープライズ。無料は0ユーロ/月で最大5レポート、プロは49ユーロ/月または490ユーロ/年で無制限レポート、エンタープライズは見積もりで月額499ユーロからカスタム機能付きです。" },
            q3: { question: "無料プランの5レポート制限はどのように機能しますか？", answer: "カウンターは毎月1日に自動的にリセットされます。5つのレポートを生成すると、プロへのアップグレードを促すメッセージが表示されます。" },
            q4: { question: "いつでも無料プランからプロプランにアップグレードできますか？", answer: "はい、ダッシュボードから即座にプロにアップグレードできます。アップグレードは即時で、支払い完了後すぐにすべてのプロ機能をご利用いただけます。" },
            q5: { question: "年間サブスクリプションに割引はありますか？", answer: "はい！年間プロサブスクリプションは490ユーロ/年で、588ユーロではなく、2ヶ月分節約できます。年払いで約17%節約できます。" },
            q6: { question: "プロサブスクリプションをいつでもキャンセルできますか？", answer: "はい、設定からいつでもキャンセルできます。キャンセルは現在の請求期間の終了時に有効になります。その日までプロ機能にアクセスできます。" },
            q7: { question: "無料プランにダウングレードするとレポートはどうなりますか？", answer: "既存のすべてのレポートは閲覧とダウンロードが可能です。ただし、カスタムフォルダと自動翻訳へのアクセスは失われます。月に5つの新しいレポートのみ作成できます。" },
            q8: { question: "エンタープライズプランは誰のためのものですか？", answer: "エンタープライズプランは大規模組織、フランチャイズネットワーク、多国籍企業に最適です。ホワイトラベル、カスタムAIエージェント、オーダーメイドテンプレート、24/7専用サポート、カスタムCRM統合が含まれます。" },
            q9: { question: "最初のレポートはどのように作成しますか？", answer: "とても簡単です！ログインして新規レポートをクリックし、赤いマイクボタンを押して自然に話しながら顧客訪問を録音し、終了したら停止をクリックします。AIが自動的に書き起こし、数秒でプロフェッショナルなレポートを生成します。" },
            q10: { question: "録音の最大時間はありますか？", answer: "いいえ、録音時間の制限はありません。顧客との会議全体を記録するために必要な時間だけ録音できます。AIは長時間の録音も問題なく処理します。" },
            q11: { question: "下書きとは何ですか？どのように機能しますか？", answer: "下書きは、最終レポートに変換される前に自動保存される録音です。手動で編集し、メモを追加してから、検証してPDFレポートを生成できます。これにより、最終生成前にレビューと修正ができます。" },
            q12: { question: "進行中の録音を一時停止できますか？", answer: "はい、いつでも録音を一時停止および再開できます。録音は下書きとして自動保存されるため、後で続けたり、準備ができたら完成させることができます。" },
            q13: { question: "VOCALIAはオフラインで動作しますか？", answer: "PWA技術により、VOCALIAは部分的にオフラインで動作します。オフラインで訪問を録音でき、インターネット接続が復旧すると録音は自動的に同期され処理されます。" },
            q14: { question: "何台のデバイスでVOCALIAを使用できますか？", answer: "同じアカウントで最大2台のデバイスでVOCALIAを使用できます。データはデバイス間で自動的に同期されます。より多くのデバイスが必要な場合は、エンタープライズプランについてお問い合わせください。" },
            q15: { question: "推奨される音声品質は？", answer: "AIは現代のスマートフォンの標準音声でうまく機能します。最良の結果を得るには、非常に騒がしい環境を避け、はっきりと話してください。リアルタイム可視化により、音が適切に捕捉されているかを確認できます。" },
            q16: { question: "VOCALIA生成のレポートには何が含まれますか？", answer: "各レポートには自動的に以下が含まれます：インテリジェントに生成されたタイトル、エグゼクティブサマリー、訪問の要点、アクションアイテム、結論。すべてがプロフェッショナルに構造化され、即座にPDFにエクスポートできます。" },
            q17: { question: "生成後にレポートを編集できますか？", answer: "はい、下書きを最終レポートとして検証する前に手動で編集できます。検証後、PDFレポートは固定されますが、閲覧、ダウンロード、共有は引き続き可能です。変更するには、新しいレポートを作成してください。" },
            q18: { question: "フォルダはどのように機能しますか？", answer: "フォルダ（プロプランのみ）を使用すると、顧客、プロジェクト、日付、またはその他の基準でレポートを整理できます。無制限のフォルダを作成し、迅速な識別のために色を割り当て、いつでも名前を変更または削除できます。" },
            q19: { question: "チームとレポートを共有できますか？", answer: "はい、プロプランでは安全なリンクを介してレポートを共有できます。PDFをダウンロードしてメールで送信することもできます。エンタープライズプランは、チーム共有を備えた高度なコラボレーション機能を提供します。" },
            q20: { question: "レポートはどのくらいの期間保存されますか？", answer: "アカウントがアクティブである限り、レポートは無期限に保存されます。プロプランは完全な履歴を提供し、無料プランはすべての作成されたレポートを保持します。不要になったレポートは手動で削除できます。" },
            q21: { question: "レポートのデザインをカスタマイズできますか？", answer: "プロプランでは、PDFレポートにカスタムロゴを追加できます。エンタープライズプランは、ブランドガイドライン、色、カスタムレイアウトを含む完全にカスタマイズ可能なレポートテンプレートを提供します。" },
            q22: { question: "VOCALIAはどの言語をサポートしていますか？", answer: "VOCALIAは6つの言語をサポート：フランス語、英語、簡体字中国語、日本語、スペイン語、ドイツ語。無料プランは1言語に制限され、プロプランは自動翻訳付きで6言語すべてにアクセスできます。" },
            q23: { question: "自動レポート翻訳はどのように機能しますか？", answer: "プロプランでは、サポートされている6つの言語のいずれかにレポートを自動的に翻訳できます。翻訳は元のレポートへのリンクを保持しながら、新しい翻訳されたPDFを生成します。国際的なクライアントに最適です！" },
            q24: { question: "ある言語で話して別の言語でレポートを取得できますか？", answer: "はい！AIは録音言語を自動的に検出します。プロプランでは、生成されたレポートを他のサポート言語に翻訳できます。たとえば、フランス語で録音して、国際的なクライアント向けに英語のレポートを取得できます。" },
            q25: { question: "VOCALIAインターフェース言語を変更するにはどうすればよいですか？", answer: "インターフェース言語はブラウザから自動的に検出されます。右上の言語セレクターからいつでも変更できます。変更は即座に行われ、アプリケーションインターフェース全体に影響します。" },
            q26: { question: "データは安全ですか？", answer: "はい、絶対に。VOCALIAはSupabase Authを使用して、暗号化されたパスワードで安全な認証を行います。すべてのデータはRLSで保護され、ユーザー間の完全な分離を保証します。録音とレポートは共有されたり、AIのトレーニングに使用されることはありません。" },
            q27: { question: "メールを確認する必要がありますか？", answer: "はい、サインアップ時にメール確認が必須です。クリックする確認リンクが記載されたメールが届きます。これによりアカウントのセキュリティが確保され、必要に応じてパスワードの回復が可能になります。" },
            q28: { question: "アカウントを削除するとどうなりますか？", answer: "アカウントを削除すると、すべてのデータがサーバーから完全に削除されます。この操作は元に戻せません。削除前に重要なレポートをエクスポートすることを忘れないでください。" },
            q29: { question: "VOCALIAはどのブラウザで動作しますか？", answer: "VOCALIAはすべての最新ブラウザで動作：Chrome、Firefox、Safari、Edge。最適な音声録音体験には、ChromeまたはFirefoxを推奨します。VOCALIAはモバイルおよびデスクトップにインストール可能なPWAアプリとしても利用できます。" },
            q30: { question: "PWAとは何ですか？どのようにインストールしますか？", answer: "PWAにより、スマートフォンまたはコンピューターに本物のアプリのようにVOCALIAをインストールできます。モバイルでは、ブラウザメニューのホーム画面に追加をクリックします。デスクトップでは、ChromeとEdgeがアドレスバーにインストールボタンを提供します。インストールされたアプリは超高速で読み込まれ、部分的にオフラインで動作します。" }
        }
    }
};

function getFaqTranslation(key, lang = 'fr') {
    const keys = key.split('.');
    let value = faqTranslations[lang];
    for (const k of keys) {
        if (value && value[k]) value = value[k];
        else { console.warn(`Translation not found: ${key} in ${lang}`); return key; }
    }
    return value;
}

function changeFaqLanguage(lang) {
    localStorage.setItem('faq-language', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = getFaqTranslation(el.getAttribute('data-i18n'), lang);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = getFaqTranslation(el.getAttribute('data-i18n-placeholder'), lang);
    });
    updateLanguageButton(lang);
}

function updateLanguageButton(lang) {
    const flags = { 'fr': '🇫🇷 FR', 'en': '🇬🇧 EN', 'zh': '🇨🇳 中文', 'ja': '🇯🇵 日本語' };
    const btn = document.querySelector('.language-btn');
    if (btn) btn.innerHTML = `${flags[lang]} ▼`;
    document.querySelectorAll('.language-option').forEach(opt => {
        opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    changeFaqLanguage(localStorage.getItem('faq-language') || 'fr');
    document.querySelectorAll('.language-option').forEach(opt => {
        opt.addEventListener('click', e => {
            e.preventDefault();
            changeFaqLanguage(opt.getAttribute('data-lang'));
            document.querySelector('.language-dropdown').classList.remove('active');
        });
    });
    const btn = document.querySelector('.language-btn');
    const dropdown = document.querySelector('.language-dropdown');
    if (btn && dropdown) {
        btn.addEventListener('click', e => { e.stopPropagation(); dropdown.classList.toggle('active'); });
        document.addEventListener('click', () => dropdown.classList.remove('active'));
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { faqTranslations, getFaqTranslation, changeFaqLanguage };
}