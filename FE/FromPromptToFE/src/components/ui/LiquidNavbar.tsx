
import { Link } from 'react-router-dom';

const LiquidNavbar = () => {
    return (
        <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center">
            <div className="flex items-center justify-between px-8 py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] w-fit min-w-[750px]">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    <span className="text-white font-medium text-lg tracking-wide">AI CodeGen</span>
                </div>

                <div className="flex items-center gap-8">
                    <Link to="/" className="relative group text-neutral-200 hover:text-white transition-colors text-sm font-medium">
                        Home
                        <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-white -translate-x-1/2 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <Link to="/login" className="relative group text-neutral-200 hover:text-white transition-colors text-sm font-medium">
                        Login
                        <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-white -translate-x-1/2 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default LiquidNavbar;
