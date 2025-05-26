import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    // Header
    home: 'Home',
    speechToText: 'Speech to Text',
    textProcessing: 'Text Processing',
    textToSpeech: 'Text to Speech',
    accuracy: 'Accuracy',
    languages: 'Languages',
    responseTime: 'Response Time',
    efficiency: 'Efficiency Gain',

    // Home Page
    transformTitle: 'Transform Your Voice Interactions',
    transformSubtitle: 'Powered by advanced AI technology for seamless communication',
    realTimeRecognition: 'Real-time Speech Recognition',
    realTimeDesc: '95% accuracy across 5 languages with 50ms response time',
    naturalVoice: 'Natural Voice Synthesis',
    naturalVoiceDesc: 'Human-like voice generation with emotional intelligence',
    advancedProcessing: 'Advanced Text Processing',
    advancedProcessingDesc: 'Context-aware conversation handling with GPT-4 integration',
    enterpriseReady: 'Enterprise Ready',
    enterpriseDesc: 'Scalable architecture handling 100+ concurrent requests',
    readyToTransform: 'Ready to Transform Your Communication?',
    experiencePower: 'Experience the power of AI-driven voice technology',
    trySpeechToText: 'Try Speech to Text',
    tryTextToSpeech: 'Try Text to Speech',

    // Footer
    performanceMetrics: 'Performance Metrics',
    supportedLanguages: 'Supported Languages',
    contact: 'Contact',
    enterpriseSolutions: 'For enterprise solutions and custom integrations',
    allRightsReserved: 'All rights reserved.'
  },
  es: {
    // Header
    home: 'Inicio',
    speechToText: 'Voz a Texto',
    textProcessing: 'Procesamiento de Texto',
    textToSpeech: 'Texto a Voz',
    accuracy: 'Precisión',
    languages: 'Idiomas',
    responseTime: 'Tiempo de Respuesta',
    efficiency: 'Ganancia de Eficiencia',

    // Home Page
    transformTitle: 'Transforma tus Interacciones por Voz',
    transformSubtitle: 'Impulsado por tecnología AI avanzada para una comunicación fluida',
    realTimeRecognition: 'Reconocimiento de Voz en Tiempo Real',
    realTimeDesc: '95% de precisión en 5 idiomas con 50ms de tiempo de respuesta',
    naturalVoice: 'Síntesis de Voz Natural',
    naturalVoiceDesc: 'Generación de voz humana con inteligencia emocional',
    advancedProcessing: 'Procesamiento de Texto Avanzado',
    advancedProcessingDesc: 'Manejo de conversaciones con conciencia contextual e integración GPT-4',
    enterpriseReady: 'Listo para Empresas',
    enterpriseDesc: 'Arquitectura escalable que maneja más de 100 solicitudes concurrentes',
    readyToTransform: '¿Listo para Transformar tu Comunicación?',
    experiencePower: 'Experimenta el poder de la tecnología de voz impulsada por AI',
    trySpeechToText: 'Probar Voz a Texto',
    tryTextToSpeech: 'Probar Texto a Voz',

    // Footer
    performanceMetrics: 'Métricas de Rendimiento',
    supportedLanguages: 'Idiomas Soportados',
    contact: 'Contacto',
    enterpriseSolutions: 'Para soluciones empresariales e integraciones personalizadas',
    allRightsReserved: 'Todos los derechos reservados.'
  },
  fr: {
    // Header
    home: 'Accueil',
    speechToText: 'Parole en Texte',
    textProcessing: 'Traitement de Texte',
    textToSpeech: 'Texte en Parole',
    accuracy: 'Précision',
    languages: 'Langues',
    responseTime: 'Temps de Réponse',
    efficiency: 'Gain d\'Efficacité',

    // Home Page
    transformTitle: 'Transformez vos Interactions Vocales',
    transformSubtitle: 'Propulsé par une technologie IA avancée pour une communication fluide',
    realTimeRecognition: 'Reconnaissance Vocale en Temps Réel',
    realTimeDesc: '95% de précision dans 5 langues avec un temps de réponse de 50ms',
    naturalVoice: 'Synthèse Vocale Naturelle',
    naturalVoiceDesc: 'Génération de voix humaine avec intelligence émotionnelle',
    advancedProcessing: 'Traitement de Texte Avancé',
    advancedProcessingDesc: 'Gestion des conversations contextuelle avec intégration GPT-4',
    enterpriseReady: 'Prêt pour l\'Entreprise',
    enterpriseDesc: 'Architecture évolutive gérant plus de 100 requêtes simultanées',
    readyToTransform: 'Prêt à Transformer votre Communication ?',
    experiencePower: 'Découvrez la puissance de la technologie vocale basée sur l\'IA',
    trySpeechToText: 'Essayer Parole en Texte',
    tryTextToSpeech: 'Essayer Texte en Parole',

    // Footer
    performanceMetrics: 'Métriques de Performance',
    supportedLanguages: 'Langues Supportées',
    contact: 'Contact',
    enterpriseSolutions: 'Pour solutions d\'entreprise et intégrations personnalisées',
    allRightsReserved: 'Tous droits réservés.'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const value = {
    currentLanguage,
    setCurrentLanguage,
    translations: translations[currentLanguage],
    availableLanguages: Object.keys(translations)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 