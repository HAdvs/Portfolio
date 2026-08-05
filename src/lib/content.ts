export const LOGO =
  "https://i.ibb.co/84bLpr63/Portfolio-Haitham-Brand-Designer-Logo-2048x2048.png";
export const LOGO_HERO =
  "https://i.ibb.co/hJ0psH73/Portfolio-Haitham-Brand-Designer-Logo-2048x2048.png";
export const WHATSAPP = "966539595432";

export type Lang = "ar" | "en";

export const NAV_IDS = [
  "home",
  "about",
  "services",
  "work",
  "process",
  "why",
  "voices",
  "faq",
  "contact",
] as const;

export const PORTFOLIO_IMAGES = [
  "https://images.pexels.com/photos/8489951/pexels-photo-8489951.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1100",
  "https://images.pexels.com/photos/4464879/pexels-photo-4464879.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1100",
  "https://images.pexels.com/photos/8015895/pexels-photo-8015895.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1100",
  "https://images.pexels.com/photos/7598009/pexels-photo-7598009.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1100",
  "https://images.pexels.com/photos/6406691/pexels-photo-6406691.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1100",
  "https://images.pexels.com/photos/8947626/pexels-photo-8947626.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1100",
  "https://images.pexels.com/photos/4464917/pexels-photo-4464917.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1100",
  "https://images.pexels.com/photos/5706015/pexels-photo-5706015.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1100",
  "https://images.pexels.com/photos/8532943/pexels-photo-8532943.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1100",
];

export const AVATARS = [
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/76.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/15.jpg",
];

type Dict = {
  dir: "rtl" | "ltr";
  nav: Record<(typeof NAV_IDS)[number], string>;
  menu: string;
  themeLight: string;
  themeDark: string;
  loading: string;
  hero: {
    badge: string;
    title1: string;
    title2: string;
    desc: string;
    cta1: string;
    cta2: string;
    stats: { v: string; l: string }[];
    scroll: string;
  };
  marquee: string[];
  about: {
    kicker: string;
    title: string;
    p1: string;
    p2: string;
    pillars: { t: string; d: string }[];
    numbers: { v: string; l: string }[];
  };
  services: {
    kicker: string;
    title: string;
    sub: string;
    items: { t: string; d: string }[];
  };
  work: {
    kicker: string;
    title: string;
    sub: string;
    filters: { id: string; label: string }[];
    view: string;
    projects: { t: string; type: string }[];
  };
  process: {
    kicker: string;
    title: string;
    sub: string;
    steps: { t: string; d: string }[];
  };
  why: {
    kicker: string;
    title: string;
    sub: string;
    items: { t: string; d: string }[];
  };
  voices: {
    kicker: string;
    title: string;
    sub: string;
    items: { name: string; company: string; text: string; rate: number }[];
  };
  faq: { kicker: string; title: string; sub: string; items: { q: string; a: string }[] };
  cta: { title: string; sub: string; btn: string };
  contact: {
    kicker: string;
    title: string;
    sub: string;
    fields: {
      name: string;
      email: string;
      phone: string;
      company: string;
      service: string;
      details: string;
      budget: string;
    };
    placeholders: Record<string, string>;
    budgets: string[];
    submit: string;
    sending: string;
    note: string;
    info: { t: string; v: string }[];
    required: string;
    msgTitle: string;
  };
  footer: {
    tagline: string;
    pages: string;
    services: string;
    social: string;
    rights: string;
    top: string;
    built: string;
  };
};

