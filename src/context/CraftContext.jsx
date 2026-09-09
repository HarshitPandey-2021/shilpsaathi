import { createContext, useContext, useEffect, useRef, useState } from 'react';

const CraftContext = createContext();

export const TRANSLATIONS = {
  hi: {
    code: "hi-IN",
    name: "हिंदी",
    tagline: "आपका शिल्प • आपकी कहानी • आपका बाज़ार",
    heroText: "कारीगर से व्यापारी तक का डिजिटल सफर",
    desc: "बिना लिखे या फोटो एडिट किए, केवल बोलकर अपनी पेशेवर डिजिटल लिस्टिंग बनाएं।",
    f1: "फोटो स्टूडियो", f1_sub: "स्वच्छ बैकग्राउंड",
    f2: "भाषिणी वॉइस", f2_sub: "बिना टाइपिंग",
    f3: "उचित मूल्य", f3_sub: "लागत अनुसार",
    startBtn: "शुरू करें / Launch Studio",
    listen: "सुनिए (Audio)",
    speaking: "बोल रहा है...",
    speechText: "शिल्पसाथी में आपका स्वागत है। अपने हस्तशिल्प की तस्वीर लें और बोलकर विवरण दर्ज करें।",
    studioTitle: "कलाकार डैशबोर्ड",
    activeListings: "सक्रिय उत्पाद",
    itemsCount: "3 वस्तुएं",
    benchmarkPrice: "बाज़ार औसत दर",
    assistantReady: "स्मार्ट सहायक तैयार है",
    assistantHint: "नया उत्पाद जोड़ना है? एक फोटो खींचें और हिंदी में बोलकर बताएं।",
    addBtn: "नया शिल्प जोड़ें",
    photoTitle: "शिल्प का फोटो लें",
    photoSub: "हमारा AI बैकग्राउंड को स्वतः साफ और प्रकाश ठीक करता है",
    photoBtn: "फोटो खींचें / गैलरी से चुनें",
    supportedCrafts: "मिट्टी, वस्त्र, काष्ठ, धातु एवं सभी हस्तशिल्प",
    studioCleaned: "स्टूडियो क्लीनिंग पूर्ण",
    continueVoice: "आवाज़ से विवरण दर्ज करें",
    voiceTitle: "अपने शिल्प की कहानी बताएं",
    voiceSub: "अपनी भाषा में बोलें। भाषिणी इसे कैटलॉग में बदलेगा।",
    tapSpeak: "बोलने के लिए दबाएं",
    voiceExample: "उदाहरण: यह एक हस्तनिर्मित मिट्टी का फूलदान है, जिसे पारंपरिक चाक पर बनाया गया है...",
    catalogTitle: "स्वतः तैयार कैटलॉग",
    catalogSub: "भाषिणी एवं AI द्वारा निकाला गया विवरण (सुधार सकते हैं)",
    calcPriceBtn: "उचित मूल्य गणना करें",
    priceTitle: "AI मूल्य सहायक",
    priceSub: "कारीगर लागत और समय के अनुसार पारदर्शी मूल्य",
    suggestedRange: "अनुशंसित मूल्य सीमा",
    setFinalPrice: "अपना विक्रय मूल्य तय करें (₹)",
    reviewBtn: "लिस्टिंग की जांच करें",
    verifyTitle: "लिस्टिंग की पुष्टि करें",
    verifySub: "साझा करने से पहले पूरी जानकारी जांचें",
    publishBtn: "डिजिटल लिस्टिंग प्रकाशित करें",
    publishedTitle: "लिस्टिंग तैयार है!",
    publishedSub: "आपका शिल्प अब डिजिटल बाज़ार में बिकने के लिए तैयार है",
    shareWhatsapp: "व्हाट्सएप पर शेयर करें",
    homeBtn: "होम पेज",
    navStudio: "डैशबोर्ड", navCatalog: "कैटलॉग", navAdd: "जोड़ें", navProfile: "भाषा",
    beyondTitle: "मेलों से आगे",
    beyondDesc: "अपने पारंपरिक शिल्प को साल भर बेचें। सूरजकुंड मेला, दिल्ली हाट और शिल्प समागम जैसे मौसमी मेलों की सीमाओं से आगे बढ़ें।",
  },
  en: {
    code: "en-IN",
    name: "English",
    tagline: "Your Craft • Your Story • Your Market",
    heroText: "From Rural Artisan to Global Market",
    desc: "Create professional e-commerce listings by simply speaking in your mother tongue.",
    f1: "AI Studio", f1_sub: "Auto Light",
    f2: "BHASHINI", f2_sub: "Voice Driven",
    f3: "Fair Price", f3_sub: "Heuristic",
    startBtn: "Launch Studio / शुरू करें",
    listen: "Listen (Audio)",
    speaking: "Speaking...",
    speechText: "Welcome to ShilpSaathi. Photograph your craft and speak out loud to create your market catalog.",
    studioTitle: "Artisan Studio",
    activeListings: "Active Crafts",
    itemsCount: "3 Items",
    benchmarkPrice: "Avg. Market Benchmark",
    assistantReady: "Smart Assistant Ready",
    assistantHint: "Ready to catalog? Take one photo and speak out its story naturally.",
    addBtn: "Add New Craft Item",
    photoTitle: "Photograph Craft",
    photoSub: "Our AI cleans cluttered backgrounds and normalizes lighting",
    photoBtn: "Capture / Select Photo",
    supportedCrafts: "Clay, Textiles, Woodwork, Metal & Handmade Crafts",
    studioCleaned: "Studio Cleaned",
    continueVoice: "Proceed to Voice Details",
    voiceTitle: "Speak Your Craft's Story",
    voiceSub: "Speak naturally. BHASHINI converts your speech into bilingual data.",
    tapSpeak: "Tap to Speak",
    voiceExample: "Example: Handcrafted earthen terracotta floral vase made on traditional potter's wheel...",
    catalogTitle: "AI Auto-Catalog",
    catalogSub: "Extracted from speech via BHASHINI (Tap to edit)",
    calcPriceBtn: "Calculate Fair Price",
    priceTitle: "AI Pricing Assistant",
    priceSub: "Fair pricing calculated from materials and skilled labor hours",
    suggestedRange: "Suggested Market Range",
    setFinalPrice: "Set Your Selling Price (₹)",
    reviewBtn: "Review Listing",
    verifyTitle: "Verify Your Listing",
    verifySub: "Full human control: verify details before sharing",
    publishBtn: "Publish Digital Listing",
    publishedTitle: "Listing Published!",
    publishedSub: "Your craft is now digital and ready to share",
    shareWhatsapp: "Share on WhatsApp",
    homeBtn: "Home",
    navStudio: "Studio", navCatalog: "Catalog", navAdd: "Add", navProfile: "Language",
    beyondTitle: "Beyond Physical Exhibitions",
    beyondDesc: "Sell your heritage crafts year-round. Overcome the seasonal limits of Surajkund Mela, Dilli Haat, and Shilp Samagam.",
  },
  bn: {
    code: "bn-IN",
    name: "বাংলা",
    tagline: "আপনার শিল্প • আপনার গল্প • আপনার বাজার",
    heroText: "গ্রামীণ কারিগর থেকে ডিজিটাল বাজার",
    desc: "টাইপ বা ফটো এডিটিং ছাড়াই আপনার ভাষায় কথা বলে অনলাইন তালিকা তৈরি করুন।",
    f1: "ফটো স্টুডিও", f1_sub: "স্বচ্ছ ছবি",
    f2: "ভাষিণী ভয়েস", f2_sub: "টাইপিং ছাড়া",
    f3: "ন্যায্য মূল্য", f3_sub: "সঠিক দাম",
    startBtn: "শুরু করুন / Launch Studio",
    listen: "শুনুন (Audio)",
    speaking: "বলছে...",
    speechText: "শিল্পসাথীতে আপনাকে স্বাগতম। আপনার পণ্যের ছবি তুলুন এবং কথা বলে বিবরণ দিন।",
    studioTitle: "কারিগর ড্যাশবোর্ড",
    activeListings: "সক্রিয় পণ্য",
    itemsCount: "৩টি পণ্য",
    benchmarkPrice: "গড় বাজার দর",
    assistantReady: "সহায়ক প্রস্তুত",
    assistantHint: "একটি ছবি তুলুন এবং নিজের ভাষায় কথা বলে বিবরণ দিন।",
    addBtn: "নতুন পণ্য যোগ করুন",
    photoTitle: "পণ্যের ছবি তুলুন",
    photoSub: "আমাদের AI ছবির ব্যাকগ্রাউন্ড পরিষ্কার ও আলো ঠিক করে",
    photoBtn: "ছবি তুলুন / সিলেক্ট করুন",
    supportedCrafts: "মাটি, তাঁত, কাঠ, ধাতু ও সব হস্তশিল্প",
    studioCleaned: "স্টুডিও পরিষ্কার",
    continueVoice: "ভয়েস বিবরণে যান",
    voiceTitle: "পণ্যের গল্প বলুন",
    voiceSub: "নিজের ভাষায় বলুন। ভাষিণী একে ক্যাটালগে রূপান্তর করবে।",
    tapSpeak: "বলতে স্পর্শ করুন",
    voiceExample: "উদাহরণ: এটি একটি হাতে তৈরি মাটির ফুলদানি যা চাকার সাহায্যে তৈরি...",
    catalogTitle: "স্বয়ংক্রিয় ক্যাটালগ",
    catalogSub: "ভাষিণী দ্বারা প্রস্তুতকৃত বিবরণ (সম্পাদনাযোগ্য)",
    calcPriceBtn: "ন্যায্য মূল্য নির্ধারণ করুন",
    priceTitle: "AI মূল্য সহায়ক",
    priceSub: "উপাদান খরচ ও শ্রম অনুযায়ী সঠিক দামের সুপারিশ",
    suggestedRange: "প্রস্তাবিত দামের সীমা",
    setFinalPrice: "আপনার বিক্রয় মূল্য দিন (₹)",
    reviewBtn: "তালিকা যাচাই করুন",
    verifyTitle: "তথ্য যাচাই করুন",
    verifySub: "প্রকাশের পূর্বে সমস্ত তথ্য দেখে নিন",
    publishBtn: "ডিজিটাল তালিকা প্রকাশ করুন",
    publishedTitle: "তালিকা প্রকাশিত!",
    publishedSub: "আপনার শিল্প এখন অনলাইনে বিক্রি করতে প্রস্তুত",
    shareWhatsapp: "হোয়াটসঅ্যাপে শেয়ার করুন",
    homeBtn: "হোম",
    navStudio: "স্টুডিও", navCatalog: "ক্যাটালগ", navAdd: "যোগ", navProfile: "ভাষা",
    beyondTitle: "মেলার বাইরে",
    beyondDesc: "সারা বছর নিজের হস্তশিল্প বিক্রি করুন। মেলা বা প্রদর্শনীর অপেক্ষায় বসে থাকতে হবে না।",
  },
  ta: {
    code: "ta-IN",
    name: "தமிழ்",
    tagline: "உங்கள் கைவினை • உங்கள் கதை • உங்கள் சந்தை",
    heroText: "கிராமப்புற கைவினைஞர் முதல் உலகளாவிய சந்தை வரை",
    desc: "எழுதுவதோ படம் திருத்துவதோ இன்றி, பேசுவதன் மூலமே உங்கள் தொழில்முறை தயாரிப்பு பட்டியலை உருவாக்குங்கள்.",
    f1: "புகைப்பட மையம்", f1_sub: "தெளிவான பின்னணி",
    f2: "பாஷிணி குரல்", f2_sub: "தட்டச்சு இல்லை",
    f3: "நியாயமான விலை", f3_sub: "உழைப்பிற்கேற்ற விலை",
    startBtn: "தொடங்கவும் / Launch Studio",
    listen: "கேட்கவும் (Audio)",
    speaking: "பேசுகிறது...",
    speechText: "சில்பசாதிக்கு நல்வரவு. உங்கள் கைவினைப்பொருளைப் படம் பிடித்துப் பேசி விவரங்களைப் பதிவு செய்யுங்கள்.",
    studioTitle: "கைவினைஞர் அரங்கம்",
    activeListings: "செயலில் உள்ள பொருட்கள்",
    itemsCount: "3 பொருட்கள்",
    benchmarkPrice: "சந்தை சராசரி விலை",
    assistantReady: "உதவியாளர் தயார்",
    assistantHint: "புகைப்படம் எடுத்து உங்கள் மொழியில் அதன் விபரங்களைச் சொல்லுங்கள்.",
    addBtn: "புதிய கைவினை சேர்",
    photoTitle: "பொருளைப் படம் பிடிக்கவும்",
    photoSub: "பின்னணியை தானாகவே AI நீக்கி வெளிச்சத்தை சீரமைக்கும்",
    photoBtn: "புகைப்படம் எடுக்கவும்",
    supportedCrafts: "மண்பாண்டம், நெசவு, மர வேலைப்பாடு மற்றும் அனைத்தும்",
    studioCleaned: "தூய்மையாக்கப்பட்டது",
    continueVoice: "குரல் பதிவுக்கு செல்லவும்",
    voiceTitle: "கைவினையின் கதையைச் சொல்லுங்கள்",
    voiceSub: "இயல்பாகப் பேசுங்கள். பாஷிணி அதைத் தகவலாக மாற்றும்.",
    tapSpeak: "பேச தொடவும்",
    voiceExample: "உதாரணம்: இது பாரம்பரிய முறையில் சக்கரத்தில் செய்யப்பட்ட களிமண் பூச்சாடி...",
    catalogTitle: "தானியங்கு பட்டியல்",
    catalogSub: "குரலிலிருந்து உருவாக்கப்பட்ட விவரங்கள் (திருத்தலாம்)",
    calcPriceBtn: "விலையைக் கணக்கிடுங்கள்",
    priceTitle: "AI விலை உதவியாளர்",
    priceSub: "மூலப்பொருள் மற்றும் உழைப்புக்கேற்ற நியாயமான விலை",
    suggestedRange: "பரிந்துரைக்கப்பட்ட விலை வரம்பு",
    setFinalPrice: "விற்பனை விலை நிர்ணயிக்கவும் (₹)",
    reviewBtn: "சரிபார்க்கவும்",
    verifyTitle: "விவரங்களைச் சரிபார்க்கவும்",
    verifySub: "வெளியிடுவதற்கு முன் உறுதிப்படுத்தவும்",
    publishBtn: "பட்டியலை வெளியிடவும்",
    publishedTitle: "வெளியிடப்பட்டது!",
    publishedSub: "உங்கள் கைவினைப்பொருள் சந்தைக்குத் தயார்",
    shareWhatsapp: "வாட்ஸ்அப்பில் பகிரவும்",
    homeBtn: "முகப்பு",
    navStudio: "மையம்", navCatalog: "பட்டியல்", navAdd: "சேர்", navProfile: "மொழி",
    beyondTitle: "கண்காட்சிகளுக்கு அப்பால்",
    beyondDesc: "உங்கள் பாரம்பரிய கைவினைப் பொருட்களை ஆண்டு முழுவதும் விற்கவும். சூரஜ்குண்ட் மேளா, தில்லி ஹாட் போன்ற பருவகால வரம்புகளைத் தாண்டவும்.",
  },
  te: {
    code: "te-IN",
    name: "తెలుగు",
    tagline: "మీ కళ • మీ కథ • మీ మార్కెట్",
    heroText: "చేతివృత్తుల కళాకారులకు డిజిటల్ వేదిక",
    desc: "టైప్ చేయకుండా లేదా ఫోటో ఎడిటింగ్ లేకుండా మీ గొంతుతోనే డిజిటల్ కేటలాగ్ రూపొందించండి.",
    f1: "ఫోటో స్టూడియో", f1_sub: "క్లీన్ బ్యాక్‌గ్రౌండ్",
    f2: "భాషిణి వాయిస్", f2_sub: "టైపింగ్ అవసరం లేదు",
    f3: "సరసమైన ధర", f3_sub: "సరైన రేటు",
    startBtn: "ప్రారంభించండి / Launch Studio",
    listen: "వినండి (Audio)",
    speaking: "మాట్లాడుతోంది...",
    speechText: "శిల్పసాథికి స్వాగతం. మీ వస్తువును ఫోటో తీసి మాట్లాడి వివరాలు చెప్పండి.",
    studioTitle: "కళాకారుల స్టూడియో",
    activeListings: "యాక్టివ్ వస్తువులు",
    itemsCount: "3 వస్తువులు",
    benchmarkPrice: "సగటు మార్కెట్ ధర",
    assistantReady: "అసిస్టెంట్ సిద్ధంగా ఉంది",
    assistantHint: "ఫోటో తీసి మీ స్వంత భాషలో వివరాలు మాట్లాడండి.",
    addBtn: "కొత్త వస్తువును జోడించండి",
    photoTitle: "వస్తువును ఫోటో తీయండి",
    photoSub: "మా AI బ్యాక్‌గ్రౌండ్‌ను క్లీన్ చేసి వెలుతురును సరిచేస్తుంది",
    photoBtn: "ఫోటో తీయండి / ఎంచుకోండి",
    supportedCrafts: "మట్టి, చేనేత, చెక్క, లోహ కళారూపాలు",
    studioCleaned: "స్టూడియో క్లీన్డ్",
    continueVoice: "వాయిస్ వివరాలకు వెళ్లండి",
    voiceTitle: "కళ యొక్క కథను చెప్పండి",
    voiceSub: "సహజంగా మాట్లాడండి. భాషిణి దీనిని డేటాగా మారుస్తుంది.",
    tapSpeak: "మాట్లాడటానికి నొక్కండి",
    voiceExample: "ఉదాహరణ: సాంప్రదాయ చక్రంపై తయారు చేయబడిన చేతితో చేసిన మట్టి కుండ...",
    catalogTitle: "ఆటో కేటలాగ్",
    catalogSub: "వాయిస్ ద్వారా సేకరించబడిన వివరాలు (సవరించవచ్చు)",
    calcPriceBtn: "సరసమైన ధరను లెక్కించండి",
    priceTitle: "AI ధర సహాయకుడు",
    priceSub: "ముడిసరుకు ఖర్చు మరియు సమయం ఆధారంగా సరైన ధర",
    suggestedRange: "సిఫార్సు చేయబడిన ధర శ్రేణి",
    setFinalPrice: "అమ్మకపు ధరను నిర్ణయించండి (₹)",
    reviewBtn: "వివరాలు సమీక్షించండి",
    verifyTitle: "వివరాలను నిర్ధారించండి",
    verifySub: "ప్రకటించే ముందు సమాచారాన్ని సరిచూసుకోండి",
    publishBtn: "డిజిటల్ జాబితాను ప్రచురించండి",
    publishedTitle: "ప్రచురించబడింది!",
    publishedSub: "మీ కళ ఇప్పుడు మార్కెట్లో అమ్మకానికి సిద్ధంగా ఉంది",
    shareWhatsapp: "వాట్సాప్‌లో షేర్ చేయండి",
    homeBtn: "హోమ్",
    navStudio: "స్టూడియో", navCatalog: "కేటలాగ్", navAdd: "జోడించు", navProfile: "భాష",
    beyondTitle: "ప్రదర్శనలకు మించి",
    beyondDesc: "మీ సాంప్రదాయ కళాఖండాలను ఏడాది పొడవునా అమ్మండి. సూరజ్‌కుండ్ మేళా, దిల్లీ హాట్ వంటి కాలానుగుణ పరిమితులను అధిగమించండి.",
  },
  mr: {
    code: "mr-IN",
    name: "मराठी",
    tagline: "तुमची कला • तुमची कथा • तुमची बाजारपेठ",
    heroText: "कारागीर ते डिजिटल उद्योजक",
    desc: "कोणतेही टायपिंग किंवा फोटो संपादन न करता, फक्त बोलून व्यावसायिक कॅटलॉग तयार करा.",
    f1: "फोटो स्टुडिओ", f1_sub: "स्वच्छ पार्श्वभूमी",
    f2: "भाषिणी व्हॉइस", f2_sub: "टायपिंग नाही",
    f3: "योग्य किंमत", f3_sub: "वाजवी दर",
    startBtn: "सुरू करा / Launch Studio",
    listen: "ऐका (Audio)",
    speaking: "बोलत आहे...",
    speechText: "शिल्पसाथीमध्ये आपले स्वागत आहे. आपल्या हस्तकलेचा फोटो घ्या आणि बोलून माहिती नोंदवा.",
    studioTitle: "कारागीर डॅशबोर्ड",
    activeListings: "सक्रिय उत्पादने",
    itemsCount: "३ वस्तू",
    benchmarkPrice: "सरासरी बाजार भाव",
    assistantReady: "स्मार्ट सहाय्यक सज्ज",
    assistantHint: "नवीन वस्तू जोडायची आहे? एक फोटो काढा आणि मराठीत बोलून माहिती सांगा.",
    addBtn: "नवीन हस्तकला जोडा",
    photoTitle: "हस्तकलेचा फोटो घ्या",
    photoSub: "आमचे AI अस्वच्छ पार्श्वभूमी काढून प्रकाश नियंत्रित करते",
    photoBtn: "फोटो काढा / निवडा",
    supportedCrafts: "माती, कापड, लाकूड, धातू आणि सर्व हस्तकला",
    studioCleaned: "स्टुडिओ क्लिनिंग पूर्ण",
    continueVoice: "आवाजाद्वारे माहिती द्या",
    voiceTitle: "हस्तकलेची गोष्ट सांगा",
    voiceSub: "आपल्या भाषेत बोला. भाषिणी याचे कॅटलॉगमध्ये रूपांतर करेल.",
    tapSpeak: "बोलण्यासाठी स्पर्श करा",
    voiceExample: "उदाहरण: हे चाकावर बनवलेले पारंपरिक मातीचे सुंदर फुलदाणी आहे...",
    catalogTitle: "स्वयंनिर्मित कॅटलॉग",
    catalogSub: "भाषिणीद्वारे काढलेली माहिती (बदल करू शकता)",
    calcPriceBtn: "वाजवी किंमत ठरवा",
    priceTitle: "AI किंमत सहाय्यक",
    priceSub: "साहित्याचा खर्च आणि मेहनतीनुसार योग्य दर",
    suggestedRange: "शिफारस केलेली किंमत मर्यादा",
    setFinalPrice: "विक्री किंमत निश्चित करा (₹)",
    reviewBtn: "तपासा",
    verifyTitle: "माहिती तपासा",
    verifySub: "शेअर करण्यापूर्वी सर्व माहितीची खात्री करा",
    publishBtn: "डिजिटल लिस्टिंग प्रकाशित करा",
    publishedTitle: "लिस्टिंग तयार आहे!",
    publishedSub: "आपली कला आता बाजारात विक्रीसाठी सज्ज आहे",
    shareWhatsapp: "व्हॉट्सॲपवर शेअर करा",
    homeBtn: "मुख्य पान",
    navStudio: "डॅशबोर्ड", navCatalog: "कॅटलॉग", navAdd: "जोडा", navProfile: "भाषा",
    beyondTitle: "मेळ्यांच्या पलीकडे",
    beyondDesc: "आपली पारंपरिक कला वर्षभर विका. सुरजकुंड मेळा, दिल्ली हाट यांसारख्या हंगामी मर्यादा ओलांडा.",
  },
};

