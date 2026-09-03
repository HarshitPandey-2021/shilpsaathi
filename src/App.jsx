import React from 'react';
import { CraftProvider, useCraft } from './context/CraftContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import LoadingOverlay from './components/LoadingOverlay';

// Screen Imports
import OnboardingScreen from './screens/01_Onboarding';
import HomeScreen from './screens/02_Home';
import CaptureScreen from './screens/03_Capture';
import ImageStudioScreen from './screens/04_ImageStudio';
import VoiceInputScreen from './screens/05_VoiceInput';
import CatalogEditScreen from './screens/06_CatalogEdit';
import PricingScreen from './screens/07_Pricing';
import ReviewScreen from './screens/08_Review';
import FinalListingScreen from './screens/09_FinalListing';

function FlowManager() {
  const { currentStep } = useCraft();

  return (
    <main className="p-5 flex-1 flex flex-col justify-center">
      {currentStep === 1 && <OnboardingScreen />}
      {currentStep === 2 && <HomeScreen />}
      {currentStep === 3 && <CaptureScreen />}
      {currentStep === 4 && <ImageStudioScreen />}
      {currentStep === 5 && <VoiceInputScreen />}
      {currentStep === 6 && <CatalogEditScreen />}
      {currentStep === 7 && <PricingScreen />}
      {currentStep === 8 && <ReviewScreen />}
      {currentStep === 9 && <FinalListingScreen />}
    </main>
  );
}

export default function App() {
  return (
    <CraftProvider>
      <div className="flex justify-center min-h-screen bg-stone-900/10 font-sans antialiased selection:bg-amber-100">
        <div className="w-full max-w-md bg-ivory text-charcoal min-h-screen flex flex-col justify-between shadow-2xl relative pb-20 border-x border-stone-200">
          <Header />
          <LoadingOverlay />
          <FlowManager />
          <BottomNav />
        </div>
      </div>
    </CraftProvider>
  );
}