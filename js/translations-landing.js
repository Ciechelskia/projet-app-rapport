// Traductions pour la landing page
const TRANSLATIONS_LANDING = {
    fr: {
        // Navigation
        'landing.nav.features': 'Fonctionnalités',
        'landing.nav.demo': 'Démo',
        'landing.nav.pricing': 'Tarifs',
        'landing.nav.cta': 'Essayer gratuitement',
        
        // Hero Section
        'landing.hero.badge': 'Nouveau : IA multilingue intégrée',
        'landing.hero.title.part1': 'Transformez vos visites commerciales en',
        'landing.hero.title.highlight': 'rapports professionnels',
        'landing.hero.title.part2': 'en 30 secondes',
        'landing.hero.subtitle': 'Fini les rapports fastidieux ! Enregistrez votre visite, notre IA transcrit, structure et génère automatiquement un rapport PDF professionnel. Disponible en 6 langues.',
        'landing.hero.cta.primary': 'Commencer gratuitement',
        'landing.hero.cta.secondary': 'Voir la démo',
        'landing.hero.stat1.number': '95%',
        'landing.hero.stat1.label': 'Temps économisé',
        'landing.hero.stat2.number': '30s',
        'landing.hero.stat2.label': 'Rapport généré',
        'landing.hero.stat3.number': '6',
        'landing.hero.stat3.label': 'Langues supportées',
        
        // Features Section
        'landing.features.title': 'Pourquoi choisir notre solution ?',
        'landing.features.subtitle': 'Une technologie de pointe pour des rapports commerciaux d\'exception',
        
        'landing.feature1.title': 'Enregistrement vocal intelligent',
        'landing.feature1.description': 'Enregistrez directement depuis votre mobile ou importez vos fichiers audio. Notre IA reconnaît automatiquement la langue et optimise la qualité.',
        
        'landing.feature2.title': 'IA de transcription avancée',
        'landing.feature2.description': 'Transcription précise avec reconnaissance du contexte commercial. L\'IA structure automatiquement vos informations en rapport professionnel.',
        
        'landing.feature3.title': 'PDF automatique',
        'landing.feature3.description': 'Génération instantanée de rapports PDF formatés, prêts à partager avec vos clients ou votre équipe. Design professionnel garanti.',
        
        'landing.feature4.title': 'Multilingue',
        'landing.feature4.description': 'Support de 6 langues avec traduction automatique. Travaillez avec des clients internationaux sans barrière linguistique.',
        
        'landing.feature5.title': 'PWA Mobile',
        'landing.feature5.description': 'Application web progressive installable. Fonctionne hors ligne, synchronisation automatique, notifications push.',
        
        'landing.feature6.title': 'Sécurisé',
        'landing.feature6.description': 'Authentification sécurisée, limitation d\'appareils, stockage local chiffré. Vos données restent privées et protégées.',
        
        // Demo Section
        'landing.demo.title': 'Voyez la magie en action',
        'landing.demo.subtitle': 'De l\'enregistrement vocal au rapport PDF en 3 étapes simples',
        'landing.demo.step1.title': 'Enregistrez',
        'landing.demo.step1.description': 'Parlez naturellement de votre visite client',
        'landing.demo.step2.title': 'L\'IA structure',
        'landing.demo.step2.description': 'Transcription et mise en forme automatique',
        'landing.demo.step3.title': 'PDF généré',
        'landing.demo.step3.description': 'Rapport professionnel prêt à partager',
        'landing.demo.cta': 'Tester maintenant',
        
        // Benefits Section
        'landing.benefits.title': 'Économisez 95% de votre temps de rédaction',
        'landing.benefits.before.title': '❌ Avant',
        'landing.benefits.before.item1': '30 min de rédaction par rapport',
        'landing.benefits.before.item2': 'Risque d\'oubli d\'informations',
        'landing.benefits.before.item3': 'Mise en forme fastidieuse',
        'landing.benefits.before.item4': 'Rapports peu structurés',
        
        'landing.benefits.after.title': '✅ Avec Rapports IA',
        'landing.benefits.after.item1': '30 secondes d\'enregistrement',
        'landing.benefits.after.item2': 'Capture complète automatique',
        'landing.benefits.after.item3': 'PDF professionnel instantané',
        'landing.benefits.after.item4': 'Structure optimisée par l\'IA',
        
        // Testimonials Section
        'landing.testimonials.title': 'Ce que disent nos utilisateurs',
        'landing.testimonial1.content': 'Cette app a révolutionné ma façon de travailler. Plus de rapports oubliés, tout est automatique et professionnel.',
        'landing.testimonial1.name': 'Andrea C.',
        'landing.testimonial1.role': 'Commercial Senior',
        
        'landing.testimonial2.content': 'Incroyable ! Je gagne 2h par jour sur mes rapports. L\'IA comprend parfaitement le contexte commercial.',
        'landing.testimonial2.name': 'Guillaume R.',
        'landing.testimonial2.role': 'Responsable Commercial',
        
        'landing.testimonial3.content': 'La fonction multilingue est parfaite pour nos clients internationaux. PDF impeccables à chaque fois.',
        'landing.testimonial3.name': 'Corentin H.',
        'landing.testimonial3.role': 'Business Developer',
        
        // Pricing Section
        'landing.pricing.title': 'Tarifs simples et transparents',
        'landing.pricing.subtitle': 'Choisissez la formule qui correspond à vos besoins',
        
        'landing.pricing.starter.title': 'Starter',
        'landing.pricing.starter.price': 'Gratuit',
        'landing.pricing.starter.description': 'Parfait pour découvrir',
        'landing.pricing.starter.feature1': '5 rapports/mois',
        'landing.pricing.starter.feature2': 'Transcription IA',
        'landing.pricing.starter.feature3': 'PDF automatique',
        'landing.pricing.starter.feature4': '2 appareils max',
        'landing.pricing.starter.feature5': 'Traduction',
        'landing.pricing.starter.feature6': 'Dossiers',
        'landing.pricing.starter.cta': 'Commencer gratuitement',
        
        'landing.pricing.pro.badge': 'Plus populaire',
        'landing.pricing.pro.title': 'Pro',
        'landing.pricing.pro.price': '49€',
        'landing.pricing.pro.period': '/mois',
        'landing.pricing.pro.description': 'Pour les commerciaux actifs',
        'landing.pricing.pro.feature1': 'Rapports illimités',
        'landing.pricing.pro.feature2': 'Traduction 6 langues',
        'landing.pricing.pro.feature3': 'Dossiers organisés',
        'landing.pricing.pro.feature4': 'Partage équipe',
        'landing.pricing.pro.feature5': 'Support prioritaire',
        'landing.pricing.pro.feature6': 'Intégrations',
        'landing.pricing.pro.cta': 'Essayer 14 jours gratuits',
        
        'landing.pricing.enterprise.title': 'Enterprise',
        'landing.pricing.enterprise.price': '149€',
        'landing.pricing.enterprise.period': '/mois',
        'landing.pricing.enterprise.description': 'Pour les équipes',
        'landing.pricing.enterprise.feature1': 'Tout du Pro',
        'landing.pricing.enterprise.feature2': 'Utilisateurs illimités',
        'landing.pricing.enterprise.feature3': 'API personnalisée',
        'landing.pricing.enterprise.feature4': 'Intégration CRM',
        'landing.pricing.enterprise.feature5': 'Formation équipe',
        'landing.pricing.enterprise.feature6': 'SLA 99.9%',
        'landing.pricing.enterprise.cta': 'Nous contacter',
        
        // Final CTA Section
        'landing.final.title': 'Prêt à révolutionner vos rapports ?',
        'landing.final.subtitle': 'Rejoignez les centaines de commerciaux qui ont déjà adopté l\'IA pour leurs rapports',
        'landing.final.cta': 'Commencer maintenant',
        'landing.final.note': '✅ Gratuit • ✅ Sans engagement • ✅ Configuration en 2 minutes',
        
        // Footer
        'landing.footer.tagline': 'Du code et de l\'IA pour donner vie à vos rapports commerciaux',
        'landing.footer.product.title': 'Produit',
        'landing.footer.product.features': 'Fonctionnalités',
        'landing.footer.product.pricing': 'Tarifs',
        'landing.footer.product.app': 'Application',
        
        'landing.footer.support.title': 'Support',
        'landing.footer.support.contact': 'Contact',
        'landing.footer.support.docs': 'Documentation',
        'landing.footer.support.faq': 'FAQ',
        
        'landing.footer.legal.title': 'Légal',
        'landing.footer.legal.privacy': 'Confidentialité',
        'landing.footer.legal.terms': 'CGU',
        'landing.footer.legal.mentions': 'Mentions légales',
        
        'landing.footer.copyright': '© 2024 Rapports IA. Tous droits réservés.',
        'landing.footer.made': 'Fait avec ❤️ en France'
    },
    
    en: {
        // Navigation
        'landing.nav.features': 'Features',
        'landing.nav.demo': 'Demo',
        'landing.nav.pricing': 'Pricing',
        'landing.nav.cta': 'Try for free',
        
        // Hero Section
        'landing.hero.badge': 'New: Multilingual AI integrated',
        'landing.hero.title.part1': 'Transform your sales visits into',
        'landing.hero.title.highlight': 'professional reports',
        'landing.hero.title.part2': 'in 30 seconds',
        'landing.hero.subtitle': 'No more tedious reports! Record your visit, our AI transcribes, structures and automatically generates a professional PDF report. Available in 6 languages.',
        'landing.hero.cta.primary': 'Get started for free',
        'landing.hero.cta.secondary': 'Watch demo',
        'landing.hero.stat1.number': '95%',
        'landing.hero.stat1.label': 'Time saved',
        'landing.hero.stat2.number': '30s',
        'landing.hero.stat2.label': 'Report generated',
        'landing.hero.stat3.number': '6',
        'landing.hero.stat3.label': 'Languages supported',
        
        // Features Section
        'landing.features.title': 'Why choose our solution?',
        'landing.features.subtitle': 'Cutting-edge technology for exceptional business reports',
        
        'landing.feature1.title': 'Intelligent voice recording',
        'landing.feature1.description': 'Record directly from your mobile or import your audio files. Our AI automatically recognizes the language and optimizes quality.',
        
        'landing.feature2.title': 'Advanced AI transcription',
        'landing.feature2.description': 'Accurate transcription with business context recognition. The AI automatically structures your information into a professional report.',
        
        'landing.feature3.title': 'Automatic PDF',
        'landing.feature3.description': 'Instant generation of formatted PDF reports, ready to share with your clients or team. Professional design guaranteed.',
        
        'landing.feature4.title': 'Multilingual',
        'landing.feature4.description': 'Support for 6 languages with automatic translation. Work with international clients without language barriers.',
        
        'landing.feature5.title': 'Mobile PWA',
        'landing.feature5.description': 'Installable progressive web app. Works offline, automatic sync, push notifications.',
        
        'landing.feature6.title': 'Secure',
        'landing.feature6.description': 'Secure authentication, device limitation, encrypted local storage. Your data remains private and protected.',
        
        // Demo Section
        'landing.demo.title': 'See the magic in action',
        'landing.demo.subtitle': 'From voice recording to PDF report in 3 simple steps',
        'landing.demo.step1.title': 'Record',
        'landing.demo.step1.description': 'Speak naturally about your client visit',
        'landing.demo.step2.title': 'AI structures',
        'landing.demo.step2.description': 'Transcription and automatic formatting',
        'landing.demo.step3.title': 'PDF generated',
        'landing.demo.step3.description': 'Professional report ready to share',
        'landing.demo.cta': 'Try now',
        
        // Benefits Section
        'landing.benefits.title': 'Save 95% of your writing time',
        'landing.benefits.before.title': '❌ Before',
        'landing.benefits.before.item1': '30 min writing per report',
        'landing.benefits.before.item2': 'Risk of missing information',
        'landing.benefits.before.item3': 'Tedious formatting',
        'landing.benefits.before.item4': 'Poorly structured reports',
        
        'landing.benefits.after.title': '✅ With AI Reports',
        'landing.benefits.after.item1': '30 seconds recording',
        'landing.benefits.after.item2': 'Complete automatic capture',
        'landing.benefits.after.item3': 'Instant professional PDF',
        'landing.benefits.after.item4': 'AI-optimized structure',
        
        // Testimonials Section
        'landing.testimonials.title': 'What our users say',
        'landing.testimonial1.content': 'This app revolutionized how I work. No more forgotten reports, everything is automatic and professional.',
        'landing.testimonial1.name': 'Andrea C.',
        'landing.testimonial1.role': 'Senior Sales Rep',
        
        'landing.testimonial2.content': 'Amazing! I save 2 hours a day on my reports. The AI perfectly understands the business context.',
        'landing.testimonial2.name': 'Guillaume R.',
        'landing.testimonial2.role': 'Sales Manager',
        
        'landing.testimonial3.content': 'The multilingual feature is perfect for our international clients. Flawless PDFs every time.',
        'landing.testimonial3.name': 'Corentin H.',
        'landing.testimonial3.role': 'Business Developer',
        
        // Pricing Section
        'landing.pricing.title': 'Simple and transparent pricing',
        'landing.pricing.subtitle': 'Choose the plan that fits your needs',
        
        'landing.pricing.starter.title': 'Starter',
        'landing.pricing.starter.price': 'Free',
        'landing.pricing.starter.description': 'Perfect to discover',
        'landing.pricing.starter.feature1': '5 reports/month',
        'landing.pricing.starter.feature2': 'AI transcription',
        'landing.pricing.starter.feature3': 'Automatic PDF',
        'landing.pricing.starter.feature4': '2 devices max',
        'landing.pricing.starter.feature5': 'Translation',
        'landing.pricing.starter.feature6': 'Folders',
        'landing.pricing.starter.cta': 'Start for free',
        
        'landing.pricing.pro.badge': 'Most popular',
        'landing.pricing.pro.title': 'Pro',
        'landing.pricing.pro.price': '$49',
        'landing.pricing.pro.period': '/month',
        'landing.pricing.pro.description': 'For active sales reps',
        'landing.pricing.pro.feature1': 'Unlimited reports',
        'landing.pricing.pro.feature2': '6 languages translation',
        'landing.pricing.pro.feature3': 'Organized folders',
        'landing.pricing.pro.feature4': 'Team sharing',
        'landing.pricing.pro.feature5': 'Priority support',
        'landing.pricing.pro.feature6': 'Integrations',
        'landing.pricing.pro.cta': 'Try 14 days free',
        
        'landing.pricing.enterprise.title': 'Enterprise',
        'landing.pricing.enterprise.price': '$149',
        'landing.pricing.enterprise.period': '/month',
        'landing.pricing.enterprise.description': 'For teams',
        'landing.pricing.enterprise.feature1': 'All Pro features',
        'landing.pricing.enterprise.feature2': 'Unlimited users',
        'landing.pricing.enterprise.feature3': 'Custom API',
        'landing.pricing.enterprise.feature4': 'CRM integration',
        'landing.pricing.enterprise.feature5': 'Team training',
        'landing.pricing.enterprise.feature6': '99.9% SLA',
        'landing.pricing.enterprise.cta': 'Contact us',
        
        // Final CTA Section
        'landing.final.title': 'Ready to revolutionize your reports?',
        'landing.final.subtitle': 'Join hundreds of sales reps who have already adopted AI for their reports',
        'landing.final.cta': 'Start now',
        'landing.final.note': '✅ Free • ✅ No commitment • ✅ 2-minute setup',
        
        // Footer
        'landing.footer.tagline': 'Code and AI to bring your business reports to life',
        'landing.footer.product.title': 'Product',
        'landing.footer.product.features': 'Features',
        'landing.footer.product.pricing': 'Pricing',
        'landing.footer.product.app': 'Application',
        
        'landing.footer.support.title': 'Support',
        'landing.footer.support.contact': 'Contact',
        'landing.footer.support.docs': 'Documentation',
        'landing.footer.support.faq': 'FAQ',
        
        'landing.footer.legal.title': 'Legal',
        'landing.footer.legal.privacy': 'Privacy',
        'landing.footer.legal.terms': 'Terms',
        'landing.footer.legal.mentions': 'Legal notices',
        
        'landing.footer.copyright': '© 2024 AI Reports. All rights reserved.',
        'landing.footer.made': 'Made with ❤️ in France'
    },
    
    zh: {
        // Navigation
        'landing.nav.features': '功能',
        'landing.nav.demo': '演示',
        'landing.nav.pricing': '价格',
        'landing.nav.cta': '免费试用',
        
        // Hero Section
        'landing.hero.badge': '新功能：集成多语言AI',
        'landing.hero.title.part1': '将您的销售拜访转化为',
        'landing.hero.title.highlight': '专业报告',
        'landing.hero.title.part2': '仅需30秒',
        'landing.hero.subtitle': '告别繁琐的报告！录制您的拜访，我们的AI自动转录、结构化并生成专业PDF报告。支持6种语言。',
        'landing.hero.cta.primary': '免费开始',
        'landing.hero.cta.secondary': '观看演示',
        'landing.hero.stat1.number': '95%',
        'landing.hero.stat1.label': '节省时间',
        'landing.hero.stat2.number': '30秒',
        'landing.hero.stat2.label': '生成报告',
        'landing.hero.stat3.number': '6',
        'landing.hero.stat3.label': '支持语言',
        
        // Features Section
        'landing.features.title': '为什么选择我们的解决方案？',
        'landing.features.subtitle': '卓越商业报告的尖端技术',
        
        'landing.feature1.title': '智能语音录制',
        'landing.feature1.description': '直接从手机录制或导入音频文件。我们的AI自动识别语言并优化质量。',
        
        'landing.feature2.title': '高级AI转录',
        'landing.feature2.description': '准确转录并识别商业上下文。AI自动将您的信息结构化为专业报告。',
        
        'landing.feature3.title': '自动PDF',
        'landing.feature3.description': '即时生成格式化的PDF报告，可随时与客户或团队共享。保证专业设计。',
        
        'landing.feature4.title': '多语言',
        'landing.feature4.description': '支持6种语言并自动翻译。与国际客户合作无语言障碍。',
        
        'landing.feature5.title': '移动PWA',
        'landing.feature5.description': '可安装的渐进式Web应用。离线工作，自动同步，推送通知。',
        
        'landing.feature6.title': '安全',
        'landing.feature6.description': '安全认证，设备限制，加密本地存储。您的数据保持私密和受保护。',
        
        // Demo Section
        'landing.demo.title': '见证神奇效果',
        'landing.demo.subtitle': '从语音录制到PDF报告，仅需3个简单步骤',
        'landing.demo.step1.title': '录制',
        'landing.demo.step1.description': '自然地谈论您的客户拜访',
        'landing.demo.step2.title': 'AI结构化',
        'landing.demo.step2.description': '转录和自动格式化',
        'landing.demo.step3.title': '生成PDF',
        'landing.demo.step3.description': '专业报告可随时分享',
        'landing.demo.cta': '立即试用',
        
        // Benefits Section
        'landing.benefits.title': '节省95%的写作时间',
        'landing.benefits.before.title': '❌ 之前',
        'landing.benefits.before.item1': '每份报告需30分钟写作',
        'landing.benefits.before.item2': '遗漏信息的风险',
        'landing.benefits.before.item3': '繁琐的格式化',
        'landing.benefits.before.item4': '结构不良的报告',
        
        'landing.benefits.after.title': '✅ 使用AI报告',
        'landing.benefits.after.item1': '30秒录制',
        'landing.benefits.after.item2': '完整自动捕获',
        'landing.benefits.after.item3': '即时专业PDF',
        'landing.benefits.after.item4': 'AI优化结构',
        
        // Testimonials Section
        'landing.testimonials.title': '用户评价',
        'landing.testimonial1.content': '这个应用彻底改变了我的工作方式。不再遗忘报告，一切都是自动化和专业的。',
        'landing.testimonial1.name': 'Andrea C.',
        'landing.testimonial1.role': '高级销售代表',
        
        'landing.testimonial2.content': '太棒了！我每天在报告上节省2小时。AI完美理解商业环境。',
        'landing.testimonial2.name': 'Guillaume R.',
        'landing.testimonial2.role': '销售经理',
        
        'landing.testimonial3.content': '多语言功能非常适合我们的国际客户。每次都是完美的PDF。',
        'landing.testimonial3.name': 'Corentin H.',
        'landing.testimonial3.role': '业务开发',
        
        // Pricing Section
        'landing.pricing.title': '简单透明的价格',
        'landing.pricing.subtitle': '选择适合您需求的计划',
        
        'landing.pricing.starter.title': '入门版',
        'landing.pricing.starter.price': '免费',
        'landing.pricing.starter.description': '完美体验',
        'landing.pricing.starter.feature1': '5份报告/月',
        'landing.pricing.starter.feature2': 'AI转录',
        'landing.pricing.starter.feature3': '自动PDF',
        'landing.pricing.starter.feature4': '最多2台设备',
        'landing.pricing.starter.feature5': '翻译',
        'landing.pricing.starter.feature6': '文件夹',
        'landing.pricing.starter.cta': '免费开始',
        
        'landing.pricing.pro.badge': '最受欢迎',
        'landing.pricing.pro.title': '专业版',
        'landing.pricing.pro.price': '¥349',
        'landing.pricing.pro.period': '/月',
        'landing.pricing.pro.description': '适合活跃销售代表',
        'landing.pricing.pro.feature1': '无限报告',
        'landing.pricing.pro.feature2': '6种语言翻译',
        'landing.pricing.pro.feature3': '组织文件夹',
        'landing.pricing.pro.feature4': '团队共享',
        'landing.pricing.pro.feature5': '优先支持',
        'landing.pricing.pro.feature6': '集成',
        'landing.pricing.pro.cta': '免费试用14天',
        
        'landing.pricing.enterprise.title': '企业版',
        'landing.pricing.enterprise.price': '¥1049',
        'landing.pricing.enterprise.period': '/月',
        'landing.pricing.enterprise.description': '适合团队',
        'landing.pricing.enterprise.feature1': '所有专业版功能',
        'landing.pricing.enterprise.feature2': '无限用户',
        'landing.pricing.enterprise.feature3': '自定义API',
        'landing.pricing.enterprise.feature4': 'CRM集成',
        'landing.pricing.enterprise.feature5': '团队培训',
        'landing.pricing.enterprise.feature6': '99.9% SLA',
        'landing.pricing.enterprise.cta': '联系我们',
        
        // Final CTA Section
        'landing.final.title': '准备革新您的报告了吗？',
        'landing.final.subtitle': '加入数百名已采用AI报告的销售代表',
        'landing.final.cta': '立即开始',
        'landing.final.note': '✅ 免费 • ✅ 无承诺 • ✅ 2分钟设置',
        
        // Footer
        'landing.footer.tagline': '代码和AI为您的商业报告注入活力',
        'landing.footer.product.title': '产品',
        'landing.footer.product.features': '功能',
        'landing.footer.product.pricing': '价格',
        'landing.footer.product.app': '应用程序',
        
        'landing.footer.support.title': '支持',
        'landing.footer.support.contact': '联系',
        'landing.footer.support.docs': '文档',
        'landing.footer.support.faq': '常见问题',
        
        'landing.footer.legal.title': '法律',
        'landing.footer.legal.privacy': '隐私',
        'landing.footer.legal.terms': '条款',
        'landing.footer.legal.mentions': '法律声明',
        
        'landing.footer.copyright': '© 2024 AI报告。保留所有权利。',
        'landing.footer.made': '用❤️在法国制造'
    },
    
    ja: {
        // Navigation
        'landing.nav.features': '機能',
        'landing.nav.demo': 'デモ',
        'landing.nav.pricing': '料金',
        'landing.nav.cta': '無料で試す',
        
        // Hero Section
        'landing.hero.badge': '新機能：多言語AI統合',
        'landing.hero.title.part1': '営業訪問を',
        'landing.hero.title.highlight': 'プロフェッショナルなレポート',
        'landing.hero.title.part2': 'に30秒で変換',
        'landing.hero.subtitle': '面倒なレポート作成にさようなら！訪問を録音すれば、AIが自動で文字起こし、構造化し、プロフェッショナルなPDFレポートを生成します。6言語対応。',
        'landing.hero.cta.primary': '無料で始める',
        'landing.hero.cta.secondary': 'デモを見る',
        'landing.hero.stat1.number': '95%',
        'landing.hero.stat1.label': '時間短縮',
        'landing.hero.stat2.number': '30秒',
        'landing.hero.stat2.label': 'レポート生成',
        'landing.hero.stat3.number': '6',
        'landing.hero.stat3.label': '対応言語',
        
        // Features Section
        'landing.features.title': 'なぜ私たちのソリューションを選ぶのか？',
        'landing.features.subtitle': '優れたビジネスレポートのための最先端技術',
        
        'landing.feature1.title': 'インテリジェント音声録音',
        'landing.feature1.description': 'モバイルから直接録音するか、オーディオファイルをインポートします。AIが自動的に言語を認識し、品質を最適化します。',
        
        'landing.feature2.title': '高度なAI文字起こし',
        'landing.feature2.description': 'ビジネスコンテキスト認識による正確な文字起こし。AIが自動的に情報をプロフェッショナルなレポートに構造化します。',
        
        'landing.feature3.title': '自動PDF',
        'landing.feature3.description': 'フォーマット済みPDFレポートの即時生成。クライアントやチームと共有する準備が整っています。プロフェッショナルなデザインを保証します。',
        'landing.feature4.title': '多言語対応',
    'landing.feature4.description': '6言語のサポートと自動翻訳。言語の壁なく国際的なクライアントと仕事ができます。',
    
    'landing.feature5.title': 'モバイルPWA',
    'landing.feature5.description': 'インストール可能なプログレッシブWebアプリ。オフラインで動作、自動同期、プッシュ通知。',
    
    'landing.feature6.title': 'セキュア',
    'landing.feature6.description': '安全な認証、デバイス制限、暗号化されたローカルストレージ。データはプライベートで保護されています。',
    
    // Demo Section
    'landing.demo.title': '魔法を実際に見る',
    'landing.demo.subtitle': '音声録音からPDFレポートまで3つの簡単なステップ',
    'landing.demo.step1.title': '録音',
    'landing.demo.step1.description': 'クライアント訪問について自然に話す',
    'landing.demo.step2.title': 'AIが構造化',
    'landing.demo.step2.description': '文字起こしと自動フォーマット',
    'landing.demo.step3.title': 'PDF生成',
    'landing.demo.step3.description': '共有可能なプロフェッショナルレポート',
    'landing.demo.cta': '今すぐ試す',
    
    // Benefits Section
    'landing.benefits.title': '執筆時間の95%を節約',
    'landing.benefits.before.title': '❌ 以前',
    'landing.benefits.before.item1': 'レポート1件あたり30分の執筆',
    'landing.benefits.before.item2': '情報漏れのリスク',
    'landing.benefits.before.item3': '面倒なフォーマット',
    'landing.benefits.before.item4': '構造が不十分なレポート',
    
    'landing.benefits.after.title': '✅ AIレポートで',
    'landing.benefits.after.item1': '30秒の録音',
    'landing.benefits.after.item2': '完全自動キャプチャ',
    'landing.benefits.after.item3': '即座のプロフェッショナルPDF',
    'landing.benefits.after.item4': 'AI最適化構造',
    
    // Testimonials Section
    'landing.testimonials.title': 'ユーザーの声',
    'landing.testimonial1.content': 'このアプリは私の働き方を革命的に変えました。忘れられたレポートはもうなく、すべてが自動的でプロフェッショナルです。',
    'landing.testimonial1.name': 'Andrea C.',
    'landing.testimonial1.role': 'シニアセールス担当',
    
    'landing.testimonial2.content': '素晴らしい！レポートで1日2時間節約できます。AIはビジネスコンテキストを完璧に理解します。',
    'landing.testimonial2.name': 'Guillaume R.',
    'landing.testimonial2.role': 'セールスマネージャー',
    
    'landing.testimonial3.content': '多言語機能は国際的なクライアントに最適です。毎回完璧なPDFです。',
    'landing.testimonial3.name': 'Corentin H.',
    'landing.testimonial3.role': 'ビジネスデベロッパー',
    
    // Pricing Section
    'landing.pricing.title': 'シンプルで透明な価格',
    'landing.pricing.subtitle': 'ニーズに合ったプランを選択',
    
    'landing.pricing.starter.title': 'スターター',
    'landing.pricing.starter.price': '無料',
    'landing.pricing.starter.description': '発見に最適',
    'landing.pricing.starter.feature1': '月5レポート',
    'landing.pricing.starter.feature2': 'AI文字起こし',
    'landing.pricing.starter.feature3': '自動PDF',
    'landing.pricing.starter.feature4': '最大2デバイス',
    'landing.pricing.starter.feature5': '翻訳',
    'landing.pricing.starter.feature6': 'フォルダ',
    'landing.pricing.starter.cta': '無料で始める',
    
    'landing.pricing.pro.badge': '最も人気',
    'landing.pricing.pro.title': 'プロ',
    'landing.pricing.pro.price': '¥7,900',
    'landing.pricing.pro.period': '/月',
    'landing.pricing.pro.description': 'アクティブなセールス担当向け',
    'landing.pricing.pro.feature1': '無制限レポート',
    'landing.pricing.pro.feature2': '6言語翻訳',
    'landing.pricing.pro.feature3': '整理されたフォルダ',
    'landing.pricing.pro.feature4': 'チーム共有',
    'landing.pricing.pro.feature5': '優先サポート',
    'landing.pricing.pro.feature6': '統合',
    'landing.pricing.pro.cta': '14日間無料トライアル',
    
    'landing.pricing.enterprise.title': 'エンタープライズ',
    'landing.pricing.enterprise.price': '¥23,900',
    'landing.pricing.enterprise.period': '/月',
    'landing.pricing.enterprise.description': 'チーム向け',
    'landing.pricing.enterprise.feature1': 'プロの全機能',
    'landing.pricing.enterprise.feature2': '無制限ユーザー',
    'landing.pricing.enterprise.feature3': 'カスタムAPI',
    'landing.pricing.enterprise.feature4': 'CRM統合',
    'landing.pricing.enterprise.feature5': 'チームトレーニング',
    'landing.pricing.enterprise.feature6': '99.9% SLA',
    'landing.pricing.enterprise.cta': 'お問い合わせ',
    
    // Final CTA Section
    'landing.final.title': 'レポートを革新する準備はできましたか？',
    'landing.final.subtitle': 'すでにAIレポートを採用している何百人ものセールス担当に参加',
    'landing.final.cta': '今すぐ始める',
    'landing.final.note': '✅ 無料 • ✅ コミットメント不要 • ✅ 2分でセットアップ',
    
    // Footer
    'landing.footer.tagline': 'コードとAIでビジネスレポートに命を吹き込む',
    'landing.footer.product.title': '製品',
    'landing.footer.product.features': '機能',
    'landing.footer.product.pricing': '料金',
    'landing.footer.product.app': 'アプリケーション',
    
    'landing.footer.support.title': 'サポート',
    'landing.footer.support.contact': 'お問い合わせ',
    'landing.footer.support.docs': 'ドキュメント',
    'landing.footer.support.faq': 'FAQ',
    
    'landing.footer.legal.title': '法的情報',
    'landing.footer.legal.privacy': 'プライバシー',
    'landing.footer.legal.terms': '利用規約',
    'landing.footer.legal.mentions': '法的通知',
    
    'landing.footer.copyright': '© 2024 AIレポート。全著作権所有。',
    'landing.footer.made': 'フランスで❤️を込めて作成'
}
};
// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
module.exports = TRANSLATIONS_LANDING;
}
