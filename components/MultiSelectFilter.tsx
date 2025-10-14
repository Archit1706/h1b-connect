// components/MultiSelectFilter.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

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

    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggle = (value: string) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter(v => v !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    };

    const handleClearAll = () => {
        onChange([]);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
                {label}
            </label>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
            >
                <span className="block truncate text-gray-900">
                    {selectedValues.length === 0 ? (
                        <span className="text-gray-500">{placeholder}</span>
                    ) : (
                        <span className="text-gray-900 font-semibold">
                            {selectedValues.length} selected
                        </span>
                    )}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                    <div className="p-2 border-b border-gray-200">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                        />
                    </div>

                    {selectedValues.length > 0 && (
                        <div className="p-2 border-b border-gray-200 bg-gray-50">
                            <button
                                onClick={handleClearAll}
                                className="text-sm text-red-600 hover:text-red-800 font-semibold"
                            >
                                Clear all ({selectedValues.length})
                            </button>
                        </div>
                    )}

                    <div className="overflow-y-auto max-h-60">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-700 font-medium">
                                No options found
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <label
                                    key={option}
                                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedValues.includes(option)}
                                        onChange={() => handleToggle(option)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-3 text-sm text-gray-900 font-medium">
                                        {option}
                                    </span>
                                </label>
                            ))
                        )}
                    </div>
                </div>
            )}

            {selectedValues.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedValues.map((value) => (
                        <span
                            key={value}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800"
                        >
                            {value}
                            <button
                                onClick={() => handleToggle(value)}
                                className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}