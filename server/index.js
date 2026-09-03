import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ShilpSaathi AI Engine' });
});

// 2. AI Image Studio Endpoint (Screen 4)
app.post('/api/enhance-image', (req, res) => {
  const { image } = req.body;
  
  // Simulates background isolation & lighting correction
  setTimeout(() => {
    res.json({
      success: true,
      originalUrl: image,
      enhancedUrl: image || 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&auto=format&fit=crop'
    });
  }, 1000);
});

// 3. Multilingual Speech-to-Text & Catalog Generation (Screen 5 -> 6)
app.post('/api/process-voice', (req, res) => {
  setTimeout(() => {
    res.json({
      success: true,
      transcript: "यह एक हस्तनिर्मित मिट्टी का फूलदान है, जिसे पारंपरिक चाक पर बनाया गया है। इसमें प्राकृतिक रंगों का उपयोग हुआ है।",
      catalog: {
        name: "Handcrafted Terracotta Floral Vase",
        category: "Home Decor / Pottery",
        material: "Natural Terracotta Clay",
        colour: "Earthy Terracotta & Ochre",
        craft_type: "Wheel Thrown Pottery",
        description_hi: "पारंपरिक चाक पर शुद्ध मिट्टी से तैयार किया गया सुंदर फूलदान। 100% प्राकृतिक और टिकाऊ।",
        description_en: "Handcrafted earthen terracotta floral vase, shaped on a traditional wheel using sustainable, eco-friendly river clay.",
        keywords: ["pottery", "terracotta vase", "handmade home decor", "traditional craft"]
      }
    });
  }, 1200);
});

// 4. Hybrid Heuristic Pricing Engine (Screen 7)
app.post('/api/calculate-price', (req, res) => {
  const { rawMaterialCost = 250, hoursSpent = 6 } = req.body;
  
  // Heuristic rule: Raw materials + Skilled hourly wages + Complexity factor
  const baseCost = Number(rawMaterialCost) + (Number(hoursSpent) * 120);
  const minPrice = Math.round((baseCost * 1.15) / 10) * 10;
  const maxPrice = Math.round((baseCost * 1.35) / 10) * 10;
  const suggestedPrice = Math.round((minPrice + maxPrice) / 2);

  res.json({
    success: true,
    price_min: minPrice,
    price_max: maxPrice,
    suggested_price: suggestedPrice,
    reasoning: `Calculated from ₹${rawMaterialCost} material cost + ${hoursSpent} hrs skilled labor at standard artisanal benchmarks.`
  });
});

app.listen(5000, () => {
  console.log('ShilpSaathi API running at http://localhost:5000');
});