/* ---- UI strings for shell/screens ---- */
const UI = {
  hi: {
    appSub: "आपका डिजिटल साथी", navHome: "घर", navShop: "मेरी दुकान", navNew: "नया",
    back: "पीछे", close: "बंद करें",
    wPhoto: "फोटो", wStudio: "AI स्टूडियो", wVoice: "आवाज़", wDetails: "विवरण", wPrice: "कीमत", wPublish: "प्रकाशित",
    greeting: "नमस्ते, कारीगर", greetingSub: "आज क्या बनाया आपने?",
    quickSteps: "3 आसान कदम · सिर्फ़ 2 मिनट",
    stepPhoto: "फोटो", stepVoice: "आवाज़", stepPrice: "कीमत",
    myListings: "मेरी लिस्टिंग", view: "देखें",
    alwaysOpen: "बाज़ार खुला", noWaiting: "मेले का इंतज़ार नहीं",
    chooseLang: "अपनी भाषा चुनें", chooseLangSub: "शुरू करने के लिए भाषा चुनें",
    noAccount: "कोई खाता नहीं · कोई पासवर्ड नहीं · सीधे शुरू करें",
    viewWelcome: "स्वागत स्क्रीन देखें", govInit: "भारत सरकार की पहल",
    retakePhoto: "दूसरी फोटो चुनें", continueBtn: "आगे बढ़ें",
    listeningNow: "सुन रहा है... अब बोलें", stopRec: "रोकें",
    transcribing: "आवाज़ पहचानी जा रही है...", yourVoice: "आपकी आवाज़",
    editHint: "सीधे एडिट करें", quickTests: "त्वरित उदाहरण", genCatalog: "कैटलॉग बनाएं",
    micError: "माइक्रोफ़ोन चालू नहीं हो सका। कृपया परमिशन जांचें या नीचे लिखें।",
    listTitle: "मेरी दुकान", listSub: "आपके सभी प्रकाशित उत्पाद",
    noListings: "अभी कोई लिस्टिंग नहीं", noListingsHint: "नया शिल्प जोड़कर शुरू करें",
    addFirst: "पहला शिल्प जोड़ें", loadError: "लिस्टिंग लोड नहीं हो सकी। दोबारा कोशिश करें।", live: "लाइव",
    publishing: "प्रकाशित हो रहा है...", saveFailed: "सेव नहीं हो सका",
    viewList: "मेरी दुकान देखें", publishedToast: "लिस्टिंग प्रकाशित हुई!", copied: "कॉपी हो गया!",
  },
  en: {
    appSub: "Your digital companion", navHome: "Home", navShop: "My Shop", navNew: "New",
    back: "Back", close: "Close",
    wPhoto: "Photo", wStudio: "AI Studio", wVoice: "Voice", wDetails: "Details", wPrice: "Price", wPublish: "Publish",
    greeting: "Namaste, Artisan", greetingSub: "What did you make today?",
    quickSteps: "3 easy steps · just 2 minutes",
    stepPhoto: "Photo", stepVoice: "Voice", stepPrice: "Price",
    myListings: "My Listings", view: "View",
    alwaysOpen: "Market open", noWaiting: "No waiting for melas",
    chooseLang: "Choose your language", chooseLangSub: "Select a language to begin",
    noAccount: "No account · No password · Start right away",
    viewWelcome: "View welcome screen", govInit: "Government of India Initiative",
    retakePhoto: "Choose another photo", continueBtn: "Continue",
    listeningNow: "Listening... speak now", stopRec: "Stop",
    transcribing: "Recognising your voice...", yourVoice: "Your voice",
    editHint: "Tap to edit", quickTests: "Quick examples", genCatalog: "Generate Catalog",
    micError: "Microphone could not start. Check permission or type below.",
    listTitle: "My Shop", listSub: "All your published products",
    noListings: "No listings yet", noListingsHint: "Add a new craft to get started",
    addFirst: "Add your first craft", loadError: "Could not load listings. Please retry.", live: "Live",
    publishing: "Publishing...", saveFailed: "Could not save",
    viewList: "View My Shop", publishedToast: "Listing published!", copied: "Copied!",
  },
  bn: {
    appSub: "আপনার ডিজিটাল সাথী", navHome: "হোম", navShop: "আমার দোকান", navNew: "নতুন",
    back: "পিছনে", close: "বন্ধ করুন",
    wPhoto: "ছবি", wStudio: "AI স্টুডিও", wVoice: "কণ্ঠ", wDetails: "বিবরণ", wPrice: "দাম", wPublish: "প্রকাশ",
    greeting: "নমস্কার, কারিগর", greetingSub: "আজ কী বানালেন?",
    quickSteps: "৩টি সহজ ধাপ · মাত্র ২ মিনিট",
    stepPhoto: "ছবি", stepVoice: "কণ্ঠ", stepPrice: "দাম",
    myListings: "আমার তালিকা", view: "দেখুন",
    alwaysOpen: "বাজার খোলা", noWaiting: "মেলার অপেক্ষা নেই",
    chooseLang: "আপনার ভাষা বাছুন", chooseLangSub: "শুরু করতে ভাষা নির্বাচন করুন",
    noAccount: "কোনো অ্যাকাউন্ট নেই · পাসওয়ার্ড নেই · সরাসরি শুরু করুন",
    viewWelcome: "স্বাগত স্ক্রিন দেখুন", govInit: "ভারত সরকারের উদ্যোগ",
    retakePhoto: "অন্য ছবি বাছুন", continueBtn: "এগিয়ে যান",
    listeningNow: "শুনছি... এখন বলুন", stopRec: "থামান",
    transcribing: "কণ্ঠ শনাক্ত করা হচ্ছে...", yourVoice: "আপনার কণ্ঠ",
    editHint: "সম্পাদনা করুন", quickTests: "দ্রুত উদাহরণ", genCatalog: "ক্যাটালগ তৈরি করুন",
    micError: "মাইক্রোফোন চালু হয়নি। অনুমতি দেখুন বা নিচে লিখুন।",
    listTitle: "আমার দোকান", listSub: "আপনার সব প্রকাশিত পণ্য",
    noListings: "এখনও কোনো তালিকা নেই", noListingsHint: "নতুন পণ্য যোগ করে শুরু করুন",
    addFirst: "প্রথম পণ্য যোগ করুন", loadError: "তালিকা লোড হয়নি। আবার চেষ্টা করুন।", live: "লাইভ",
    publishing: "প্রকাশ হচ্ছে...", saveFailed: "সেভ হয়নি",
    viewList: "আমার দোকান দেখুন", publishedToast: "তালিকা প্রকাশিত হয়েছে!", copied: "কপি হয়েছে!",
  },
  ta: {
    appSub: "உங்கள் டிஜிட்டல் துணை", navHome: "முகப்பு", navShop: "என் கடை", navNew: "புதிது",
    back: "பின்", close: "மூடு",
    wPhoto: "படம்", wStudio: "AI ஸ்டுடியோ", wVoice: "குரல்", wDetails: "விவரம்", wPrice: "விலை", wPublish: "வெளியிடு",
    greeting: "வணக்கம், கைவினைஞரே", greetingSub: "இன்று என்ன செய்தீர்கள்?",
    quickSteps: "3 எளிய படிகள் · 2 நிமிடம் மட்டும்",
    stepPhoto: "படம்", stepVoice: "குரல்", stepPrice: "விலை",
    myListings: "என் பட்டியல்", view: "பார்",
    alwaysOpen: "சந்தை திறந்துள்ளது", noWaiting: "கண்காட்சிக்குக் காத்திருக்க வேண்டாம்",
    chooseLang: "உங்கள் மொழியைத் தேர்வுசெய்க", chooseLangSub: "தொடங்க மொழியைத் தேர்வுசெய்க",
    noAccount: "கணக்கு இல்லை · கடவுச்சொல் இல்லை · உடனே தொடங்குங்கள்",
    viewWelcome: "வரவேற்புத் திரையைப் பார்", govInit: "இந்திய அரசின் முயற்சி",
    retakePhoto: "வேறு படம் தேர்வுசெய்க", continueBtn: "தொடரவும்",
    listeningNow: "கேட்கிறது... இப்போது பேசுங்கள்", stopRec: "நிறுத்து",
    transcribing: "குரல் அடையாளம் காணப்படுகிறது...", yourVoice: "உங்கள் குரல்",
    editHint: "திருத்தவும்", quickTests: "விரைவு எடுத்துக்காட்டுகள்", genCatalog: "பட்டியலை உருவாக்கு",
    micError: "மைக்ரோஃபோன் இயங்கவில்லை. அனுமதியைச் சரிபார்க்கவும் அல்லது கீழே தட்டச்சு செய்க.",
    listTitle: "என் கடை", listSub: "உங்கள் வெளியிடப்பட்ட பொருட்கள்",
    noListings: "இன்னும் பட்டியல் இல்லை", noListingsHint: "புதிய கைவினையைச் சேர்த்துத் தொடங்குங்கள்",
    addFirst: "முதல் கைவினையைச் சேர்", loadError: "பட்டியலை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.", live: "லைவ்",
    publishing: "வெளியிடப்படுகிறது...", saveFailed: "சேமிக்க முடியவில்லை",
    viewList: "என் கடையைப் பார்", publishedToast: "பட்டியல் வெளியிடப்பட்டது!", copied: "நகலெடுக்கப்பட்டது!",
  },
  te: {
    appSub: "మీ డిజిటల్ తోడు", navHome: "హోమ్", navShop: "నా దుకాణం", navNew: "కొత్తది",
    back: "వెనుకకు", close: "మూసివేయి",
    wPhoto: "ఫోటో", wStudio: "AI స్టూడియో", wVoice: "వాయిస్", wDetails: "వివరాలు", wPrice: "ధర", wPublish: "ప్రచురణ",
    greeting: "నమస్తే, కళాకారుడా", greetingSub: "ఈరోజు ఏం తయారు చేశారు?",
    quickSteps: "3 సులభ దశలు · కేవలం 2 నిమిషాలు",
    stepPhoto: "ఫోటో", stepVoice: "వాయిస్", stepPrice: "ధర",
    myListings: "నా జాబితా", view: "చూడండి",
    alwaysOpen: "మార్కెట్ తెరిచి ఉంది", noWaiting: "మేళా కోసం వేచి ఉండనవసరం లేదు",
    chooseLang: "మీ భాషను ఎంచుకోండి", chooseLangSub: "ప్రారంభించడానికి భాషను ఎంచుకోండి",
    noAccount: "ఖాతా లేదు · పాస్‌వర్డ్ లేదు · వెంటనే ప్రారంభించండి",
    viewWelcome: "స్వాగత స్క్రీన్ చూడండి", govInit: "భారత ప్రభుత్వ చొరవ",
    retakePhoto: "వేరే ఫోటో ఎంచుకోండి", continueBtn: "కొనసాగించు",
    listeningNow: "వింటోంది... ఇప్పుడు మాట్లాడండి", stopRec: "ఆపు",
    transcribing: "వాయిస్ గుర్తించబడుతోంది...", yourVoice: "మీ వాయిస్",
    editHint: "సవరించండి", quickTests: "త్వరిత ఉదాహరణలు", genCatalog: "కేటలాగ్ తయారు చేయి",
    micError: "మైక్రోఫోన్ ప్రారంభం కాలేదు. అనుమతిని తనిఖీ చేయండి లేదా క్రింద టైప్ చేయండి.",
    listTitle: "నా దుకాణం", listSub: "మీ ప్రచురించిన అన్ని ఉత్పత్తులు",
    noListings: "ఇంకా జాబితా లేదు", noListingsHint: "కొత్త వస్తువును జోడించి ప్రారంభించండి",
    addFirst: "మొదటి వస్తువును జోడించండి", loadError: "జాబితా లోడ్ కాలేదు. మళ్లీ ప్రయత్నించండి.", live: "లైవ్",
    publishing: "ప్రచురిస్తోంది...", saveFailed: "సేవ్ కాలేదు",
    viewList: "నా దుకాణం చూడండి", publishedToast: "జాబితా ప్రచురించబడింది!", copied: "కాపీ అయ్యింది!",
  },
  mr: {
    appSub: "तुमचा डिजिटल साथी", navHome: "घर", navShop: "माझे दुकान", navNew: "नवीन",
    back: "मागे", close: "बंद करा",
    wPhoto: "फोटो", wStudio: "AI स्टुडिओ", wVoice: "आवाज", wDetails: "तपशील", wPrice: "किंमत", wPublish: "प्रकाशित",
    greeting: "नमस्कार, कारागीर", greetingSub: "आज काय बनवले?",
    quickSteps: "३ सोपे टप्पे · फक्त २ मिनिटे",
    stepPhoto: "फोटो", stepVoice: "आवाज", stepPrice: "किंमत",
    myListings: "माझी यादी", view: "पहा",
    alwaysOpen: "बाजार खुला", noWaiting: "मेळ्याची वाट नाही",
    chooseLang: "तुमची भाषा निवडा", chooseLangSub: "सुरू करण्यासाठी भाषा निवडा",
    noAccount: "खाते नाही · पासवर्ड नाही · थेट सुरू करा",
    viewWelcome: "स्वागत स्क्रीन पहा", govInit: "भारत सरकारचा उपक्रम",
    retakePhoto: "दुसरा फोटो निवडा", continueBtn: "पुढे जा",
    listeningNow: "ऐकत आहे... आता बोला", stopRec: "थांबा",
    transcribing: "आवाज ओळखला जात आहे...", yourVoice: "तुमचा आवाज",
    editHint: "संपादित करा", quickTests: "जलद उदाहरणे", genCatalog: "कॅटलॉग तयार करा",
    micError: "मायक्रोफोन सुरू झाला नाही. परवानगी तपासा किंवा खाली लिहा.",
    listTitle: "माझे दुकान", listSub: "तुमची सर्व प्रकाशित उत्पादने",
    noListings: "अद्याप यादी नाही", noListingsHint: "नवीन हस्तकला जोडून सुरुवात करा",
    addFirst: "पहिली हस्तकला जोडा", loadError: "यादी लोड झाली नाही. पुन्हा प्रयत्न करा.", live: "लाइव्ह",
    publishing: "प्रकाशित होत आहे...", saveFailed: "सेव्ह झाले नाही",
    viewList: "माझे दुकान पहा", publishedToast: "यादी प्रकाशित झाली!", copied: "कॉपी झाले!",
  },
};

