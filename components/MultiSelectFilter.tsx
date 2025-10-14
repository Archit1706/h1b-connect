// components/MultiSelectFilter.tsx - OPTIMIZED
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';

interface MultiSelectFilterProps {
    label: string;
    options: string[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
}

export default function MultiSelectFilter({
    label,
    options,
    selectedValues,
    onChange,
    placeholder = 'Select options...'
}: MultiSelectFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Memoize filtered options to avoid recomputing on every render
    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        const lowerSearch = searchTerm.toLowerCase();
        return options.filter(option =>
            option.toLowerCase().includes(lowerSearch)
        );
    }, [options, searchTerm]);

    // Memoize selected set for O(1) lookup
    const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

    const handleToggle = (value: string) => {
        if (selectedSet.has(value)) {
            onChange(selectedValues.filter(v => v !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    };

    const handleClearAll = () => {
        onChange([]);
    };

    // Limit displayed options for performance
    const displayOptions = filteredOptions.slice(0, 200);
    const hasMore = filteredOptions.length > 200;

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
                {label}
            </label>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <span className="block truncate">
                    {selectedValues.length === 0 ? (
                        <span className="text-gray-500">{placeholder}</span>
                    ) : (
                        <span className="font-semibold">
                            {selectedValues.length} selected
                        </span>
                    )}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-80 overflow-hidden">
                    <div className="p-2 border-b">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>

                    {selectedValues.length > 0 && (
                        <div className="p-2 border-b bg-gray-50">
                            <button
                                onClick={handleClearAll}
                                className="text-sm text-red-600 hover:text-red-800 font-semibold"
                            >
                                Clear all ({selectedValues.length})
                            </button>
                        </div>
                    )}

                    <div className="overflow-y-auto max-h-60">
                        {displayOptions.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-700">
                                No options found
                            </div>
                        ) : (
                            <>
                                {displayOptions.map((option) => (
                                    <label
                                        key={option}
                                        className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedSet.has(option)}
                                            onChange={() => handleToggle(option)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="ml-3 text-sm">
                                            {option}
                                        </span>
                                    </label>
                                ))}
                                {hasMore && (
                                    <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50">
                                        Showing first 200 options. Use search to narrow down.
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {selectedValues.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedValues.slice(0, 5).map((value) => (
                        <span
                            key={value}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800"
                        >
                            {value.length > 20 ? value.substring(0, 20) + '...' : value}
                            <button
                                onClick={() => handleToggle(value)}
                                className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                    {selectedValues.length > 5 && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-200 text-gray-700">
                            +{selectedValues.length - 5} more
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}