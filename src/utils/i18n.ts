import { IncidentCategory, IncidentStatus, LanguageCode, SeverityLevel } from '../types';

export const TRANSLATIONS = {
  en: {
    // Brand & Header
    appTitle: 'CIVICPULSE',
    appSubtitle: 'AI-Powered Urban & Environmental Incident Intelligence Platform',
    reportsConsolidated: 'Reports Consolidated',
    noiseFiltered: 'Noise Filtered',
    loadDemoData: 'Load Demo Data',
    loadingDemo: 'Loading Demo...',
    demoGuide: 'Demo Guide',
    analytics: 'Analytics',
    reportIncident: 'Report Incident',
    citizenRole: 'Citizen Portal',
    adminRole: 'Authority Command',
    authorityRole: 'Authority',
    emergingAlert: 'Emerging Threat Alert',
    emergingBadge: 'Emerging',
    emergingBannerTitle: 'EMERGING INCIDENT DETECTED',
    inspectIncident: 'Inspect Incident Cluster',
    incidentsTitle: 'Consolidated Incident Feed',
    analyticsTitle: 'City Incident Analytics & Intelligence Metrics',
    analyticsSubtitle: 'Consolidation performance, incident lifecycle, and urban environmental trends.',
    citizenWorkspace: 'Citizen Portal',
    authorityWorkspace: 'Authority Command',
    citizenPortalSubtitle: 'Public safety network & incident reporting',
    adminConsoleSubtitle: 'City municipal management & triage engine',
    citizenTabViewIncidents: 'View Incidents',
    citizenTabSubmitReport: 'Submit Report',
    citizenTabNearbyAlerts: 'See Nearby Alerts',
    citizenTabTrackReports: 'Track Own Reports',
    adminTabManageIncidents: 'Manage Incidents',
    adminTabInspectReports: 'Inspect Reports',
    adminTabMergeDuplicates: 'Merge Duplicates',
    adminTabVerifyResolve: 'Verify & Resolve',
    adminTabCreateAlerts: 'Create Alerts',
    adminTabAnalytics: 'View Analytics',
    reportIncidentModalTitle: 'Report City / Environmental Incident',
    activeIncidents: 'Active Incidents',

    // Citizen Tabs
    tabViewIncidents: 'View Incidents',
    tabSubmitReport: 'Submit Report',
    tabNearbyAlerts: 'Nearby Alerts',
    tabTrackReports: 'Track My Reports',

    // Admin Tabs
    tabManageIncidents: 'Manage Incidents',
    tabInspectReports: 'Inspect Reports',
    tabMergeDuplicates: 'Merge Duplicates',
    tabVerifyResolve: 'Verify & Resolve',
    tabCreateAlerts: 'Create Public Alert',
    tabViewAnalytics: 'View Analytics',

    // Common / UI
    searchPlaceholder: 'Search incidents by title, street, or keyword...',
    allCategories: 'All Categories',
    allSeverities: 'All Severities',
    allStatuses: 'All Statuses',
    onlyEmerging: 'Only Emerging Surges',
    cityGridMap: 'City Grid Map',
    incidentClusters: 'Incident Clusters',
    impactRadius: 'Impact Radius',
    locateMe: 'Locate My Area',
    refreshData: 'Refresh Data',
    close: 'Close',
    save: 'Save Changes',
    cancel: 'Cancel',
    status: 'Status',
    severity: 'Severity',
    priorityScore: 'Priority Score',
    reportsCount: 'Reports',
    confidence: 'AI Confidence',
    lastUpdated: 'Updated',
    location: 'Location',
    viewDetails: 'View Details & Causal Graph',

    // Voice Assistant
    voiceAssistant: 'Voice Assistant',
    voiceSpeakPrompt: 'Speak Your Incident',
    voiceListening: 'Listening... Please speak your incident clearly in your language',
    voiceStopListening: 'Stop Recording',
    voiceNotSupported: 'Speech recognition is not supported in this browser. Please type below.',
    voiceQuickPresets: 'Or click a sample voice query:',
    voiceTranscribed: 'Voice transcribed successfully!',
    voiceGuidance: 'Listen Voice Instructions',

    // Form Fields
    descriptionLabel: 'Incident Description (Describe What You See)',
    descriptionPlaceholder: 'Describe what you see (e.g. deep waterlogging near station, heavy smoke from open lot, broken manhole)...',
    photoUploadLabel: 'Evidence Photo (Optional, analyzed by Gemini AI Vision)',
    photoUploadPrompt: 'Click to upload photo or drag & drop',
    locationLabel: 'Location / Landmark',
    locationPlaceholder: 'e.g. Eastern Express Highway, Kurla Junction',
    speakLocationPrompt: 'Speak Location',
    speakingLocation: 'Listening for location...',
    categoryLabel: 'Category (Optional - AI automatically categorizes)',
    autoCategoryOption: 'Let AI Automatically Determine Category',
    observerNameLabel: 'Your Name (Optional)',
    observerNamePlaceholder: 'e.g. Priya Sharma or Anonymous',
    aiAnalyzeBtn: 'Test AI Analysis Preview',
    submittingReport: 'Analyzing & Submitting...',
    submitReportBtn: 'Submit Incident Report',

    // Report Tracking
    trackTitle: 'Track Your Submitted Citizen Reports',
    trackSubtitle: 'Live AI clustering status, dispatch updates, and municipal response tracking for your submissions.',
    noTrackedReports: 'No reports submitted from this session yet. Submit an incident above to track its real-time progress!',
    stageSubmitted: 'Submitted',
    stageAnalyzed: 'AI Analyzed',
    stageClustered: 'Clustered',
    stageAction: 'Action Taken',
    stageResolved: 'Resolved',

    // Public Alerts (Citizen)
    alertsTitle: 'Active Public Safety Advisories & Warnings',
    alertsSubtitle: 'Official verified warnings issued by municipal authorities to guide citizen safety and detours.',
    noAlerts: 'No critical public warnings in effect right now. City grid is running normally.',
    detourAdvice: 'Recommended Detour / Advisory',
    emergencyHelpline: 'City Emergency Helpline',

    // Admin Specific
    inspectTitle: 'Raw Citizen Report Triage Stream',
    inspectSubtitle: 'Unfiltered incoming citizen submissions. Review AI confidence, evidence photos, and clustering links.',
    mergeTitle: 'Incident Duplicate & Cluster Merge Engine',
    mergeSubtitle: 'Detect nearby spatial-temporal duplicate reports and consolidate them into master clusters to eliminate noise.',
    verifyTitle: 'Verification & Incident Resolution Center',
    verifySubtitle: 'Field dispatch verification, operational status workflows, and resolution audit trail.',
    createAlertTitle: 'Broadcast Official Public Advisory',
    createAlertSubtitle: 'Generate and broadcast verified public warnings directly to the Citizen Portal with detour guidance.',
    broadcastBtn: 'Broadcast Warning Advisory',
    alertBroadcastSuccess: 'Public warning alert successfully broadcasted to citizens!',

    // Statuses
    statusNew: 'New',
    statusInvestigating: 'Investigating',
    statusVerified: 'Verified',
    statusActionInitiated: 'Action Initiated',
    statusResolved: 'Resolved',
    statusDismissed: 'Dismissed',

    // Severities
    sevLow: 'Low',
    sevModerate: 'Moderate',
    sevHigh: 'High',
    sevCritical: 'Critical',

    // Categories
    catWater: 'Water / Flooding',
    catGarbage: 'Garbage / Waste',
    catAir: 'Air Pollution / Smoke',
    catInfra: 'Infrastructure Damage',
    catFire: 'Fire / Hazard',
    catTraffic: 'Traffic / Obstruction',
  },

  hi: {
    // Brand & Header
    appTitle: 'सिविकपल्स',
    appSubtitle: 'एआई-संचालित शहरी एवं पर्यावरण घटना आसूचना मंच',
    reportsConsolidated: 'रिपोर्ट्स समेकित',
    noiseFiltered: 'शोर फ़िल्टर किया गया',
    loadDemoData: 'डेमो डेटा लोड करें',
    loadingDemo: 'डेमो लोड हो रहा है...',
    demoGuide: 'डेमो गाइड',
    analytics: 'एनालिटिक्स',
    reportIncident: 'घटना रिपोर्ट करें',
    citizenRole: 'नागरिक पोर्टल',
    adminRole: 'प्रशासन / अधिकारी',
    authorityRole: 'प्राधिकरण (अधिकारी)',
    emergingAlert: 'उभरती समस्या चेतावनी',
    emergingBadge: 'उभरता हुआ',
    emergingBannerTitle: 'उभरती गंभीर घटना का पता चला',
    inspectIncident: 'घटना क्लस्टर की जांच करें',
    incidentsTitle: 'समेकित घटना फीड',
    analyticsTitle: 'शहर घटना एनालिटिक्स व इंटेलिजेंस मेट्रिक्स',
    analyticsSubtitle: 'समेकन प्रदर्शन, घटना चक्र और शहरी पर्यावरणीय रुझान।',
    citizenWorkspace: 'नागरिक पोर्टल',
    authorityWorkspace: 'अधिकारी नियंत्रण कक्ष',
    citizenPortalSubtitle: 'सार्वजनिक सुरक्षा नेटवर्क व घटना रिपोर्टिंग',
    adminConsoleSubtitle: 'शहर नगरपालिका प्रबंधन व ट्राइएज इंजन',
    citizenTabViewIncidents: 'घटनाएं देखें',
    citizenTabSubmitReport: 'रिपोर्ट दर्ज करें',
    citizenTabNearbyAlerts: 'आस-पास के अलर्ट',
    citizenTabTrackReports: 'मेरी रिपोर्ट्स ट्रैक करें',
    adminTabManageIncidents: 'घटनाएं प्रबंधित करें',
    adminTabInspectReports: 'रिपोर्ट्स की जांच',
    adminTabMergeDuplicates: 'डुप्लिकेट मर्ज करें',
    adminTabVerifyResolve: 'सत्यापन व समाधान',
    adminTabCreateAlerts: 'पब्लिक अलर्ट जारी करें',
    adminTabAnalytics: 'एनालिटिक्स देखें',
    reportIncidentModalTitle: 'शहर / पर्यावरणीय घटना की रिपोर्ट करें',
    activeIncidents: 'सक्रिय घटनाएं',

    // Citizen Tabs
    tabViewIncidents: 'घटनाएं देखें',
    tabSubmitReport: 'रिपोर्ट दर्ज करें',
    tabNearbyAlerts: 'आस-पास के अलर्ट',
    tabTrackReports: 'मेरी रिपोर्ट्स ट्रैक करें',

    // Admin Tabs
    tabManageIncidents: 'घटनाएं प्रबंधित करें',
    tabInspectReports: 'रिपोर्ट्स की जांच',
    tabMergeDuplicates: 'डुप्लिकेट मर्ज करें',
    tabVerifyResolve: 'सत्यापन व समाधान',
    tabCreateAlerts: 'पब्लिक अलर्ट जारी करें',
    tabViewAnalytics: 'एनालिटिक्स देखें',

    // Common / UI
    searchPlaceholder: 'शीर्षक, सड़क या कीवर्ड से घटनाएं खोजें...',
    allCategories: 'सभी श्रेणियां',
    allSeverities: 'सभी गंभीरता स्तर',
    allStatuses: 'सभी स्थितियां',
    onlyEmerging: 'केवल तेजी से बढ़ती घटनाएं',
    cityGridMap: 'शहर ग्रिड मानचित्र',
    incidentClusters: 'घटना समूह (क्लस्टर्स)',
    impactRadius: 'प्रभाव क्षेत्र दायरा',
    locateMe: 'मेरा स्थान खोजें',
    refreshData: 'डेटा रीफ्रेश करें',
    close: 'बंद करें',
    save: 'बदलाव सहेजें',
    cancel: 'रद्द करें',
    status: 'स्थिति',
    severity: 'गंभीरता',
    priorityScore: 'प्राथमिकता स्कोर',
    reportsCount: 'रिपोर्ट्स',
    confidence: 'एआई विश्वास',
    lastUpdated: 'अंतिम अपडेट',
    location: 'स्थान',
    viewDetails: 'विवरण व कारण ग्राफ देखें',

    // Voice Assistant
    voiceAssistant: 'वॉयस असिस्टेंट (बोलकर बताएं)',
    voiceSpeakPrompt: 'समस्या बोलकर बताएं',
    voiceListening: 'सुन रहे हैं... कृपया अपनी समस्या स्पष्ट रूप से बोलें',
    voiceStopListening: 'रिकॉर्डिंग रोकें',
    voiceNotSupported: 'इस ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है। कृपया लिखकर बताएं।',
    voiceQuickPresets: 'या त्वरित वॉयस विकल्प चुनें:',
    voiceTranscribed: 'आवाज को टेक्स्ट में बदल दिया गया!',
    voiceGuidance: 'वॉयस निर्देश सुनें',

    // Form Fields
    descriptionLabel: 'घटना का विवरण (आप क्या देख रहे हैं बताएं)',
    descriptionPlaceholder: 'आप क्या देख रहे हैं बताएं (उदा. सड़क पर भारी जलभराव, कचरे का ढेर, खुला मैनहोल, टूटा बिजली का खंभा)...',
    photoUploadLabel: 'साक्ष्य फोटो (वैकल्पिक, जेमिनी एआई द्वारा विश्लेषण)',
    photoUploadPrompt: 'फोटो अपलोड करने के लिए क्लिक करें या ड्रैग करें',
    locationLabel: 'स्थान / लैंडमार्क',
    locationPlaceholder: 'उदा. स्टेशन रोड, बांद्रा पश्चिम या सिग्नल के पास',
    speakLocationPrompt: 'स्थान बोलकर बताएं',
    speakingLocation: 'स्थान सुन रहे हैं...',
    categoryLabel: 'श्रेणी (वैकल्पिक - एआई स्वचालित रूप से पहचान लेगा)',
    autoCategoryOption: 'एआई को स्वचालित रूप से श्रेणी तय करने दें',
    observerNameLabel: 'आपका नाम (वैकल्पिक)',
    observerNamePlaceholder: 'उदा. राहुल शर्मा या अनाम नागरिक',
    aiAnalyzeBtn: 'एआई विश्लेषण पूर्वावलोकन',
    submittingReport: 'विश्लेषण एवं सबमिट किया जा रहा है...',
    submitReportBtn: 'घटना रिपोर्ट सबमिट करें',

    // Report Tracking
    trackTitle: 'आपकी दर्ज की गई नागरिक रिपोर्ट्स ट्रैक करें',
    trackSubtitle: 'आपकी सबमिशन के लिए लाइव एआई समूहीकरण स्थिति, जांच अपडेट और नगरपालिका प्रतिक्रिया ट्रैकिंग।',
    noTrackedReports: 'इस सत्र में अभी तक कोई रिपोर्ट दर्ज नहीं की गई है। वास्तविक समय की प्रगति देखने के लिए ऊपर घटना रिपोर्ट करें!',
    stageSubmitted: 'दर्ज किया गया',
    stageAnalyzed: 'एआई द्वारा विश्लेषित',
    stageClustered: 'क्लस्टर से जोड़ा गया',
    stageAction: 'कार्रवाई प्रारंभ',
    stageResolved: 'समस्या का समाधान',

    // Public Alerts (Citizen)
    alertsTitle: 'सक्रिय सार्वजनिक सुरक्षा परामर्श व चेतावनियां',
    alertsSubtitle: 'नागरिक सुरक्षा और वैकल्पिक मार्गों के लिए नगर निगम अधिकारियों द्वारा जारी आधिकारिक चेतावनियां।',
    noAlerts: 'वर्तमान में कोई गंभीर सार्वजनिक चेतावनी नहीं है। शहर सामान्य रूप से संचालित हो रहा है।',
    detourAdvice: 'अनुशंसित वैकल्पिक मार्ग / सलाह',
    emergencyHelpline: 'शहर आपातकालीन हेल्पलाइन',

    // Admin Specific
    inspectTitle: 'नागरिक रिपोर्ट समीक्षा स्ट्रीम',
    inspectSubtitle: 'नागरिकों द्वारा भेजी गई सीधी रिपोर्ट्स। एआई सटीकता, साक्ष्य फोटो और क्लस्टर स्थिति की जांच करें।',
    mergeTitle: 'डुप्लिकेट रिपोर्ट समेकन इंजन',
    mergeSubtitle: 'आस-पास की समान समय वाली डुप्लिकेट रिपोर्ट्स को एक मुख्य घटना में मर्ज करें ताकि शोर कम हो।',
    verifyTitle: 'सत्यापन व समाधान केंद्र',
    verifySubtitle: 'फील्ड सत्यापन, प्रशासनिक कार्य स्थिति और समाधान का ऑडिट ट्रेल।',
    createAlertTitle: 'आधिकारिक सार्वजनिक चेतावनी जारी करें',
    createAlertSubtitle: 'वैकल्पिक मार्ग व सलाह के साथ सीधे नागरिक पोर्टल पर सत्यापित अलर्ट प्रसारित करें।',
    broadcastBtn: 'सार्वजनिक चेतावनी प्रसारित करें',
    alertBroadcastSuccess: 'सार्वजनिक चेतावनी नागरिकों को सफलतापूर्वक प्रसारित कर दी गई!',

    // Statuses
    statusNew: 'नई',
    statusInvestigating: 'जांच जारी',
    statusVerified: 'सत्यापित',
    statusActionInitiated: 'कार्रवाई शुरू',
    statusResolved: 'समाधान संपन्न',
    statusDismissed: 'खारिज',

    // Severities
    sevLow: 'निम्न',
    sevModerate: 'मध्यम',
    sevHigh: 'उच्च',
    sevCritical: 'अति-गंभीर',

    // Categories
    catWater: 'जल / बाढ़ व जलभराव',
    catGarbage: 'कचरा / अपशिष्ट',
    catAir: 'वायु प्रदूषण / धुआं',
    catInfra: 'बुनियादी ढांचा क्षति',
    catFire: 'आग / खतरनाक स्थिति',
    catTraffic: 'यातायात / मार्ग अवरोध',
  },

  mr: {
    // Brand & Header
    appTitle: 'सिव्हिकपल्स',
    appSubtitle: 'एआय-सक्षम शहरी व पर्यावरणीय घटना बुद्धिमत्ता मंच',
    reportsConsolidated: 'तक्रारी एकत्रित',
    noiseFiltered: 'अनावश्यक गोंधळ दूर',
    loadDemoData: 'डेमो डेटा लोड करा',
    loadingDemo: 'डेमो लोड होत आहे...',
    demoGuide: 'डेमो मार्गदर्शक',
    analytics: 'अनालिटिक्स',
    reportIncident: 'घटना नोंदवा',
    citizenRole: 'नागरिक पोर्टल',
    adminRole: 'प्रशासन / अधिकारी',
    authorityRole: 'प्राधिकरण (अधिकारी)',
    emergingAlert: 'गंभीर उदयोन्मुख इशारा',
    emergingBadge: 'उदयोन्मुख',
    emergingBannerTitle: 'उदयोन्मुख गंभीर घटना आढळली',
    inspectIncident: 'घटना क्लस्टरची पाहणी करा',
    incidentsTitle: 'एकत्रित घटना फीड',
    analyticsTitle: 'शहर घटना अनालिटिक्स व बुद्धिमत्ता मेट्रिक्स',
    analyticsSubtitle: 'समेकन कामगिरी, घटना जीवनचक्र आणि शहरी पर्यावरण कल.',
    citizenWorkspace: 'नागरिक पोर्टल',
    authorityWorkspace: 'अधिकारी नियंत्रण कक्ष',
    citizenPortalSubtitle: 'सार्वजनिक सुरक्षा नेटवर्क व तक्रार नोंदणी',
    adminConsoleSubtitle: 'शहर महापालिका व्यवस्थापन व ट्राइएज इंजिन',
    citizenTabViewIncidents: 'घटना पहा',
    citizenTabSubmitReport: 'तक्रार नोंदवा',
    citizenTabNearbyAlerts: 'परिसरातील इशारे (अलर्ट्स)',
    citizenTabTrackReports: 'माझ्या तक्रारींचा मागोवा',
    adminTabManageIncidents: 'घटना व्यवस्थापन',
    adminTabInspectReports: 'तक्रारींची पाहणी',
    adminTabMergeDuplicates: 'डुप्लिकेट एकत्र करा',
    adminTabVerifyResolve: 'पडताळणी व निराकरण',
    adminTabCreateAlerts: 'सार्वजनिक इशारा जारी करा',
    adminTabAnalytics: 'अनालिटिक्स पहा',
    reportIncidentModalTitle: 'शहर / पर्यावरणीय घटना नोंदवा',
    activeIncidents: 'सक्रिय घटना',

    // Citizen Tabs
    tabViewIncidents: 'घटना पहा',
    tabSubmitReport: 'तक्रार नोंदवा',
    tabNearbyAlerts: 'परिसरातील इशारे (अलर्ट्स)',
    tabTrackReports: 'माझ्या तक्रारींचा मागोवा',

    // Admin Tabs
    tabManageIncidents: 'घटना व्यवस्थापन',
    tabInspectReports: 'तक्रारींची पाहणी',
    tabMergeDuplicates: 'डुप्लिकेट एकत्र करा',
    tabVerifyResolve: 'पडताळणी व निराकरण',
    tabCreateAlerts: 'सार्वजनिक इशारा जारी करा',
    tabViewAnalytics: 'अनालिटिक्स पहा',

    // Common / UI
    searchPlaceholder: 'शीर्षक, रस्ता किंवा कीवर्डने घटना शोधा...',
    allCategories: 'सर्व श्रेणी',
    allSeverities: 'सर्व तीव्रता स्तर',
    allStatuses: 'सर्व स्थिती',
    onlyEmerging: 'केवळ वेगाने वाढणाऱ्या घटना',
    cityGridMap: 'शहर नकाशा',
    incidentClusters: 'घटना समूह (क्लस्टर्स)',
    impactRadius: 'प्रभाव क्षेत्र त्रिज्या',
    locateMe: 'माझे स्थान शोधा',
    refreshData: 'डेटा ताजा करा',
    close: 'बंद करा',
    save: 'बदल जतन करा',
    cancel: 'रद्द करा',
    status: 'स्थिती',
    severity: 'तीव्रता',
    priorityScore: 'प्राधान्य गुण',
    reportsCount: 'तक्रारी',
    confidence: 'एआय अचूकता',
    lastUpdated: 'अद्यतनित',
    location: 'ठिकाण',
    viewDetails: 'तपशील व कारण आलेख पहा',

    // Voice Assistant
    voiceAssistant: 'व्हॉइस असिस्टंट (बोलून सांगा)',
    voiceSpeakPrompt: 'समस्या बोलून सांगा',
    voiceListening: 'ऐकत आहोत... कृपया आपली समस्या स्पष्ट आवाजात बोला',
    voiceStopListening: 'रेकॉर्डिंग थांबवा',
    voiceNotSupported: 'या ब्राउझरमध्ये व्हॉइस ओळख उपलब्ध नाही. कृपया लिहून सांगा.',
    voiceQuickPresets: 'किंवा तयार पर्याय निवडा:',
    voiceTranscribed: 'आवाजाचे मजकुरात यशस्वी रूपांतर!',
    voiceGuidance: 'आवाजी सूचना ऐका',

    // Form Fields
    descriptionLabel: 'घटनेचे वर्णन (तुम्ही काय पाहत आहात ते सांगा)',
    descriptionPlaceholder: 'आपण काय पाहत आहात ते सांगा (उदा. रस्त्यावर पाणी साचले आहे, गटार तुंबले आहे, कचऱ्याचा ढीग, उघडे मॅनहोल)...',
    photoUploadLabel: 'पुराव्याचा फोटो (पर्यायी, जेमिनी एआय द्वारे तपासणी)',
    photoUploadPrompt: 'फोटो अपलोड करण्यासाठी क्लिक करा किंवा ड्रॅग करा',
    locationLabel: 'ठिकाण / लँडमार्क',
    locationPlaceholder: 'उदा. स्टेशन रोड, दादर पश्चिम किंवा उड्डाणपुलाजवळ',
    speakLocationPrompt: 'स्थान बोलून सांगा',
    speakingLocation: 'स्थान ऐकत आहोत...',
    categoryLabel: 'श्रेणी (पर्यायी - एआय आपोआप ठरवेल)',
    autoCategoryOption: 'एआयला आपोआप श्रेणी ठरवू द्या',
    observerNameLabel: 'आपले नाव (पर्यायी)',
    observerNamePlaceholder: 'उदा. सचिन जोशी किंवा निनावी नागरिक',
    aiAnalyzeBtn: 'एआय तपासणी पूर्वदृष्य',
    submittingReport: 'तपासणी व सबमिट होत आहे...',
    submitReportBtn: 'घटना अहवाल सबमिट करा',

    // Report Tracking
    trackTitle: 'आपण नोंदवलेल्या तक्रारींचा मागोवा घ्या',
    trackSubtitle: 'आपल्या नोंदींची थेट एआय क्लस्टर स्थिती, प्रशासकीय तपास आणि महापालिकेची कारवाई तपासा.',
    noTrackedReports: 'या सत्रात अद्याप कोणतीही तक्रार नोंदवलेली नाही. थेट प्रगती पाहण्यासाठी वरील घटना नोंदवा बटण वापरा!',
    stageSubmitted: 'नोंदणी झाली',
    stageAnalyzed: 'एआयने तपासले',
    stageClustered: 'क्लस्टरशी जोडले',
    stageAction: 'कारवाई सुरू',
    stageResolved: 'समस्या सुटली',

    // Public Alerts (Citizen)
    alertsTitle: 'सक्रिय सार्वजनिक सुरक्षा इशारे व सूचना',
    alertsSubtitle: 'नागरिकांच्या सुरक्षेसाठी आणि पर्यायी मार्गांसाठी महापालिका प्रशासनाकडून जारी केलेले अधिकृत इशारे.',
    noAlerts: 'सध्या कोणताही आणीबाणीचा सार्वजनिक इशारा नाही. शहर सुरळीत सुरू आहे.',
    detourAdvice: 'पर्यायी मार्ग / सुरक्षा सल्ला',
    emergencyHelpline: 'शहर आपत्कालीन हेल्पलाइन',

    // Admin Specific
    inspectTitle: 'नागरिक तक्रार तपासणी स्ट्रीम',
    inspectSubtitle: 'नागरिकांकडून आलेल्या थेट तक्रारी. एआय अचूकता, पुराव्याचे फोटो आणि क्लस्टरची तपासणी करा.',
    mergeTitle: 'डुप्लिकेट तक्रारी समेकन इंजिन',
    mergeSubtitle: 'परिसरातील एकाच वेळेच्या समान तक्रारींना एका मुख्य घटनेमध्ये विलीन करा जेणेकरून गोंधळ टळेल.',
    verifyTitle: 'पडताळणी व निराकरण केंद्र',
    verifySubtitle: 'थेट जागेवर जाऊन पडताळणी, प्रशासकीय कार्यवाही आणि निराकरणाचा ऑडिट ट्रेल.',
    createAlertTitle: 'अधिकृत सार्वजनिक इशारा जारी करा',
    createAlertSubtitle: 'पर्यायी मार्ग व सल्ल्यासह थेट नागरिक पोर्टलवर अधिकृत अलर्ट प्रसारित करा.',
    broadcastBtn: 'सार्वजनिक अलर्ट प्रसारित करा',
    alertBroadcastSuccess: 'सार्वजनिक इशारा नागरिकांपर्यंत यशस्वीरित्या पोहोचवला गेला!',

    // Statuses
    statusNew: 'नवीन',
    statusInvestigating: 'चौकशी सुरू',
    statusVerified: 'पडताळणी झाली',
    statusActionInitiated: 'कारवाई सुरू',
    statusResolved: 'निराकरण झाले',
    statusDismissed: 'फेटाळले',

    // Severities
    sevLow: 'कमी',
    sevModerate: 'मध्यम',
    sevHigh: 'उच्च',
    sevCritical: 'अति-गंभीर',

    // Categories
    catWater: 'पाणी / पूर व जलमय स्थिती',
    catGarbage: 'कचरा / टाकाऊ वस्तू',
    catAir: 'हवा प्रदूषण / धूर',
    catInfra: 'पायाभूत सुविधांचे नुकसान',
    catFire: 'आग / धोकादायक स्थिती',
    catTraffic: 'वाहतूक कोंडी / रस्ता अडथळा',
  },
};