const UI2 = {
  hi: {
    before:"पहले", after:"बाद में", aiWorking:"AI आपकी फोटो सुधार रहा है", enhanceFail:"AI सुधार नहीं हो सका", enhanceFailSub:"आपकी असली फोटो इस्तेमाल होगी", continueAnyway:"इसी फोटो से आगे बढ़ें", retry:"दोबारा कोशिश करें", dragCompare:"तुलना करने के लिए खिसकाएं",
    fTitle:"उत्पाद का नाम", fCategory:"श्रेणी", fMaterial:"सामग्री", fColour:"रंग", fDescNative:"विवरण (आपकी भाषा)", fDescEn:"English Description", fKeywords:"खोज शब्द",
    yourPrice:"आपकी कीमत", belowRange:"सुझाई गई कीमत से कम", inRange:"अच्छी कीमत है", aboveRange:"सुझाई गई कीमत से ज़्यादा", costBreakdown:"लागत विवरण", savePhoneTitle:"अपनी दुकान सुरक्षित करें", savePhoneSub:"नंबर डालें ताकि आपकी लिस्टिंग कभी न खोए", savePhoneBtn:"सेव करें", skipForNow:"अभी नहीं", aiHeard:"AI ने यह सुना", matCost:"सामग्री लागत", hoursWorked:"कितने घंटे लगे", labourCost:"मेहनत", overhead:"अन्य खर्च (12%)", margin:"आपका मुनाफ़ा (25%)", totalCost:"लागत आधारित मूल्य", perHour:"प्रति घंटा",
    askInputs:"जांचें — गलत हो तो बदलें", publishToast:"आपकी दुकान में प्रकाशित!", phoneLinked:"दुकान आपके नंबर से जुड़ गई", phoneFail:"नहीं जुड़ सका, दोबारा करें", restoreShop:"मेरी दुकान वापस पाएं", sayMore:"थोड़ा और बताएं — क्या है, किस चीज़ का, क्या रंग, कितने घंटे लगे?", needName:"पहले उत्पाद का नाम भरें", untitled:"हस्तनिर्मित शिल्प", catalogValue:"कुल कीमत",
    heuristicPriceTitle:"लागत अनुसार मूल्य", heuristicPriceSub:"सामग्री, समय व 25% लाभ", aiAdvisorTitle:"AI बाज़ार व लाभ सलाहकार", aiAdvisorSub:"मांग व स्थिति अनुसार सुझाव", pickPriceHint:"इनमें से एक चुनें या नीचे अपनी कीमत तय करें", aiAdvisorBadge:"AI अनुशंसित", heuristicBadge:"पारदर्शी लागत", customBadge:"कस्टम", aiUnavailableNotice:"AI बाज़ार सलाहकार अस्थायी रूप से अनुपलब्ध है।", autoFilledNote:"आवाज़ से स्वतः भरा गया — कृपया जांच लें", aiVerifiedNote:"AI द्वारा पेशेवर विवरण तैयार किया गया",takePhoto:"फोटो खींचें", fromGallery:"गैलरी से चुनें"
  },
  en: {
    before:"Before", after:"After", catalogValue:"Catalog value",takePhoto:"Take photo", fromGallery:"From gallery", aiWorking:"AI is improving your photo", enhanceFail:"AI enhancement unavailable", enhanceFailSub:"Your original photo will be used", continueAnyway:"Continue with this photo", retry:"Try again", dragCompare:"Drag to compare", sayMore:"Tell me more — what is it, what material, what colour, how many hours?", savePhoneTitle:"Save your shop", savePhoneSub:"Add your number so your listings are never lost", savePhoneBtn:"Save", skipForNow:"Skip for now", aiHeard:"AI heard this", matCost:"Material cost", hoursWorked:"Hours worked", labourCost:"Labour", overhead:"Overhead (12%)", margin:"Your profit (25%)", totalCost:"Cost-based price", perHour:"per hour",
    askInputs:"Check these — change if wrong", publishToast:"Published to your shop!", phoneLinked:"Shop linked to your number", phoneFail:"Could not link, try again", restoreShop:"Restore my shop", needName:"Please add a product name first", untitled:"Handmade Craft",
    fTitle:"Product name", fCategory:"Category", fMaterial:"Material", fColour:"Colour", fDescNative:"Description (your language)", fDescEn:"English Description", fKeywords:"Search keywords",
    yourPrice:"Your price", belowRange:"Below suggested range", inRange:"Good price", aboveRange:"Above suggested range", costBreakdown:"Cost breakdown",
    heuristicPriceTitle:"Heuristic Fair Price", heuristicPriceSub:"Materials, labor & 25% margin", aiAdvisorTitle:"AI Market & Profit Advisor", aiAdvisorSub:"Demand & positioning recommendation", pickPriceHint:"Pick a pricing strategy or set your own below", aiAdvisorBadge:"AI Recommended", heuristicBadge:"Transparent Cost", customBadge:"Custom", aiUnavailableNotice:"AI pricing advisor is temporarily offline.", autoFilledNote:"Auto-filled from voice — please review", aiVerifiedNote:"AI-generated marketing listing",
  },
  bn: {
    before:"আগে", after:"পরে", aiWorking:"AI আপনার ছবি উন্নত করছে", enhanceFail:"AI উন্নতি সম্ভব হয়নি", enhanceFailSub:"আপনার আসল ছবি ব্যবহার হবে", continueAnyway:"এই ছবি নিয়েই এগোন", retry:"আবার চেষ্টা করুন", dragCompare:"তুলনা করতে টানুন",
    fTitle:"পণ্যের নাম", fCategory:"বিভাগ", fMaterial:"উপাদান", fColour:"রং", fDescNative:"বিবরণ (আপনার ভাষায়)", fDescEn:"English Description", fKeywords:"সার্চ শব্দ",
    yourPrice:"আপনার দাম", belowRange:"প্রস্তাবিত দামের কম", inRange:"ভালো দাম", aboveRange:"প্রস্তাবিত দামের বেশি", costBreakdown:"দাম কীভাবে হলো",
    heuristicPriceTitle:"ন্যায্য মূল্য", heuristicPriceSub:"উপাদান ও শ্রমের হিসাব", aiAdvisorTitle:"AI বাজার ও লাভ উপদেষ্টা", aiAdvisorSub:"চাহিদা ও মানের বিশ্লেষণ", pickPriceHint:"একটি দাম বাছুন বা নিজে লিখুন", aiAdvisorBadge:"AI প্রস্তাবিত", heuristicBadge:"স্বচ্ছ হিসাব", customBadge:"কাস্টম", aiUnavailableNotice:"AI উপদেষ্টা সাময়িক বন্ধ রয়েছে।", autoFilledNote:"ভয়েস থেকে তৈরি — যাচাই করুন", aiVerifiedNote:"AI দ্বারা পেশাদার ক্যাটালগ তৈরি",
  },
  ta: {
    before:"முன்", after:"பின்", aiWorking:"AI உங்கள் படத்தை மேம்படுத்துகிறது", enhanceFail:"AI மேம்பாடு கிடைக்கவில்லை", enhanceFailSub:"உங்கள் அசல் படம் பயன்படும்", continueAnyway:"இதே படத்துடன் தொடரவும்", retry:"மீண்டும் முயற்சி", dragCompare:"ஒப்பிட இழுக்கவும்",
    fTitle:"பொருளின் பெயர்", fCategory:"வகை", fMaterial:"பொருள்", fColour:"நிறம்", fDescNative:"விவரம் (உங்கள் மொழி)", fDescEn:"English Description", fKeywords:"தேடல் சொற்கள்",
    yourPrice:"உங்கள் விலை", belowRange:"பரிந்துரைக்கப்பட்ட விலைக்குக் குறைவு", inRange:"நல்ல விலை", aboveRange:"பரிந்துரைக்கப்பட்ட விலைக்கு அதிகம்", costBreakdown:"விலை எப்படி வந்தது",
    heuristicPriceTitle:"நியாயமான விலை", heuristicPriceSub:"பொருட்கள் மற்றும் உழைப்பு", aiAdvisorTitle:"AI சந்தை வழிகாட்டி", aiAdvisorSub:"சந்தை நிலை பரிந்துரை", pickPriceHint:"ஒரு விலையைத் தேர்வுசெய்யவும்", aiAdvisorBadge:"AI பரிந்துரை", heuristicBadge:"செலவு அடிப்படை", customBadge:"தனிப்பயன்", aiUnavailableNotice:"AI வழிகாட்டி தற்காலிகமாக இல்லை.", autoFilledNote:"குரல் மூலம் நிரப்பப்பட்டது", aiVerifiedNote:"AI உருவாக்கிய தொழில்முறை பட்டியல்",
  },
  te: {
    before:"ముందు", after:"తర్వాత", aiWorking:"AI మీ ఫోటోను మెరుగుపరుస్తోంది", enhanceFail:"AI మెరుగుదల అందుబాటులో లేదు", enhanceFailSub:"మీ అసలు ఫోటో ఉపయోగించబడుతుంది", continueAnyway:"ఈ ఫోటోతోనే కొనసాగండి", retry:"మళ్లీ ప్రయత్నించండి", dragCompare:"పోల్చడానికి లాగండి",
    fTitle:"ఉత్పత్తి పేరు", fCategory:"వర్గం", fMaterial:"పదార్థం", fColour:"రంగు", fDescNative:"వివరణ (మీ భాషలో)", fDescEn:"English Description", fKeywords:"శోధన పదాలు",
    yourPrice:"మీ ధర", belowRange:"సూచించిన ధర కంటే తక్కువ", inRange:"మంచి ధర", aboveRange:"సూచించిన ధర కంటే ఎక్కువ", costBreakdown:"ధర ఎలా వచ్చింది",
    heuristicPriceTitle:"సహేతుక ధర", heuristicPriceSub:"ఖర్చు & శ్రమ ఆధారితం", aiAdvisorTitle:"AI మార్కెట్ సలహాదారు", aiAdvisorSub:"డిమాండ్ & లాభ విశ్లేషణ", pickPriceHint:"ఒక ధరను ఎంచుకోండి", aiAdvisorBadge:"AI సూచన", heuristicBadge:"పారదర్శక వ్యయం", customBadge:"అనుకూల", aiUnavailableNotice:"AI సలహాదారు ప్రస్తుతం అందుబాటులో లేదు.", autoFilledNote:"వాయిస్ నుండి ఆటో-ఫిల్ చేయబడింది", aiVerifiedNote:"AI సృష్టించిన కేటలాగ్",
  },
  mr: {
    before:"आधी", after:"नंतर", aiWorking:"AI तुमचा फोटो सुधारत आहे", enhanceFail:"AI सुधारणा उपलब्ध नाही", enhanceFailSub:"तुमचा मूळ फोटो वापरला जाईल", continueAnyway:"याच फोटोसह पुढे जा", retry:"पुन्हा प्रयत्न करा", dragCompare:"तुलना करण्यासाठी सरकवा",
    fTitle:"उत्पादनाचे नाव", fCategory:"श्रेणी", fMaterial:"साहित्य", fColour:"रंग", fDescNative:"वर्णन (तुमच्या भाषेत)", fDescEn:"English Description", fKeywords:"शोध शब्द",
    yourPrice:"तुमची किंमत", belowRange:"सुचवलेल्या किमतीपेक्षा कमी", inRange:"चांगली किंमत", aboveRange:"सुचवलेल्या किमतीपेक्षा जास्त", costBreakdown:"किंमत कशी ठरली",
    heuristicPriceTitle:"लागतीनुसार किंमत", heuristicPriceSub:"साहित्य व वेळ हिशोब", aiAdvisorTitle:"AI बाजार व नफा सल्लागार", aiAdvisorSub:"मागणीनुसार किंमत", pickPriceHint:"किंमत निवडा किंवा खाली ठरवा", aiAdvisorBadge:"AI शिफारस", heuristicBadge:"पारदर्शक हिशोब", customBadge:"सानुकूल", aiUnavailableNotice:"AI सल्लागार तात्पुरता अनुपलब्ध आहे.", autoFilledNote:"आवाजावरून भरले गेले — तपासा", aiVerifiedNote:"AI द्वारे तयार व्यावसायिक कॅटलॉग",
  },
};

