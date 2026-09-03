import React, { createContext, useContext, useState } from 'react';

const CraftContext = createContext();

export function CraftProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const [productData, setProductData] = useState({
    originalImage: null,
    enhancedImage: "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&auto=format&fit=crop",
    name: "Handcrafted Terracotta Earthen Vase",
    category: "Clay & Ceramic Crafts",
    material: "Traditional Riverbed Clay",
    colour: "Natural Ochre & Terracotta",
    description_hi: "हाथ से चाक पर तैयार की गई शुद्ध मिट्टी की सुराही। प्राकृतिक रूप से पकाई गई और पर्यावरण के अनुकूल।",
    description_en: "Handmade wheel-thrown terracotta vase crafted from local riverbed clay. Eco-friendly with natural earthen finish.",
    keywords: ["pottery", "terracotta", "handmade", "eco-friendly"],
    price_min: 750,
    price_max: 1100,
    final_price: 890,
    price_reasoning: "Material Cost (₹220) + 5 hrs hand-turning + category benchmark markup."
  });

  const updateProduct = (fields) => {
    setProductData(prev => ({ ...prev, ...fields }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => Math.max(1, prev - 1));
  const goToStep = (step) => setCurrentStep(step);

  return (
    <CraftContext.Provider value={{
      currentStep, nextStep, prevStep, goToStep,
      productData, updateProduct,
      isLoading, setIsLoading,
      loadingMessage, setLoadingMessage
    }}>
      {children}
    </CraftContext.Provider>
  );
}

export const useCraft = () => useContext(CraftContext);