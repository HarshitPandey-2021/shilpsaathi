import React from 'react';
import { CraftProvider, useCraft } from './context/CraftContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import LoadingOverlay from './components/LoadingOverlay';
import ProgressDots from './components/ProgressDots';

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
 <main className="p-5 min-h-0 flex-1 flex flex-col justify-start overflow-y-auto scrollbar-hide">
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
// App.jsx — replace the outer wrapper
export default function App() {
  return (
    <CraftProvider>
      <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-stone-200 flex items-center justify-center p-0 sm:p-6 font-sans antialiased selection:bg-amber-100">
  <div className="w-full max-w-md sm:rounded-[2.5rem] sm:border-8 sm:border-stone-900 bg-ivory text-charcoal min-h-screen sm:min-h-[90vh] sm:max-h-[880px] flex flex-col justify-between shadow-2xl relative pb-20 sm:overflow-hidden">
          <Header />
          <ProgressDots />
          <LoadingOverlay />
          <FlowManager />
          <BottomNav />
        </div>
      </div>
    </CraftProvider>
  );
}