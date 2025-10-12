'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="text-2xl font-bold text-blue-600">
                        H1B Connect
                    </Link>

                    <div className="flex items-center space-x-6">
                        <Link
                            href="/#about"
                            className="text-gray-700 hover:text-blue-600"
                        >
                            Features
                        </Link>

                        {pathname === '/email' ? (
                            <button
                                onClick={() => {
                                    document.cookie = 'token=; Max-Age=0; path=/';
                                    window.location.href = '/';
                                }}
                                className="text-gray-700 hover:text-blue-600"
                            >
                                Logout
                            </button>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-gray-700 hover:text-blue-600"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
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