Object.keys(TRANSLATIONS).forEach((k) => {
  Object.assign(TRANSLATIONS[k], UI[k] || UI.en, UI2[k] || UI2.en);
});

export function CraftProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [lang, setLang] = useState('hi');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showLangModal, setShowLangModal] = useState(false);
  const [processingStages, setProcessingStages] = useState([]);
  const [currentStage, setCurrentStage] = useState('');
  const originalPreviewUrlRef = useRef(null);
  const BLANK_PRODUCT = {
    originalImage: null,
    enhancedImage: null,
    enhancedImageB64: null,
    isEnhanced: false,
    image_url: null,
    original_image_url: null,
    name: "",
    category: "",
    material: "",
    colour: "",
    craft_type: "",
    description_hi: "",
    description_en: "",
    keywords: [],
    spoken_transcript: "",
    hours_spent: null,
    raw_material_cost: null,
    extracted_facts: null,
    price_min: 0,
    price_max: 0,
    final_price: 0,
    price_reasoning: "",
    pricing_method: "heuristic", // 'heuristic' | 'ai' | 'custom'
    ai_pricing: null,
    heuristic_pricing: null,
    is_ai_generated: false,
    llm_provider: "none",
    savedProductId: null,
  };

  const [productData, setProductData] = useState({ ...BLANK_PRODUCT });

  const t = TRANSLATIONS[lang] || TRANSLATIONS.hi;
  const RAW_API = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
  const API = RAW_API.endsWith('/api') ? RAW_API : `${RAW_API}/api`;
  const [artisanId, setArtisanId] = useState(localStorage.getItem('shilpsaathi_artisan_uuid') || null);
  const [confirmedPhone, setConfirmedPhone] = useState(localStorage.getItem('shilpsaathi_artisan_phone') || null);

  const getDeviceHandle = () => {
    let h = localStorage.getItem('shilpsaathi_device_id');
    if (!h) {
      h = 'g-' + Math.random().toString(16).slice(2, 10);
      localStorage.setItem('shilpsaathi_device_id', h);
    }
    return h;
  };

  const resolveArtisan = async (phone) => {
    const handle = phone || localStorage.getItem('shilpsaathi_artisan_phone');
    if (!handle) return null;
    try {
      const res = await fetch(`${API}/artisans/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, preferred_language: lang }),
      });
      const json = await res.json();
      if (json?.data?.id) {
        localStorage.setItem('shilpsaathi_artisan_uuid', json.data.id);
        if (phone) {
          localStorage.setItem('shilpsaathi_artisan_phone', phone);
          setConfirmedPhone(phone);
        }
        setArtisanId(json.data.id);
        return json.data.id;
      }
    } catch (e) { console.warn('[Artisan] resolve failed:', e.message); }
    return null;
  };

  const linkPhone = async (phone) => {
    const id = artisanId || (await resolveArtisan());
    if (!id) return false;
    try {
      const res = await fetch(`${API}/artisans/link-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artisan_id: id, phone }),
      });
      const json = await res.json();
      if (json?.data?.id) {
        localStorage.setItem('shilpsaathi_artisan_phone', phone);
        localStorage.setItem('shilpsaathi_artisan_uuid', json.data.id);
        setConfirmedPhone(phone);
        setArtisanId(json.data.id);
        return true;
      }
    } catch (e) { console.warn('[Artisan] link failed:', e.message); }
    return false;
  };

  useEffect(() => { if (!artisanId) resolveArtisan(); }, []);

  const getArtisanId = () => artisanId;
  const updateProduct = (fields) => setProductData(prev => ({ ...prev, ...fields }));
  const setOriginalPreview = (file) => {
    if (originalPreviewUrlRef.current) {
      URL.revokeObjectURL(originalPreviewUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    originalPreviewUrlRef.current = url;
    updateProduct({ originalImage: url, enhancedImage: null, original_image_url: null });
    return url;
  };
  const clearOriginalPreview = () => {
    if (originalPreviewUrlRef.current) {
      URL.revokeObjectURL(originalPreviewUrlRef.current);
      originalPreviewUrlRef.current = null;
    }
  };
  useEffect(() => clearOriginalPreview, []);
  const startNewProduct = () => {
    clearOriginalPreview();
    setProductData({ ...BLANK_PRODUCT });
    setCurrentStep(3);
  };
  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => Math.max(1, prev - 1));
  const goToStep = (step) => setCurrentStep(step);

  return (
    <CraftContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        nextStep,
        prevStep,
        goToStep,
        lang,
        setLang,
        t,
        productData,
        updateProduct,
        startNewProduct,
        setOriginalPreview,
        clearOriginalPreview,
        isLoading,
        setIsLoading,
        loadingMessage,
        setLoadingMessage,
        showLangModal,
        setShowLangModal,
        processingStages,
        setProcessingStages,
        currentStage,
        setCurrentStage,
        artisanId,
        getArtisanId,
        resolveArtisan,
        linkPhone,
        confirmedPhone,
      }}
    >
      {children}
    </CraftContext.Provider>
  );
}

export function useCraft() {
  const context = useContext(CraftContext);
  if (!context) {
    throw new Error('useCraft must be used within a CraftProvider');
  }
  return context;
}
