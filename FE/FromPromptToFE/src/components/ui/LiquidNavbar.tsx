
import { Link } from 'react-router-dom';
import GlassSurface from '../GlassSurface';

const LiquidNavbar = () => {
    return (
        <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
            <GlassSurface
                width="100%"
                height={50}
                borderRadius={100}
                backgroundOpacity={0.05}
                blur={12}
                brightness={55}
                opacity={0.95}
                saturation={1.2}
                className="max-w-[750px] w-fit"
            >
                <div className="flex w-full items-center justify-between px-8">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-white">auto_awesome</span>
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
                        <Link to="/register" className="relative group text-neutral-200 hover:text-white transition-colors text-sm font-medium">
                            Register
                            <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-white -translate-x-1/2 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    </div>
                </div>
            </GlassSurface>
        </nav>
    );
};

export default LiquidNavbar;
