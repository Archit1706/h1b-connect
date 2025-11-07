// components/FilterSidebar.tsx
'use client';

import { useState } from 'react';
import MultiSelectFilter from './MultiSelectFilter';

interface FilterSidebarProps {
    filterValues: any;
    selectedFilters: Record<string, string[]>;
    onFilterChange: (column: string, values: string[]) => void;
    onClearAll: () => void;
    isOpen: boolean;
    onToggle: () => void;
}

export default function FilterSidebar({
    filterValues,
    selectedFilters,
    onFilterChange,
    onClearAll,
    isOpen,
    onToggle
}: FilterSidebarProps) {
    const activeFilterCount = Object.values(selectedFilters).reduce(
        (sum, values) => sum + values.length,
        0
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:sticky top-0 left-0 h-screen bg-white border-r-2 border-gray-100 z-50 transition-transform duration-300 ease-in-out overflow-y-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                w-80 lg:w-96
            `}>
                {/* Header */}
                <div className="sticky top-0 bg-white border-b-2 border-gray-100 px-6 py-5 z-10">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                        <button
                            onClick={onToggle}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    {activeFilterCount > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 font-medium">
                                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                            </span>
                            <button
                                onClick={onClearAll}
                                className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>

                {/* Filter Groups */}
                <div className="p-6 space-y-6">
                    {/* Job Filters */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Job Criteria</h3>
                        <div className="space-y-4">
                            <MultiSelectFilter
                                label="Job Domain"
                                options={filterValues.JOB_DOMAIN || []}
                                selectedValues={selectedFilters.JOB_DOMAIN || []}
                                onChange={(values) => onFilterChange('JOB_DOMAIN', values)}
                            />
                            <MultiSelectFilter
                                label="Job Title"
                                options={filterValues.JOB_TITLE || []}
                                selectedValues={selectedFilters.JOB_TITLE || []}
                                onChange={(values) => onFilterChange('JOB_TITLE', values)}
                            />
                            <MultiSelectFilter
                                label="SOC Title"
                                options={filterValues.SOC_TITLE || []}
                                selectedValues={selectedFilters.SOC_TITLE || []}
                                onChange={(values) => onFilterChange('SOC_TITLE', values)}
                            />
                        </div>
                    </div>

                    {/* Location Filters */}
                    <div className="pt-6 border-t-2 border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Location</h3>
                        <div className="space-y-4">
                            <MultiSelectFilter
                                label="State"
                                options={filterValues.EMPLOYER_STATE || []}
                                selectedValues={selectedFilters.EMPLOYER_STATE || []}
                                onChange={(values) => onFilterChange('EMPLOYER_STATE', values)}
                            />
                            <MultiSelectFilter
                                label="City"
                                options={filterValues.EMPLOYER_CITY || []}
                                selectedValues={selectedFilters.EMPLOYER_CITY || []}
                                onChange={(values) => onFilterChange('EMPLOYER_CITY', values)}
                            />
                        </div>
                    </div>

                    {/* Visa Filters */}
                    <div className="pt-6 border-t-2 border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Visa Details</h3>
                        <div className="space-y-4">
                            <MultiSelectFilter
                                label="Case Status"
                                options={filterValues.CASE_STATUS || []}
                                selectedValues={selectedFilters.CASE_STATUS || []}
                                onChange={(values) => onFilterChange('CASE_STATUS', values)}
                            />
                            <MultiSelectFilter
                                label="Wage Level"
                                options={filterValues.PW_WAGE_LEVEL || []}
                                selectedValues={selectedFilters.PW_WAGE_LEVEL || []}
                                onChange={(values) => onFilterChange('PW_WAGE_LEVEL', values)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}