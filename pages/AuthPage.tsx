
import React, { useState } from 'react';
import LoginForm from '../components/auth/Login';
import RegisterForm from '../components/auth/Register';
import { Feather } from 'lucide-react';
import type { User } from '../types';

interface AuthPageProps {
    onLogin: (email: string, password: string) => Promise<User>;
    onRegister: (email: string, password: string) => Promise<User>;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister }) => {
    const [isRegisterView, setIsRegisterView] = useState(false);

    return (
        <div className="relative flex items-center justify-center min-h-screen w-screen overflow-hidden bg-gray-900 p-4">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2">
                    <div className="h-full w-full bg-[conic-gradient(from_90deg_at_50%_50%,#16a34a_0%,#0ea5e9_50%,#16a34a_100%)] animate-rotate-bg opacity-20 blur-3xl"></div>
                </div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center gap-3 mb-4">
                         <Feather className="h-10 w-10 text-teal-400" />
                         <span className="text-3xl font-bold text-white">Bacol Bigalow</span>
                    </div>
                    <p className="text-gray-400">Silakan masuk untuk melanjutkan ke dashboard Anda.</p>
                </div>
                
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl shadow-2xl p-8 backdrop-blur-lg">
                    {isRegisterView ? (
                        <RegisterForm onRegister={onRegister} onSwitchToLogin={() => setIsRegisterView(false)} />
                    ) : (
                        <LoginForm onLogin={onLogin} onSwitchToRegister={() => setIsRegisterView(true)} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
