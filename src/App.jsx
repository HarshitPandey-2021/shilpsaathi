import React from 'react';
import { CraftProvider, useCraft } from './context/CraftContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import LoadingOverlay from './components/LoadingOverlay';

import OnboardingScreen  from './screens/01_Onboarding';
import HomeScreen        from './screens/02_Home';
import CaptureScreen     from './screens/03_Capture';
import ImageStudioScreen from './screens/04_ImageStudio';
import VoiceInputScreen  from './screens/05_VoiceInput';
import CatalogEditScreen from './screens/06_CatalogEdit';
import PricingScreen     from './screens/07_Pricing';
import ReviewScreen      from './screens/08_Review';
import MyListingsScreen  from './screens/10_MyListings';
import ProfileScreen from './screens/ProfilePage';

export const WIZARD_STEPS = [3, 4, 5, 6, 7, 8];

const SCREENS = {
  1: OnboardingScreen,
  2: HomeScreen,
  3: CaptureScreen,
  4: ImageStudioScreen,
  5: VoiceInputScreen,
  6: CatalogEditScreen,
  7: PricingScreen,
  8: ReviewScreen,
  10: MyListingsScreen,
   11: ProfileScreen,
};

function AppShell() {
  const { currentStep } = useCraft();

  const isWelcome = currentStep === 1;
  const isWizard  = WIZARD_STEPS.includes(currentStep);
  const isTab     = !isWelcome && !isWizard;

  const Screen = SCREENS[currentStep] || HomeScreen;

  return (
    <div
      className="
        surface-paper text-charcoal
        relative flex w-full max-w-md flex-col overflow-hidden
        h-[100dvh]
        sm:h-[860px] sm:max-h-[92vh]
        sm:rounded-[2.75rem] sm:border-[10px] sm:border-stone-900 sm:shadow-2xl
      "
    >
      {!isWelcome && <Header isWizard={isWizard} />}

      <LoadingOverlay />

      {/* the ONLY scrolling region in the app */}
      <main
        key={currentStep}
        className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 animate-fade-in"
      >
        <Screen />
      </main>

      {isTab && <BottomNav />}

      {/* home indicator */}
      <div className="hidden shrink-0 justify-center pb-2 pt-1 sm:flex">
        <span className="h-1 w-28 rounded-full bg-stone-300" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <CraftProvider>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-200 via-amber-50 to-stone-300 font-sans antialiased sm:p-6">
        <AppShell />
      </div>
    </CraftProvider>
  );
}