// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    const isEmailPage = pathname?.startsWith('/email');

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
                        H1B Connect
                    </Link>

                    <div className="flex items-center space-x-6">
                        <Link
                            href="/#about"
                            className="text-gray-800 font-medium hover:text-blue-600 transition-colors"
                        >
                            Features
                        </Link>

                        {isEmailPage ? (
                            <>
                                {pathname !== '/email/test' && (
                                    <Link
                                        href="/email/test"
                                        target="_blank"
                                        className="text-gray-800 font-medium hover:text-blue-600 transition-colors"
                                    >
                                        Test Email
                                    </Link>
                                )}
                                {pathname !== '/email' && (
                                    <Link
                                        href="/email"
                                        className="text-gray-800 font-medium hover:text-blue-600 transition-colors"
                                    >
                                        Email Tool
                                    </Link>
                                )}
                                <button
                                    onClick={() => {
                                        document.cookie = 'token=; Max-Age=0; path=/';
                                        window.location.href = '/';
                                    }}
                                    className="text-gray-800 font-medium hover:text-red-600 transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-gray-800 font-medium hover:text-blue-600 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-blue-600 !text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}