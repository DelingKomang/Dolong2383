import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface NotificationProps {
    message: string;
    show: boolean;
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, show, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000); // Auto-hide after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    return (
        <div
            className={`fixed top-20 right-5 z-50 transition-all duration-300 ease-in-out ${
                show ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'
            }`}
        >
            {show && (
                <div className="flex items-center gap-4 bg-teal-600/90 backdrop-blur-md border border-teal-500 text-white p-4 rounded-lg shadow-2xl shadow-teal-500/20">
                    <CheckCircle className="h-6 w-6 text-white flex-shrink-0" />
                    <p className="font-semibold">{message}</p>
                    <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Notification;