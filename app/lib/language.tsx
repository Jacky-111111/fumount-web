import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type FumountLanguage = 'en' | 'zh';

const STORAGE_KEY = 'fumount-lang';

export const languageCopy = {
  en: {
    languageButton: 'US',
    languageButtonLabel: 'Switch to Chinese',
    languageOption: '中文',
    announcement: 'Welcome to Fúmount',
    navAria: 'Primary',
    nav: [
      'Collections',
      'Gift sets',
      'For him',
      'For her',
      'Best sellers',
      'Blog',
      'Who we are',
      'Contact',
    ],
    collectionListAria: 'Collections list',
    collectionItems: ['Series 1', 'Series 2', 'Series 3', 'Series 4'],
    searchAria: 'Search',
    accountAria: 'Account',
    bagAria: 'Shopping bag',
    logoAria: 'Fúmount home',
    heroAria: 'Featured campaign',
    heroKicker: 'New campaign',
    heroTitle: 'The incense collection',
    heroCta: 'Shop now',
    splitTitle: 'Harmony of Heaven, Earth & Humanity',
    splitLines: [
      'With tangible fragrance, an intangible sanctuary is formed; through the inward path of pilgrimage, the unity of Heaven, Earth, and Human is realized.',
      'A single stick of incense becomes a moving field of practice.',
      'Guided by scent, a boundary is quietly drawn wherever one stands; through the breath, awareness turns inward on a sacred journey.',
      'Between each inhale and exhale, one awakens to the "Human" in the present, rooted in the depth of "Earth," resonant with the clarity of "Heaven."',
      'Where smoke rises, there is cultivation; within a small space, Heaven, Earth, and Human return to their rightful harmony.',
    ],
    leftGalleryAria: 'Left gallery slides',
    rightGalleryAria: 'Right gallery slides',
    dotLabels: ['Image 1 of 2', 'Image 2 of 2'],
    immersiveHeading: 'Incense Journey',
    immersivePreface1:
      'Where incense rises, practice begins; in a small space, heaven, earth and humanity return to place.',
    immersivePreface2: 'Hold the world in your heart, and resonate with the universe.',
    immersivePreface3: 'Fúmount, your inward pilgrimage path',
    immersiveSteps: [
      ['Relax & Unwind', 'Morning light appears; the first incense awakens.'],
      ['Stillness', 'One wisp of smoke, and all grows quiet.'],
      ['Depth', 'Breathe deeply, and the inner scene opens.'],
      ['Sanctuary', 'A small space can become a sanctuary.'],
      ['Return', 'Heaven clears, earth settles, and the self returns to calm.'],
    ],
    productsTitle: 'Best sellers',
    productsSub: 'Find your inner peace with our exclusive incense collection.',
    badgeSale: 'PayDay Sale',
    productNames: [
      'HOOKED AZURE',
      'EXOTIC - Heritage',
      'EXOTIC Paradise',
      'HOOKED POUR HOMME',
    ],
    productNotes: [
      'A bright, mineral incense ritual.',
      'Heritage botanicals for grounded focus.',
      'A warm trail for intimate atmosphere.',
      'A composed ritual for evening clarity.',
    ],
    viewAll: 'View all',
    followShop: 'Follow on shop',
    policiesTitle: 'Policies',
    policyItems: [
      'Terms of Service',
      'Privacy Policy',
      'Shipping Policy',
      'Refund Policy',
    ],
    moreTitle: 'Find out more',
    moreItems: ['About us', 'Contact us', 'Stockists', 'Press'],
    footerCopy: 'All rights reserved',
    aboutTitle: 'Who we are',
    aboutParas: [
      'Fúmount uses incense, a tangible medium, to shape an intimate, invisible field for you in every breath.',
      'This is not about taking from the world; it is a pilgrimage that turns inward.',
      'Along the way, fragrance clears distraction and steadies the mind, until you can hear your true inner voice and glimpse the wisdom already within you.',
      'Each lighting is a deep conversation with yourself; each thread of scent is a lamp on the path of growth.',
      'Fúmount offers no instant answers, only companionship and space, so that amid life’s noise you may walk an inward path and grow in what is real.',
      'The span of one stick of incense: a quiet ground, and a meeting with who you truly are.',
      'Fúmount witnesses every inward leap you make. Practice is not on a distant mountain, it lives in each present moment. Fúmount Classics are everyday rituals within reach, helping you settle body and mind quickly and recover your own rhythm in a crowded world.',
    ],
    contactHeading: 'Contact us',
    contactPlaceholder:
      'Placeholder — email, phone, studio hours, and a contact form will appear here.',
  },
  zh: {
    languageButton: '中文',
    languageButtonLabel: '切换为英文',
    languageOption: 'English',
    announcement: '欢迎来到 Fúmount',
    navAria: '主导航',
    nav: ['系列', '礼盒', '男士', '女士', '畅销', '博客', '关于我们', '联系我们'],
    collectionListAria: '系列列表',
    collectionItems: ['系列 1', '系列 2', '系列 3', '系列 4'],
    searchAria: '搜索',
    accountAria: '账户',
    bagAria: '购物袋',
    logoAria: 'Fúmount 首页',
    heroAria: '主推活动',
    heroKicker: '全新系列',
    heroTitle: '福山集，不只是一炷香、一件物——',
    heroCta: '立即选购',
    splitTitle: '天地人香境',
    splitLines: [
      '以有形之香，缔造无形道场；借由内朝圣之路，达成天地人合一。',
      '一炷香，便是一方移动的道场。',
      '以香为引，随地结界；以息为观，向内朝圣。',
      '在呼吸之间，觉知「人」在当下，承接「地」之厚重，感应「天」之清远。',
      '烟火起处，即是修行；方寸之间，天地人归位。',
    ],
    leftGalleryAria: '左侧画廊轮播',
    rightGalleryAria: '右侧画廊轮播',
    dotLabels: ['第 1 张 / 共 2 张', '第 2 张 / 共 2 张'],
    immersiveHeading: '香境行旅',
    immersivePreface1: '烟火起处，即是修行；方寸之间，天地人归位。',
    immersivePreface2: '心系天下，与宇宙同频。',
    immersivePreface3: '福山，您的内在朝圣之路',
    immersiveSteps: [
      ['松弛安住', '晨光初透，香起无声。'],
      ['静定', '一缕烟，万象寂。'],
      ['深境', '息愈盛，境自开。'],
      ['心域', '方寸之地，即是道场。'],
      ['归返', '天清地宁，人归于静。'],
    ],
    productsTitle: '畅销精选',
    productsSub: '以福山香境系列，寻回您内在的平和与专注。',
    badgeSale: '限时优惠',
    productNames: ['钩蓝之韵', '异域·传承', '异域·乐园', '钩蓝·男士'],
    productNotes: [
      '明亮矿物香气，适合澄明日常仪式。',
      '以草木传承安定心神，回到专注。',
      '温润香气轨迹，营造亲密而安稳的氛围。',
      '沉着的夜间香境，帮助思绪回归清明。',
    ],
    viewAll: '查看全部',
    followShop: '关注店铺',
    policiesTitle: '政策说明',
    policyItems: ['服务条款', '隐私政策', '配送政策', '退款政策'],
    moreTitle: '了解更多',
    moreItems: ['关于我们', '联系我们', '门店信息', '媒体资料'],
    footerCopy: '保留所有权利',
    aboutTitle: '关于我们',
    aboutParas: [
      '福山集，以香这一有形之物为媒介，在呼吸吐纳间，为您缔造一个专属的无形场域。',
      '这并非向外索取，而是一场向内走的朝圣之路。',
      '在这条路上，香气扫除杂念，安定心神，让您听见内在真实的声音，照见本心的智慧。',
      '每一次点燃，都是一次与自我的深度对话；每一缕芬芳，都是成长路上的明灯。',
      '福山集，不提供速成的答案，只提供陪伴与空间，助您在纷扰世界中，走朝圣路，向内求，得真成长。',
      '一炷香的时间，一方静土，一场与真我的相遇。',
      '福山集，见证您的每一次内在跃升。修行不在远山，而在每一个当下。福山经典，是您触手可及的日常仪式，帮助您在纷繁世界中，快速安顿身心，找回自己的节奏。',
    ],
    contactHeading: '联系我们',
    contactPlaceholder: '占位说明 — 此处将补充邮箱、电话、开放时间以及留言表单等联系方式。',
  },
} as const;

type LanguageCopy = (typeof languageCopy)[FumountLanguage];

type LanguageContextValue = {
  language: FumountLanguage;
  setLanguage: (language: FumountLanguage) => void;
  toggleLanguage: () => void;
  t: LanguageCopy;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({children}: {children: ReactNode}) {
  const [language, setLanguageState] = useState<FumountLanguage>('en');

  useEffect(() => {
    try {
      const cached = window.localStorage.getItem(STORAGE_KEY);
      if (cached === 'en' || cached === 'zh') {
        setLanguageState(cached);
      }
    } catch {
      // localStorage can be unavailable in private or restricted browser contexts.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    const setLanguage = (nextLanguage: FumountLanguage) => {
      setLanguageState(nextLanguage);
      persistLanguage(nextLanguage);
    };

    return {
      language,
      setLanguage,
      toggleLanguage: () => {
        setLanguageState((current) => {
          const nextLanguage = current === 'en' ? 'zh' : 'en';
          persistLanguage(nextLanguage);
          return nextLanguage;
        });
      },
      t: languageCopy[language],
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

function persistLanguage(language: FumountLanguage) {
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Ignore storage write failures; language still updates for this session.
  }
}