export const content: Record<Lang, Dict> = {
  ar: {
    dir: "rtl",
    nav: {
      home: "الرئيسية",
      about: "من نحن",
      services: "الخدمات",
      work: "أعمالنا",
      process: "منهجيتنا",
      why: "لماذا نحن",
      voices: "آراء العملاء",
      faq: "الأسئلة",
      contact: "تواصل معنا",
    },
    menu: "القائمة",
    themeLight: "الوضع النهاري",
    themeDark: "الوضع الليلي",
    loading: "جارٍ تجهيز التجربة",
    hero: {
      badge: "وكالة تصميم إبداعية · الرياض",
      title1: "نصنع علامات تجارية",
      title2: "تُصنع الفارق.",
      desc: "وكالة تصميم إبداعية متخصصة في بناء الهويات البصرية، وتصميم الشعارات، وصناعة التجارب البصرية التي تجعل العلامات التجارية أكثر حضوراً وتأثيراً.",
      cta1: "ابدأ مشروعك",
      cta2: "استعرض أعمالنا",
      stats: [
        { v: "+50", l: "مشروع" },
        { v: "100%", l: "رضا العملاء" },
        { v: "24h", l: "تسليم احترافي" },
      ],
      scroll: "مرّر للأسفل",
    },
    marquee: [
      "هوية بصرية",
      "استراتيجية علامة",
      "تصميم شعارات",
      "أنظمة بصرية",
      "تغليف",
      "تجربة مستخدم",
      "إعلانات",
      "مطبوعات",
    ],
    about: {
      kicker: "من نحن",
      title: "الهوية ليست شعاراً… بل انطباعٌ أول لا يُنسى",
      p1: "نؤمن أن الهوية البصرية ليست مجرد شعار، بل هي الانطباع الأول، ولغة العلامة التجارية، والأساس الذي تُبنى عليه الثقة.",
      p2: "نعمل على تحويل الأفكار إلى علامات تجارية متكاملة تجمع بين الجمال والاستراتيجية والوضوح.",
      pillars: [
        { t: "الاستراتيجية", d: "قرارات تصميم مبنية على بحث وسوق ومنافسين، لا على الذوق وحده." },
        { t: "الجمال", d: "حسّ بصري راقٍ، تفاصيل دقيقة، ومساحات بيضاء تمنح العلامة هيبتها." },
        { t: "الوضوح", d: "رسالة واحدة، صوت واحد، ونظام بصري متسق عبر كل نقطة تماس." },
      ],
      numbers: [
        { v: "8+", l: "سنوات خبرة" },
        { v: "50+", l: "مشروع مُنجز" },
        { v: "18", l: "قطاع مختلف" },
        { v: "12", l: "جائزة وتكريم" },
      ],
    },
    services: {
      kicker: "خدماتنا",
      title: "كل ما تحتاجه علامتك، تحت سقف واحد",
      sub: "من الفكرة الأولى إلى دليل الهوية الكامل، نبني منظومة بصرية متكاملة تعمل في كل مكان.",
      items: [
        { t: "تصميم الهوية البصرية", d: "بناء هوية متكاملة تعكس شخصية العلامة وقيمها بلغة بصرية فريدة." },
        { t: "تصميم الشعارات", d: "شعار بسيط، مميز، وقابل للتطبيق على كل المقاسات والوسائط." },
        { t: "أنظمة الهوية البصرية", d: "دليل استخدام شامل: ألوان، خطوط، شبكات، وقواعد تطبيق دقيقة." },
        { t: "تصميم الإعلانات", d: "حملات بصرية تلفت الانتباه وتحوّل المشاهدة إلى فعل." },
        { t: "تصميم الجرافيك", d: "تصاميم يومية عالية الجودة تحافظ على اتساق العلامة." },
        { t: "تصميم السوشيال ميديا", d: "قوالب ومحتوى بصري يصنع حضوراً ثابتاً على المنصات." },
        { t: "استراتيجية العلامة التجارية", d: "تموضع، رسائل، وشخصية علامة واضحة قبل أول بكسل." },
        { t: "المطبوعات", d: "بروفايلات، كتيبات، ولوحات مطبوعة بجودة إنتاج احترافية." },
        { t: "تصميم التغليف", d: "تغليف يبيع من الرف، ويصنع لحظة فتح لا تُنسى." },
        { t: "تصميم واجهات وتجربة المستخدم", d: "واجهات أنيقة سهلة الاستخدام، مبنية على سلوك حقيقي." },
        { t: "تصميم المواقع الإلكترونية", d: "مواقع سريعة ومتجاوبة تُترجم الهوية إلى تجربة رقمية." },
      ],
    },
    work: {
      kicker: "أعمالنا",
      title: "مشاريع تتحدث عن نفسها",
      sub: "مختارات من الهويات والأنظمة البصرية التي بنيناها مع شركاء طموحين.",
      filters: [
        { id: "all", label: "الكل" },
        { id: "identity", label: "الهوية" },
        { id: "logo", label: "الشعارات" },
        { id: "packaging", label: "التغليف" },
        { id: "ads", label: "الإعلانات" },
        { id: "uiux", label: "UI/UX" },
      ],
      view: "عرض المشروع",
      projects: [
        { t: "نُصوص", type: "هوية بصرية متكاملة" },
        { t: "أوّج للاستثمار", type: "هوية مؤسسية" },
        { t: "ڤيرا سكين", type: "تغليف منتجات" },
        { t: "مِرقاة", type: "استراتيجية وتموضع" },
        { t: "تطبيق سِراج", type: "واجهات وتجربة مستخدم" },
        { t: "منارة", type: "تصميم شعار" },
        { t: "بَلَسم", type: "تغليف فاخر" },
        { t: "حملة أفق", type: "حملة إعلانية" },
        { t: "قِمم", type: "شعار وعلامة" },
      ],
    },
    process: {
      kicker: "منهجيتنا",
      title: "رحلة مدروسة من الفكرة إلى الأثر",
      sub: "سبع مراحل واضحة تضمن نتيجة دقيقة، وتسليماً في وقته، بلا مفاجآت.",
      steps: [
        { t: "اكتشاف المشروع", d: "جلسة عمل نفهم فيها العلامة، الجمهور، والأهداف التجارية." },
        { t: "البحث والتحليل", d: "دراسة السوق والمنافسين واتجاهات القطاع لبناء أرضية صلبة." },
        { t: "الاستراتيجية", d: "تحديد التموضع، الرسائل، وشخصية العلامة ونبرة صوتها." },
        { t: "التصميم", d: "استكشاف اتجاهات بصرية، ثم تطوير الاتجاه المختار بعمق." },
        { t: "المراجعة", d: "جولات مراجعة منظمة مع ملاحظات دقيقة وقرارات واضحة." },
        { t: "التسليم", d: "ملفات مصدرية منظمة + دليل هوية كامل جاهز للتطبيق." },
        { t: "الدعم", d: "مرافقة ما بعد التسليم لضمان تطبيق سليم ومتسق." },
      ],
    },
    why: {
      kicker: "لماذا نحن",
      title: "لماذا تختار وكالتنا",
      sub: "لأن الفرق بين تصميم جميل وعلامة ناجحة هو الطريقة التي نعمل بها.",
      items: [
        { t: "تصميم مبني على استراتيجية", d: "كل خيار بصري له سبب تجاري واضح يخدم أهدافك." },
        { t: "خبرة في العلامات التجارية", d: "أكثر من ٥٠ مشروعاً في ١٨ قطاعاً مختلفاً." },
        { t: "أفكار إبداعية", d: "حلول أصلية بعيدة عن القوالب الجاهزة والمكرر." },
        { t: "التزام بالمواعيد", d: "جدول زمني معلن، ومراحل تسليم واضحة منذ اليوم الأول." },
        { t: "حلول مخصصة", d: "لا نُعيد استخدام نفس القالب، كل علامة لها بصمتها." },
        { t: "جودة عالمية", d: "معايير إنتاج وتفاصيل تُضاهي كبرى الوكالات العالمية." },
      ],
    },
    voices: {
      kicker: "آراء العملاء",
      title: "ثقة تُبنى بالنتائج",
      sub: "ما يقوله شركاؤنا بعد إطلاق علاماتهم.",
      items: [
        {
          name: "خالد الشمري",
          company: "الرئيس التنفيذي — أوّج للاستثمار",
          text: "خرجنا بهوية تشبهنا فعلاً. الفريق فهم طبيعة السوق قبل أن يرسم خطاً واحداً، والنتيجة رفعت من قيمة علامتنا أمام المستثمرين.",
          rate: 5,
        },
        {
          name: "ريم العتيبي",
          company: "مديرة التسويق — ڤيرا سكين",
          text: "التغليف الجديد غيّر أداء المنتج على الرف تماماً. تفاصيل دقيقة، وإنتاج نظيف، وتسليم قبل الموعد.",
          rate: 5,
        },
        {
          name: "عبدالله الحربي",
          company: "مؤسس — تطبيق سِراج",
          text: "تجربة المستخدم أصبحت أوضح وأسرع. الفريق يفكر كمنتج لا كمصمم فقط، وهذا فرق كبير.",
          rate: 5,
        },
        {
          name: "نورة القحطاني",
          company: "مديرة العلامة — بَلَسم",
          text: "احترافية نادرة في التعامل والمواعيد. دليل الهوية الذي سلّمونا إياه صار مرجعنا اليومي.",
          rate: 5,
        },
        {
          name: "فيصل الدوسري",
          company: "شريك مؤسس — مِرقاة",
          text: "الاستراتيجية قبل التصميم كانت نقطة التحول. لأول مرة نعرف بالضبط ما الذي نقوله ولمن.",
          rate: 5,
        },
      ],
    },
    faq: {
      kicker: "الأسئلة الشائعة",
      title: "إجابات على ما يشغل بالك",
      sub: "وإن لم تجد سؤالك، تواصل معنا مباشرة عبر واتساب.",
      items: [
        {
          q: "كم يستغرق مشروع الهوية البصرية؟",
          a: "مشروع الهوية الكامل يستغرق عادة من ٣ إلى ٦ أسابيع حسب حجم النطاق وعدد التطبيقات. أما تصميم الشعار المستقل فيتراوح بين ٧ و١٤ يوم عمل. نضع جدولاً زمنياً واضحاً قبل بدء العمل.",
        },
        {
          q: "ما الذي يشمله دليل الهوية؟",
          a: "يشمل الشعار بكل صيغه ومقاساته، نظام الألوان، الخطوط، الشبكات، الأيقونات، الأنماط، أمثلة تطبيق، وقواعد الاستخدام الصحيح والخاطئ، إضافة إلى الملفات المصدرية.",
        },
        {
          q: "كم عدد جولات التعديل المتاحة؟",
          a: "نوفّر ثلاث جولات مراجعة منظمة ضمن الباقة الأساسية، وغالباً لا نحتاج إليها كلها لأن مرحلة الاستراتيجية تحسم معظم القرارات مبكراً.",
        },
        {
          q: "هل تعملون مع الشركات الناشئة؟",
          a: "نعم، ولدينا مسار مخصص للشركات الناشئة يركز على الأساسيات الضرورية للإطلاق، مع إمكانية التوسع لاحقاً إلى نظام هوية كامل.",
        },
        {
          q: "كيف تتم آلية الدفع؟",
          a: "دفعة أولى ٥٠٪ لبدء العمل، و٥٠٪ عند التسليم النهائي. للمشاريع الكبيرة نقسّم الدفعات على مراحل المشروع.",
        },
        {
          q: "هل أملك حقوق التصاميم بالكامل؟",
          a: "بالتأكيد. بعد التسليم النهائي تنتقل إليك كامل الحقوق الفكرية للتصاميم المعتمدة مع جميع الملفات المصدرية.",
        },
      ],
    },
    cta: {
      title: "هل أنت مستعد لبناء علامة تجارية تترك أثراً؟",
      sub: "أخبرنا عن فكرتك، وسنعود إليك بخطة عمل واضحة خلال ٢٤ ساعة.",
      btn: "ابدأ مشروعك الآن",
    },
    contact: {
      kicker: "تواصل معنا",
      title: "لنبدأ الحديث عن علامتك",
      sub: "املأ النموذج وسيتم تحويلك مباشرة إلى واتساب برسالة جاهزة تحتوي تفاصيل مشروعك.",
      fields: {
        name: "الاسم",
        email: "البريد الإلكتروني",
        phone: "رقم الجوال",
        company: "اسم الشركة",
        service: "نوع الخدمة",
        details: "تفاصيل المشروع",
        budget: "الميزانية",
      },
      placeholders: {
        name: "اكتب اسمك الكامل",
        email: "name@company.com",
        phone: "05XXXXXXXX",
        company: "اسم شركتك أو مشروعك",
        details: "أخبرنا عن مشروعك، جمهورك، والهدف الذي تسعى إليه…",
      },
      budgets: [
        "أقل من ٥٬٠٠٠ ر.س",
        "٥٬٠٠٠ – ١٥٬٠٠٠ ر.س",
        "١٥٬٠٠٠ – ٣٠٬٠٠٠ ر.س",
        "٣٠٬٠٠٠ – ٦٠٬٠٠٠ ر.س",
        "أكثر من ٦٠٬٠٠٠ ر.س",
      ],
      submit: "إرسال الطلب",
      sending: "جارٍ فتح واتساب…",
      note: "بالضغط على الزر سيتم فتح تطبيق البريد الإلكتروني برسالة معبأة تلقائياً بتفاصيل مشروعك.",
      info: [
        { t: "واتساب", v: "+966 53 959 5432" },
        { t: "البريد", v: "hello@yourmark.studio" },
        { t: "الموقع", v: "الرياض، المملكة العربية السعودية" },
        { t: "أوقات العمل", v: "الأحد – الخميس · ٩ص – ٦م" },
      ],
      required: "الرجاء تعبئة الاسم ونوع الخدمة على الأقل.",
      msgTitle: "طلب مشروع جديد",
    },
    footer: {
      tagline: "علامتك التجارية تستحق علامة فارقة.",
      pages: "الصفحات",
      services: "الخدمات",
      social: "وسائل التواصل",
      rights: "جميع الحقوق محفوظة.",
      top: "العودة للأعلى",
      built: "صُمم وبُني بعناية فائقة",
    },
  },

  en: {
    dir: "ltr",
    nav: {
      home: "Home",
      about: "About",
      services: "Services",
      work: "Work",
      process: "Process",
      why: "Why Us",
      voices: "Clients",
      faq: "FAQ",
      contact: "Contact",
    },
    menu: "Menu",
    themeLight: "Light mode",
    themeDark: "Dark mode",
    loading: "Preparing the experience",
    hero: {
      badge: "Creative Design Agency · Riyadh",
      title1: "We build brands",
      title2: "that make the difference.",
      desc: "A creative design agency specialised in building visual identities, crafting logos, and designing brand experiences that make companies more present, more memorable, more powerful.",
      cta1: "Start your project",
      cta2: "Explore our work",
      stats: [
        { v: "+50", l: "Projects" },
        { v: "100%", l: "Client satisfaction" },
        { v: "24h", l: "Pro turnaround" },
      ],
      scroll: "Scroll",
    },
    marquee: [
      "Brand Identity",
      "Strategy",
      "Logo Design",
      "Design Systems",
      "Packaging",
      "UI / UX",
      "Advertising",
      "Print",
    ],
    about: {
      kicker: "About",
      title: "An identity is not a logo — it's an unforgettable first impression",
      p1: "We believe a visual identity is far more than a logo: it is the first impression, the language of the brand, and the foundation trust is built upon.",
      p2: "We turn ideas into complete brands that combine beauty, strategy and clarity.",
      pillars: [
        { t: "Strategy", d: "Design decisions grounded in research, market and competitors — not taste alone." },
        { t: "Beauty", d: "Refined visual craft, obsessive detail, and white space that gives a brand presence." },
        { t: "Clarity", d: "One message, one voice, one consistent system across every touchpoint." },
      ],
      numbers: [
        { v: "8+", l: "Years of craft" },
        { v: "50+", l: "Delivered projects" },
        { v: "18", l: "Industries" },
        { v: "12", l: "Awards & features" },
      ],
    },
    services: {
      kicker: "Services",
      title: "Everything your brand needs, under one roof",
      sub: "From the first idea to a complete brand book, we build a visual system that works everywhere.",
      items: [
        { t: "Brand Identity Design", d: "A complete identity that reflects your brand's character in a unique visual language." },
        { t: "Logo Design", d: "Simple, distinctive marks that scale beautifully across every size and medium." },
        { t: "Identity Systems", d: "Full guidelines: colour, type, grids and precise application rules." },
        { t: "Advertising Design", d: "Visual campaigns that grab attention and turn views into action." },
        { t: "Graphic Design", d: "High-quality day-to-day design that keeps your brand consistent." },
        { t: "Social Media Design", d: "Templates and visual content that build a steady presence online." },
        { t: "Brand Strategy", d: "Positioning, messaging and personality defined before the first pixel." },
        { t: "Print & Editorial", d: "Profiles, brochures and boards produced to professional standards." },
        { t: "Packaging Design", d: "Packaging that sells from the shelf and creates a memorable unboxing." },
        { t: "UI/UX Design", d: "Elegant, usable interfaces built on real user behaviour." },
        { t: "Website Design", d: "Fast, responsive sites that translate identity into digital experience." },
      ],
    },
    work: {
      kicker: "Selected Work",
      title: "Projects that speak for themselves",
      sub: "A selection of identities and visual systems built with ambitious partners.",
      filters: [
        { id: "all", label: "All" },
        { id: "identity", label: "Identity" },
        { id: "logo", label: "Logos" },
        { id: "packaging", label: "Packaging" },
        { id: "ads", label: "Advertising" },
        { id: "uiux", label: "UI/UX" },
      ],
      view: "View project",
      projects: [
        { t: "Nusus", type: "Full brand identity" },
        { t: "Awj Capital", type: "Corporate identity" },
        { t: "Vera Skin", type: "Product packaging" },
        { t: "Mirqat", type: "Strategy & positioning" },
        { t: "Siraj App", type: "UI / UX design" },
        { t: "Manara", type: "Logo design" },
        { t: "Balsam", type: "Luxury packaging" },
        { t: "Ufuq Campaign", type: "Ad campaign" },
        { t: "Qimam", type: "Logo & mark" },
      ],
    },
    process: {
      kicker: "Process",
      title: "A deliberate journey from idea to impact",
      sub: "Seven clear stages that guarantee precision, on-time delivery, and zero surprises.",
      steps: [
        { t: "Discovery", d: "A working session to understand the brand, audience and business goals." },
        { t: "Research & Analysis", d: "Market, competitor and category study to build a solid foundation." },
        { t: "Strategy", d: "Positioning, messaging, brand personality and tone of voice." },
        { t: "Design", d: "Exploring visual routes, then developing the chosen direction in depth." },
        { t: "Review", d: "Structured review rounds with sharp feedback and clear decisions." },
        { t: "Delivery", d: "Organised source files plus a complete, ready-to-apply brand book." },
        { t: "Support", d: "Post-launch guidance to ensure a correct, consistent rollout." },
      ],
    },
    why: {
      kicker: "Why Us",
      title: "Why choose our studio",
      sub: "Because the gap between a pretty design and a successful brand is how we work.",
      items: [
        { t: "Strategy-led design", d: "Every visual choice has a clear business reason behind it." },
        { t: "Brand expertise", d: "50+ projects delivered across 18 different industries." },
        { t: "Original thinking", d: "Authentic solutions, never templates or recycled ideas." },
        { t: "On-time delivery", d: "Published timelines and clear milestones from day one." },
        { t: "Tailored solutions", d: "No copy-paste systems — every brand gets its own signature." },
        { t: "World-class quality", d: "Production standards that match leading global agencies." },
      ],
    },
    voices: {
      kicker: "Testimonials",
      title: "Trust built on results",
      sub: "What our partners say after launching their brands.",
      items: [
        {
          name: "Khalid Al-Shammari",
          company: "CEO — Awj Capital",
          text: "We ended up with an identity that genuinely looks like us. The team understood the market before drawing a single line, and the result raised our brand value in front of investors.",
          rate: 5,
        },
        {
          name: "Reem Al-Otaibi",
          company: "Marketing Director — Vera Skin",
          text: "The new packaging completely changed how the product performs on shelf. Sharp details, clean production and delivery ahead of schedule.",
          rate: 5,
        },
        {
          name: "Abdullah Al-Harbi",
          company: "Founder — Siraj App",
          text: "The user experience became clearer and faster. This team thinks like a product team, not only like designers — that's a huge difference.",
          rate: 5,
        },
        {
          name: "Noura Al-Qahtani",
          company: "Brand Manager — Balsam",
          text: "Rare professionalism in communication and deadlines. The brand book they delivered became our daily reference.",
          rate: 5,
        },
        {
          name: "Faisal Al-Dosari",
          company: "Co-founder — Mirqat",
          text: "Strategy before design was the turning point. For the first time we know exactly what we're saying and to whom.",
          rate: 5,
        },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Answers to what matters",
      sub: "Can't find your question? Message us directly on WhatsApp.",
      items: [
        {
          q: "How long does a brand identity project take?",
          a: "A full identity usually takes 3–6 weeks depending on scope and the number of applications. A standalone logo project ranges between 7 and 14 working days. We agree on a clear timeline before we start.",
        },
        {
          q: "What does the brand book include?",
          a: "The logo in all formats and sizes, colour system, typography, grids, icons, patterns, application examples, correct/incorrect usage rules, plus all editable source files.",
        },
        {
          q: "How many revision rounds are included?",
          a: "Three structured review rounds are included in the core package — and we rarely need them all, because the strategy phase settles most decisions early.",
        },
        {
          q: "Do you work with startups?",
          a: "Yes. We have a dedicated startup track focused on launch essentials, with the option to scale later into a complete identity system.",
        },
        {
          q: "How does payment work?",
          a: "50% upfront to kick off, 50% on final delivery. For larger engagements we split payments across project milestones.",
        },
        {
          q: "Do I fully own the designs?",
          a: "Absolutely. On final delivery, full intellectual property of the approved designs transfers to you along with all source files.",
        },
      ],
    },
    cta: {
      title: "Ready to build a brand that leaves a mark?",
      sub: "Tell us about your idea and we'll come back with a clear plan within 24 hours.",
      btn: "Start your project now",
    },
    contact: {
      kicker: "Contact",
      title: "Let's talk about your brand",
      sub: "Fill in the form and you'll be redirected straight to WhatsApp with a ready-made message containing your project details.",
      fields: {
        name: "Full name",
        email: "Email address",
        phone: "Phone number",
        company: "Company name",
        service: "Service type",
        details: "Project details",
        budget: "Budget",
      },
      placeholders: {
        name: "Your full name",
        email: "name@company.com",
        phone: "+966 5X XXX XXXX",
        company: "Your company or project",
        details: "Tell us about your project, your audience and the goal you're after…",
      },
      budgets: [
        "Under SAR 5,000",
        "SAR 5,000 – 15,000",
        "SAR 15,000 – 30,000",
        "SAR 30,000 – 60,000",
        "SAR 60,000+",
      ],
      submit: "Send Request",
      sending: "Opening WhatsApp…",
      note: "Clicking the button opens your email app with a message pre-filled with your project details.",
      info: [
        { t: "WhatsApp", v: "+966 53 959 5432" },
        { t: "Email", v: "hello@yourmark.studio" },
        { t: "Location", v: "Riyadh, Saudi Arabia" },
        { t: "Hours", v: "Sun – Thu · 9am – 6pm" },
      ],
      required: "Please fill in at least your name and the service type.",
      msgTitle: "New project request",
    },
    footer: {
      tagline: "Your brand deserves a mark that matters.",
      pages: "Pages",
      services: "Services",
      social: "Social",
      rights: "All rights reserved.",
      top: "Back to top",
      built: "Designed & built with obsessive care",
    },
  },
};
