/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

const primaryButtonClasses = "font-permanent-marker text-xl text-center text-black bg-yellow-400 py-3 px-8 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:-rotate-2 hover:bg-yellow-300 shadow-[2px_2px_0px_2px_rgba(0,0,0,0.2)] disabled:opacity-50";

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate a network request
        setTimeout(() => {
            if (password === 'Raju') {
                onLoginSuccess();
            } else {
                setError('Incorrect password. Please try again.');
            }
            setIsLoading(false);
            setPassword('');
        }, 500);
    };

    return (
        <div className="z-10 w-full h-full flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-sm bg-neutral-900/50 border border-neutral-800 rounded-lg p-8 text-center"
            >
                <h2 className="text-4xl md:text-5xl font-caveat font-bold text-neutral-100 mb-4">Admin Access</h2>
                <p className="font-permanent-marker text-neutral-400 mb-8">Enter the password to manage content.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full p-3 bg-neutral-800 border-2 border-neutral-700 rounded-md text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors"
                            aria-label="Password for admin panel"
                        />
                    </div>
                    
                    {error && (
                        <p className="text-red-500 text-sm font-bold">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !password}
                        className={primaryButtonClasses}
                    >
                        {isLoading ? 'Verifying...' : 'Login'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default LoginPage;