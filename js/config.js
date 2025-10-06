// Configuration globale de l'application
const CONFIG = {
    N8N_WEBHOOK_URL: 'https://andreaprogra.app.n8n.cloud/webhook/88303112-848e-4b93-8758-5c2b16ecc52e',
    N8N_TRANSLATE_WEBHOOK_URL: 'https://andreaprogra.app.n8n.cloud/webhook-test/translate-report', // À remplacer
    APP_VERSION: '1.0.0',
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    SUPPORTED_AUDIO_FORMATS: [
        'audio/mp3',
        'audio/mp4',
        'audio/mpeg',
        'audio/wav',
        'audio/webm',
        'audio/ogg',
        'audio/m4a'
    ],
    RECORDER_OPTIONS: {
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
        }
    },
    PREFERRED_FORMATS: [
        'audio/mp4',
        'audio/mp4;codecs=mp4a.40.2',
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus'
    ]
};

// Base de données utilisateurs locale
const USERS_DB = [
    {
        id: 1,
        username: "commercial1",
        password: "pass123",
        nom: "Jean Dupont",
        role: "commercial",
        deviceId: null,
        isActive: true,
        registeredAt: "2024-09-01T10:00:00Z"
    },
    {
        id: 2,
        username: "commercial2",
        password: "pass456",
        nom: "Marie Martin",
        role: "commercial",
        deviceId: null,
        isActive: true,
        registeredAt: "2024-09-01T10:00:00Z"
    },
    {
        id: 3,
        username: "manager1",
        password: "pass789",
        nom: "Paul Durand",
        role: "manager",
        deviceId: null,
        isActive: true,
        registeredAt: "2024-09-01T10:00:00Z"
    },
    {
        id: 4,
        username: "guillaumer",
        password: "pass123",
        nom: "Guillaume Renouard",
        role: "commercial",
        statut: "actif",
        deviceId: null,
        isActive: true,
        dateCreation: "2025-10-5"
    },
    {
        id: 5,
        username: "andreac",
        password: "pass123",
        nom: "Andrea Ciechelski",
        role: "commercial",
        statut: "actif",
        deviceId: null,
        isActive: true,
        dateCreation: "2025-09-24"
    },
    {
        id: 6,
        username: "cocoh",
        password: "pass123",
        nom: "Corentin Havouis",
        role: "commercial",
        statut: "actif",
        deviceId: null,
        isActive: true,
        dateCreation: "2025-09-24"
    },
    {
        id: 7,
        username: "arthurf",
        password: "pass123",
        nom: "Arthur Fremion",
        role: "commercial",
        statut: "actif",
        deviceId: null,
        isActive: true,
        dateCreation: "2025-09-24"
    }
];

// Pages disponibles
const PAGES = {
    LOGIN: 'loginPage',
    BROUILLON: 'brouillonPage',
    RAPPORTS: 'rapportsPage'
};