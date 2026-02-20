'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { Globe, MapPin, Star, ChevronRight, RotateCcw } from 'lucide-react';

interface Destination {
    name: string;
    country: string;
    description: string;
    budget: 'low' | 'mid' | 'high';
    climate: 'tropical' | 'temperate' | 'cold' | 'arid';
    activity: 'adventure' | 'culture' | 'relaxation' | 'nightlife';
    duration: 'short' | 'medium' | 'long';
    continent: 'asia' | 'europe' | 'americas' | 'africa' | 'oceania';
}

const DESTINATIONS: Destination[] = [
    { name: 'Bali', country: 'Indonesia', description: 'Tropical paradise with stunning temples, rice terraces, and vibrant culture. Perfect for relaxation and spiritual exploration.', budget: 'low', climate: 'tropical', activity: 'relaxation', duration: 'medium', continent: 'asia' },
    { name: 'Bangkok', country: 'Thailand', description: 'Bustling city with ornate shrines, vibrant street life, incredible street food, and legendary nightlife.', budget: 'low', climate: 'tropical', activity: 'nightlife', duration: 'short', continent: 'asia' },
    { name: 'Tokyo', country: 'Japan', description: 'Ultra-modern metropolis blending cutting-edge technology with ancient traditions, world-class cuisine, and unique culture.', budget: 'high', climate: 'temperate', activity: 'culture', duration: 'medium', continent: 'asia' },
    { name: 'Kyoto', country: 'Japan', description: 'Ancient capital with thousands of classical Buddhist temples, stunning gardens, and traditional geisha districts.', budget: 'mid', climate: 'temperate', activity: 'culture', duration: 'medium', continent: 'asia' },
    { name: 'Nepal', country: 'Nepal', description: 'Home to the Himalayas, offering world-class trekking, ancient temples, and breathtaking mountain scenery.', budget: 'low', climate: 'cold', activity: 'adventure', duration: 'long', continent: 'asia' },
    { name: 'Paris', country: 'France', description: 'The City of Light — world-famous museums, gourmet cuisine, romantic architecture, and unmatched cultural heritage.', budget: 'high', climate: 'temperate', activity: 'culture', duration: 'medium', continent: 'europe' },
    { name: 'Barcelona', country: 'Spain', description: 'Vibrant coastal city with Gaudí architecture, beautiful beaches, tapas culture, and electric nightlife.', budget: 'mid', climate: 'temperate', activity: 'nightlife', duration: 'short', continent: 'europe' },
    { name: 'Reykjavik', country: 'Iceland', description: 'Gateway to stunning natural wonders: Northern Lights, geysers, glaciers, and volcanic landscapes.', budget: 'high', climate: 'cold', activity: 'adventure', duration: 'short', continent: 'europe' },
    { name: 'Lisbon', country: 'Portugal', description: 'Charming hillside city with pastel buildings, historic tram rides, amazing seafood, and warm weather.', budget: 'low', climate: 'temperate', activity: 'culture', duration: 'short', continent: 'europe' },
    { name: 'Swiss Alps', country: 'Switzerland', description: 'Spectacular mountain landscapes ideal for skiing, hiking, and enjoying pristine alpine villages.', budget: 'high', climate: 'cold', activity: 'adventure', duration: 'medium', continent: 'europe' },
    { name: 'Santorini', country: 'Greece', description: 'Iconic white-washed buildings, azure seas, breathtaking sunsets, and Mediterranean cuisine perfection.', budget: 'mid', climate: 'temperate', activity: 'relaxation', duration: 'short', continent: 'europe' },
    { name: 'Costa Rica', country: 'Costa Rica', description: 'Biodiversity hotspot with lush rainforests, pristine beaches, zip-lining, and incredible wildlife.', budget: 'mid', climate: 'tropical', activity: 'adventure', duration: 'medium', continent: 'americas' },
    { name: 'New York City', country: 'USA', description: 'The city that never sleeps — Broadway, world-class museums, diverse cuisine, and iconic landmarks.', budget: 'high', climate: 'temperate', activity: 'culture', duration: 'short', continent: 'americas' },
    { name: 'Cancún', country: 'Mexico', description: 'Caribbean beaches, Mayan ruins, all-inclusive resorts, and vibrant nightlife scene.', budget: 'mid', climate: 'tropical', activity: 'relaxation', duration: 'short', continent: 'americas' },
    { name: 'Patagonia', country: 'Argentina', description: 'Untamed wilderness with glaciers, mountains, and some of the most dramatic landscapes on Earth.', budget: 'mid', climate: 'cold', activity: 'adventure', duration: 'long', continent: 'americas' },
    { name: 'Marrakech', country: 'Morocco', description: 'Sensory overload in the best way — colorful souks, fragrant spices, stunning palaces, and desert excursions.', budget: 'low', climate: 'arid', activity: 'culture', duration: 'short', continent: 'africa' },
    { name: 'Cape Town', country: 'South Africa', description: 'Stunning coastal city with Table Mountain, wine country, wildlife safaris, and vibrant food scene.', budget: 'mid', climate: 'temperate', activity: 'adventure', duration: 'medium', continent: 'africa' },
    { name: 'Serengeti', country: 'Tanzania', description: 'Witness the Great Migration and experience the world\'s most iconic safari destination.', budget: 'high', climate: 'arid', activity: 'adventure', duration: 'medium', continent: 'africa' },
    { name: 'Sydney', country: 'Australia', description: 'Iconic harbour, beautiful beaches, world-class dining, and a laid-back outdoor lifestyle.', budget: 'high', climate: 'temperate', activity: 'relaxation', duration: 'long', continent: 'oceania' },
    { name: 'New Zealand', country: 'New Zealand', description: 'Adventure capital of the world — bungee jumping, Lord of the Rings landscapes, and Maori culture.', budget: 'mid', climate: 'temperate', activity: 'adventure', duration: 'long', continent: 'oceania' },
    { name: 'Dubai', country: 'UAE', description: 'Futuristic city with record-breaking skyscrapers, luxury shopping, desert adventures, and year-round sun.', budget: 'high', climate: 'arid', activity: 'nightlife', duration: 'short', continent: 'asia' },
    { name: 'Vietnam', country: 'Vietnam', description: 'Rich history, stunning natural beauty, incredible street food, and one of the best-value destinations worldwide.', budget: 'low', climate: 'tropical', activity: 'culture', duration: 'medium', continent: 'asia' },
    { name: 'Maldives', country: 'Maldives', description: 'Overwater bungalows, crystal-clear lagoons, world-class diving, and ultimate tropical relaxation.', budget: 'high', climate: 'tropical', activity: 'relaxation', duration: 'short', continent: 'asia' },
    { name: 'Peru', country: 'Peru', description: 'Home to Machu Picchu, the Amazon rainforest, incredible cuisine, and ancient Incan heritage.', budget: 'low', climate: 'temperate', activity: 'adventure', duration: 'medium', continent: 'americas' },
];

