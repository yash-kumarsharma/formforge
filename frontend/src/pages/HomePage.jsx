import React, { useEffect } from 'react';
import HeroSection from '../components/homepage/HeroSection';
import FeaturesShowcase from '../components/homepage/FeaturesShowcase';
import TemplateShowcase from '../components/homepage/TemplateShowcase';
import HowItWorks from '../components/homepage/HowItWorks';
import StatsSection from '../components/homepage/StatsSection';
import Footer from '../components/Footer';
import PublicHeader from '../components/PublicHeader';
import AOS from 'aos';
import 'aos/dist/aos.css';

const HomePage = () => {
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
            easing: 'ease-out-cubic'
        });
    }, []);

    return (
        <div className="homepage">
            <PublicHeader />
            <HeroSection />
            <FeaturesShowcase />
            <HowItWorks />
            <TemplateShowcase />
            <StatsSection />
            <Footer />
        </div>
    );
};

export default HomePage;
