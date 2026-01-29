import Footer from "../../components/Footer";
import DarkVeil from "../../components/ui/DarkVeil"
import LiquidNavbar from "../../components/ui/LiquidNavbar"
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div className="relative w-full h-screen overflow-hidden flex flex-col justify-center items-center bg-black text-white">
            <LiquidNavbar />
            <div className="absolute inset-0 z-0">
                <DarkVeil
                    hueShift={0}
                    noiseIntensity={0}
                    scanlineIntensity={0}
                    speed={1}
                    scanlineFrequency={0}
                    warpAmount={0}
                />
            </div>
            <div className="z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center gap-8">
                {/* Title */}
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                    Transform Ideas <br />
                    into Interfaces
                </h1>

                {/* Buttons */}
                <div className="flex items-center gap-4 mt-4">
                    <Link to="/login" className="px-12 py-4 rounded-full bg-white text-xl text-black font-semibold hover:bg-neutral-200 transition-colors">
                        Get Started
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 w-full z-10">
                <Footer />
            </div>
        </div>
    )
}

export default HomePage