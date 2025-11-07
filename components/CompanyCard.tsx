// components/CompanyCard.tsx
'use client';

import { LCARecord } from '@/types';
import { useState } from 'react';

interface CompanyCardProps {
    record: LCARecord;
    isSelected: boolean;
    isApplied: boolean;
    onToggleSelect: () => void;
    onViewDetails: () => void;
}

const getDomainColor = (domain: string): string => {
    const colorMap: Record<string, string> = {
        'Software Engineering': 'bg-blue-100 text-blue-800 border-blue-200',
        'AI/ML': 'bg-purple-100 text-purple-800 border-purple-200',
        'Full-Stack': 'bg-indigo-100 text-indigo-800 border-indigo-200',
        'Backend': 'bg-slate-100 text-slate-800 border-slate-200',
        'Frontend': 'bg-pink-100 text-pink-800 border-pink-200',
        'DevOps': 'bg-green-100 text-green-800 border-green-200',
        'Data Engineering': 'bg-teal-100 text-teal-800 border-teal-200',
        'Database': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    };
    return colorMap[domain] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getVisaStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('certified') && !statusLower.includes('withdrawn')) {
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    } else if (statusLower.includes('withdrawn')) {
        return 'bg-amber-100 text-amber-800 border-amber-200';
    } else if (statusLower.includes('denied')) {
        return 'bg-red-100 text-red-800 border-red-200';
    }
    return 'bg-blue-100 text-blue-800 border-blue-200';
};

export default function CompanyCard({ record, isSelected, isApplied, onToggleSelect, onViewDetails }: CompanyCardProps) {
    const canSelect = record.EMPLOYER_POC_EMAIL && !isApplied;

    return (
        <div className={`
            relative bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg
            ${isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200'}
            ${isApplied ? 'opacity-60' : 'hover:border-gray-300'}
        `}>
            {/* Applied Badge */}
            {isApplied && (
                <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Applied
                    </span>
                </div>
            )}

            <div className="p-6">
                {/* Header with Checkbox */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 pt-1">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={onToggleSelect}
                            disabled={!canSelect}
                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title={isApplied ? 'Already applied' : !record.EMPLOYER_POC_EMAIL ? 'No email available' : 'Select for bulk email'}
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        {/* Company Name */}
                        <h3 className="text-lg font-bold text-gray-900 truncate mb-1">
                            {record.EMPLOYER_NAME}
                        </h3>

                        {/* Job Title */}
                        <p className="text-base font-semibold text-gray-700 mb-3">
                            {record.JOB_TITLE}
                        </p>

                        {/* Tags Row */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {/* Job Domain */}
                            {record.JOB_DOMAIN && (
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getDomainColor(record.JOB_DOMAIN)}`}>
                                    {record.JOB_DOMAIN}
                                </span>
                            )}

                            {/* Visa Status */}
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getVisaStatusColor(record.CASE_STATUS)}`}>
                                {record.CASE_STATUS}
                            </span>

                            {/* Wage Level */}
                            {record.PW_WAGE_LEVEL && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                    Level {record.PW_WAGE_LEVEL}
                                </span>
                            )}
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            {/* Location */}
                            <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-gray-700 font-medium">
                                    {record.EMPLOYER_CITY}, {record.EMPLOYER_STATE}
                                </span>
                            </div>

                            {/* Wage */}
                            <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-900 font-bold">
                                    ${record.WAGE_RATE_OF_PAY_FROM}
                                </span>
                            </div>

                            {/* Email */}
                            <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-blue-600 font-medium text-xs truncate">
                                    {record.EMPLOYER_POC_EMAIL || 'No email'}
                                </span>
                            </div>

                            {/* SOC Title */}
                            <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-600 text-xs truncate">
                                    {record.SOC_TITLE}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button
                        onClick={onViewDetails}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        View Details
                    </button>

                    {!record.EMPLOYER_POC_EMAIL && (
                        <span className="text-xs text-gray-500 font-medium">
                            No contact email
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}