export type TranslationKey = keyof typeof TRANSLATIONS.en | string;

export function t(key: TranslationKey, lang: LanguageCode = 'en'): string {
  const dict = (TRANSLATIONS[lang] || TRANSLATIONS.en) as Record<string, string>;
  return dict[key] || (TRANSLATIONS.en as Record<string, string>)[key] || key;
}

export function translateCategory(category: IncidentCategory, lang: LanguageCode = 'en'): string {
  switch (category) {
    case 'WATER / FLOODING':
      return t('catWater', lang);
    case 'GARBAGE / WASTE':
      return t('catGarbage', lang);
    case 'AIR POLLUTION / SMOKE':
      return t('catAir', lang);
    case 'INFRASTRUCTURE DAMAGE':
      return t('catInfra', lang);
    case 'FIRE / HAZARD':
      return t('catFire', lang);
    case 'TRAFFIC / OBSTRUCTION':
      return t('catTraffic', lang);
    default:
      return category;
  }
}

export function translateStatus(status: IncidentStatus, lang: LanguageCode = 'en'): string {
  switch (status) {
    case 'New':
      return t('statusNew', lang);
    case 'Investigating':
      return t('statusInvestigating', lang);
    case 'Verified':
      return t('statusVerified', lang);
    case 'Action Initiated':
      return t('statusActionInitiated', lang);
    case 'Resolved':
      return t('statusResolved', lang);
    case 'Dismissed':
      return t('statusDismissed', lang);
    default:
      return status;
  }
}

export function translateSeverity(level: SeverityLevel | string, lang: LanguageCode = 'en'): string {
  const lvl = String(level);
  if (lvl === '1' || lvl.toLowerCase() === 'low') return t('sevLow', lang);
  if (lvl === '2' || lvl.toLowerCase() === 'moderate') return t('sevModerate', lang);
  if (lvl === '3' || lvl === '4' || lvl.toLowerCase() === 'high') return t('sevHigh', lang);
  if (lvl === '5' || lvl.toLowerCase() === 'critical') return t('sevCritical', lang);
  return lvl;
}
