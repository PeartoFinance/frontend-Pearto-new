import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            // Common
            common: {
                loading: 'Loading...',
                save: 'Save',
                cancel: 'Cancel',
                search: 'Search',
                viewAll: 'View All',
            },
            // Navigation
            nav: {
                home: 'Home',
                dashboard: 'Dashboard',
                markets: 'Markets',
                news: 'News',
                learn: 'Learn',
                portfolio: 'Portfolio',
                tools: 'Tools',
                settings: 'Settings',
                signIn: 'Sign in',
                signUp: 'Sign up',
                logout: 'Logout',
                profile: 'Profile',
                searchPlaceholder: 'Search stocks, crypto, news...',
            },
            // Dashboard
            dashboard: {
                welcome: 'Welcome back',
                todayMarkets: "Today's Markets",
                trending: 'Trending Topics',
                featuredStory: 'Featured Story',
                watchlist: 'Watchlist',
                quickTools: 'Quick Tools',
                continueLearn: 'Continue Learning',
            },
            // Market
            market: {
                price: 'Price',
                change: 'Change',
                volume: 'Volume',
                marketCap: 'Market Cap',
                gainers: 'Top Gainers',
                losers: 'Top Losers',
                mostActive: 'Most Active',
            },
            // Footer
            footer: {
                copyright: '© {{year}} Pearto. All rights reserved.',
                disclaimer: 'Market data delayed. Educational use only.',
            },
        },
    },
    es: {
        translation: {
            common: {
                loading: 'Cargando...',
                save: 'Guardar',
                cancel: 'Cancelar',
                search: 'Buscar',
                viewAll: 'Ver Todo',
            },
            nav: {
                home: 'Inicio',
                dashboard: 'Panel',
                markets: 'Mercados',
                news: 'Noticias',
                learn: 'Aprender',
                portfolio: 'Cartera',
                tools: 'Herramientas',
                settings: 'Configuración',
                signIn: 'Iniciar sesión',
                signUp: 'Registrarse',
                logout: 'Cerrar sesión',
                profile: 'Perfil',
                searchPlaceholder: 'Buscar acciones, cripto, noticias...',
            },
            dashboard: {
                welcome: 'Bienvenido de nuevo',
                todayMarkets: 'Mercados de Hoy',
                trending: 'Temas Tendencia',
                featuredStory: 'Historia Destacada',
                watchlist: 'Lista de Seguimiento',
                quickTools: 'Herramientas Rápidas',
                continueLearn: 'Continuar Aprendiendo',
            },
            market: {
                price: 'Precio',
                change: 'Cambio',
                volume: 'Volumen',
                marketCap: 'Cap. de Mercado',
                gainers: 'Mayores Ganancias',
                losers: 'Mayores Pérdidas',
                mostActive: 'Más Activos',
            },
            footer: {
                copyright: '© {{year}} Pearto. Todos los derechos reservados.',
                disclaimer: 'Datos del mercado retrasados. Solo uso educativo.',
            },
        },
    },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng',
        },
    });

export default i18n;