type Step = 'budget' | 'climate' | 'activity' | 'duration' | 'continent' | 'results';
const STEPS: Step[] = ['budget', 'climate', 'activity', 'duration', 'continent', 'results'];

export default function TravelDestinationQuiz() {
    const [budget, setBudget] = useState<string>('');
    const [climate, setClimate] = useState<string>('');
    const [activity, setActivity] = useState<string>('');
    const [duration, setDuration] = useState<string>('');
    const [continent, setContinent] = useState<string>('');
    const [currentStep, setCurrentStep] = useState(0);

    const matches = useMemo(() => {
        return DESTINATIONS.map(dest => {
            let score = 0;
            let total = 0;
            if (budget) { total++; if (dest.budget === budget) score++; }
            if (climate) { total++; if (dest.climate === climate) score++; }
            if (activity) { total++; if (dest.activity === activity) score++; }
            if (duration) { total++; if (dest.duration === duration) score++; }
            if (continent) { total++; if (dest.continent === continent) score++; }
            return { ...dest, score, total, pct: total > 0 ? Math.round((score / total) * 100) : 0 };
        })
            .filter(d => d.pct > 0)
            .sort((a, b) => b.pct - a.pct);
    }, [budget, climate, activity, duration, continent]);

    const reset = () => {
        setBudget(''); setClimate(''); setActivity(''); setDuration(''); setContinent('');
        setCurrentStep(0);
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));

    const answered = [budget, climate, activity, duration, continent].filter(Boolean).length;

    const renderOption = (value: string, current: string, setter: (v: string) => void, label: string, emoji: string) => (
        <button
            key={value}
            onClick={() => { setter(value); nextStep(); }}
            className={`flex items-center gap-3 p-3 rounded-lg border text-left transition ${current === value
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
        >
            <span className="text-xl">{emoji}</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
            {current === value && <Star size={14} className="ml-auto text-emerald-500" />}
        </button>
    );

    return (
        <CalculatorLayout
            title="Travel Destination Quiz"
            description="Find your perfect travel destination based on your preferences"
            category="Travel"
            insights={[
                { label: 'Answered', value: `${answered}/5` },
                { label: 'Matches', value: `${matches.length}`, color: 'text-blue-600' },
                { label: 'Top Match', value: matches[0]?.name || '-', color: 'text-emerald-600' },
                { label: 'Score', value: matches[0] ? `${matches[0].pct}%` : '-', color: 'text-purple-600' },
            ]}
            results={
                <div className="space-y-4">
                    {answered === 0 ? (
                        <div className="text-center p-8 text-slate-400">
                            <Globe className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">Answer the questions to discover your ideal destination</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center p-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                                <Globe className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">Destinations Found</p>
                                <p className="text-4xl font-bold text-emerald-600">{matches.length}</p>
                                <p className="text-sm text-slate-500 mt-1">Based on {answered} preference{answered !== 1 ? 's' : ''}</p>
                            </div>

                            {matches.slice(0, 8).map((dest, i) => (
                                <div key={dest.name}
                                    className={`p-4 rounded-xl border ${i === 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                                    <div className="flex items-start justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            {i === 0 && <Star size={14} className="text-amber-500" />}
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">{dest.name}</h3>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${dest.pct >= 80 ? 'bg-emerald-100 text-emerald-700' : dest.pct >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {dest.pct}% match
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <MapPin size={10} className="text-slate-400" />
                                        <span className="text-xs text-slate-500">{dest.country}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{dest.description}</p>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {[
                                            { label: dest.budget, match: dest.budget === budget },
                                            { label: dest.climate, match: dest.climate === climate },
                                            { label: dest.activity, match: dest.activity === activity },
                                            { label: dest.duration, match: dest.duration === duration },
                                            { label: dest.continent, match: dest.continent === continent },
                                        ].map(tag => (
                                            <span key={tag.label}
                                                className={`text-[10px] px-1.5 py-0.5 rounded-full ${tag.match ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                                {tag.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                {/* Progress */}
                <div className="flex gap-1">
                    {STEPS.slice(0, 5).map((_, i) => (
                        <div key={i} className={`flex-1 h-1.5 rounded-full transition ${i < answered ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    ))}
                </div>

                {/* Step: Budget */}
                <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">1. Budget Range</p>
                    <div className="space-y-2">
                        {renderOption('low', budget, setBudget, 'Budget-Friendly', '💰')}
                        {renderOption('mid', budget, setBudget, 'Mid-Range', '💵')}
                        {renderOption('high', budget, setBudget, 'Luxury', '💎')}
                    </div>
                </div>

                {/* Step: Climate */}
                <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">2. Climate Preference</p>
                    <div className="space-y-2">
                        {renderOption('tropical', climate, setClimate, 'Tropical & Warm', '🌴')}
                        {renderOption('temperate', climate, setClimate, 'Temperate & Mild', '🌤️')}
                        {renderOption('cold', climate, setClimate, 'Cold & Snowy', '❄️')}
                        {renderOption('arid', climate, setClimate, 'Dry & Desert', '🏜️')}
                    </div>
                </div>

                {/* Step: Activity */}
                <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">3. Activity Type</p>
                    <div className="space-y-2">
                        {renderOption('adventure', activity, setActivity, 'Adventure & Outdoors', '🏔️')}
                        {renderOption('culture', activity, setActivity, 'Culture & History', '🏛️')}
                        {renderOption('relaxation', activity, setActivity, 'Relaxation & Beach', '🏖️')}
                        {renderOption('nightlife', activity, setActivity, 'Nightlife & Food', '🍸')}
                    </div>
                </div>

                {/* Step: Duration */}
                <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">4. Trip Duration</p>
                    <div className="space-y-2">
                        {renderOption('short', duration, setDuration, 'Short (3-5 days)', '⚡')}
                        {renderOption('medium', duration, setDuration, 'Medium (1-2 weeks)', '📅')}
                        {renderOption('long', duration, setDuration, 'Long (2+ weeks)', '🗓️')}
                    </div>
                </div>

                {/* Step: Continent */}
                <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">5. Continent Preference</p>
                    <div className="space-y-2">
                        {renderOption('asia', continent, setContinent, 'Asia', '🌏')}
                        {renderOption('europe', continent, setContinent, 'Europe', '🌍')}
                        {renderOption('americas', continent, setContinent, 'Americas', '🌎')}
                        {renderOption('africa', continent, setContinent, 'Africa', '🌍')}
                        {renderOption('oceania', continent, setContinent, 'Oceania', '🏝️')}
                    </div>
                </div>

                <button onClick={reset}
                    className="w-full py-2.5 text-sm text-slate-500 hover:text-red-500 flex items-center justify-center gap-1.5 transition">
                    <RotateCcw size={14} /> Reset Quiz
                </button>
            </div>
        </CalculatorLayout>
    );
}
