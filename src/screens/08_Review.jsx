import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import ScreenHeader from '../components/ui/ScreenHeader';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';

export default function ReviewScreen() {
  const { productData, nextStep, t } = useCraft();

  return (
    <div className="space-y-4 animate-fade-in-up">
      <ScreenHeader title={t.verifyTitle} subtitle={t.verifySub} step={6} totalSteps={7} />

      <Card className="space-y-3 text-xs">
        <img src={productData.enhancedImage || productData.originalImage} alt="Review" className="w-full h-36 object-cover rounded-xl" />
        <div>
          <span className="text-[10px] font-bold text-mustard uppercase">{productData.category}</span>
          <h3 className="font-bold text-sm text-charcoal">{productData.name}</h3>
        </div>
        <p className="text-stone-600">{productData.description_en}</p>
        <div className="flex justify-between items-center pt-2 border-t text-xs">
          <span className="text-stone-500 font-bold">Publish Price:</span>
          <span className="text-xl font-black text-terracotta">₹{productData.final_price}</span>
        </div>
      </Card>

      <PrimaryButton onClick={nextStep} variant="success" icon={CheckCircle2}>{t.publishBtn}</PrimaryButton>
    </div>
  );
}