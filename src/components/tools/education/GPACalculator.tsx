'use client';

import { useState, useMemo } from 'react';
import CalculatorLayout from '../CalculatorLayout';
import { GraduationCap, Book, Star, TrendingUp } from 'lucide-react';

interface Course {
    name: string;
    credits: number;
    grade: string;
}

const GRADE_POINTS: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0
};

export default function GPACalculator() {
    const [courses, setCourses] = useState<Course[]>([
        { name: '', credits: 3, grade: 'A' },
        { name: '', credits: 3, grade: 'B+' },
        { name: '', credits: 3, grade: 'A-' },
    ]);
    const [previousGPA, setPreviousGPA] = useState<string>('');
    const [previousCredits, setPreviousCredits] = useState<string>('');

    const results = useMemo(() => {
        const validCourses = courses.filter(c => c.grade && c.credits > 0);

        let totalPoints = 0;
        let totalCredits = 0;

        validCourses.forEach(course => {
            totalPoints += GRADE_POINTS[course.grade] * course.credits;
            totalCredits += course.credits;
        });

        const semesterGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;

        // Calculate cumulative GPA if previous provided
        let cumulativeGPA = semesterGPA;
        if (previousGPA && previousCredits) {
            const prevGPA = parseFloat(previousGPA);
            const prevCredits = parseFloat(previousCredits);
            const prevPoints = prevGPA * prevCredits;
            cumulativeGPA = (prevPoints + totalPoints) / (prevCredits + totalCredits);
        }

        return {
            semesterGPA,
            totalCredits,
            cumulativeGPA,
            gradeDistribution: validCourses.reduce((acc, c) => {
                acc[c.grade] = (acc[c.grade] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        };
    }, [courses, previousGPA, previousCredits]);

    const updateCourse = (index: number, field: keyof Course, value: string | number) => {
        const updated = [...courses];
        updated[index] = { ...updated[index], [field]: value };
        setCourses(updated);
    };

    const addCourse = () => {
        setCourses([...courses, { name: '', credits: 3, grade: 'A' }]);
    };

    const removeCourse = (index: number) => {
        if (courses.length > 1) {
            setCourses(courses.filter((_, i) => i !== index));
        }
    };

    const getGPAColor = (gpa: number) => {
        if (gpa >= 3.5) return 'text-emerald-600';
        if (gpa >= 3.0) return 'text-blue-600';
        if (gpa >= 2.0) return 'text-amber-600';
        return 'text-red-500';
    };

    return (
        <CalculatorLayout
            title="GPA Calculator"
            description="Calculate your semester and cumulative GPA"
            category="Education & Study"
            results={
                <div className="space-y-4">
                    <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl">
                        <GraduationCap className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 mb-1">Semester GPA</p>
                        <p className={`text-5xl font-bold ${getGPAColor(results.semesterGPA)}`}>
                            {results.semesterGPA.toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            {results.totalCredits} credits
                        </p>
                    </div>

                    {previousGPA && previousCredits && (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl text-center">
                            <p className="text-xs text-slate-500 mb-1">Cumulative GPA</p>
                            <p className={`text-3xl font-bold ${getGPAColor(results.cumulativeGPA)}`}>
                                {results.cumulativeGPA.toFixed(2)}
                            </p>
                        </div>
                    )}

                    {/* Grade Distribution */}
                    {Object.keys(results.gradeDistribution).length > 0 && (
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl">
                            <p className="text-xs text-slate-500 mb-3">Grade Distribution</p>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(results.gradeDistribution).map(([grade, count]) => (
                                    <span
                                        key={grade}
                                        className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-700 rounded-full"
                                    >
                                        {grade}: {count}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* GPA Scale */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-2">GPA Scale</p>
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                            <span>Dean's List: 3.5+</span>
                            <span>Good: 3.0+</span>
                            <span>Pass: 2.0+</span>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Courses */}
                <div className="space-y-3">
                    {courses.map((course, index) => (
                        <div key={index} className="flex gap-2 items-end">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={course.name}
                                    onChange={(e) => updateCourse(index, 'name', e.target.value)}
                                    placeholder={`Course ${index + 1}`}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                />
                            </div>
                            <div className="w-20">
                                <input
                                    type="number"
                                    value={course.credits}
                                    onChange={(e) => updateCourse(index, 'credits', Number(e.target.value))}
                                    min={1}
                                    max={6}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                />
                            </div>
                            <div className="w-20">
                                <select
                                    value={course.grade}
                                    onChange={(e) => updateCourse(index, 'grade', e.target.value)}
                                    className="w-full px-2 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                >
                                    {Object.keys(GRADE_POINTS).map(g => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={() => removeCourse(index)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    onClick={addCourse}
                    className="w-full py-2 text-sm text-emerald-600 border border-dashed border-emerald-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition"
                >
                    + Add Course
                </button>

                {/* Previous GPA */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        Previous Cumulative (optional)
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Previous GPA</label>
                            <input
                                type="number"
                                value={previousGPA}
                                onChange={(e) => setPreviousGPA(e.target.value)}
                                placeholder="3.50"
                                step="0.01"
                                min="0"
                                max="4"
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Previous Credits</label>
                            <input
                                type="number"
                                value={previousCredits}
                                onChange={(e) => setPreviousCredits(e.target.value)}
                                placeholder="60"
                                min="0"
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </CalculatorLayout>
    );
}
