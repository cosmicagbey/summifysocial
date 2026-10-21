import fs from 'fs';
import path from 'path';
import { Post, FollowedCreator } from '@/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'summify_db.json');

interface DatabaseSchema {
  creators: FollowedCreator[];
  posts: Post[];
}

const DEFAULT_CREATORS: FollowedCreator[] = [
  {
    id: 'creator-x-mkbhd',
    name: 'Marques Brownlee',
    handle: '@MKBHD',
    platform: 'twitter',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    category: 'tech',
    active: true,
  },
  {
    id: 'creator-fb-nasa',
    name: 'NASA - National Aeronautics and Space Admin',
    handle: '@NASA',
    platform: 'facebook',
    avatarUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150&auto=format&fit=crop&q=80',
    category: 'science',
    active: true,
  },
  {
    id: 'creator-x-woj',
    name: 'Adrian Wojnarowski / Shams Charania',
    handle: '@ShamsCharania',
    platform: 'twitter',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    category: 'sports',
    active: true,
  },
  {
    id: 'creator-tt-hankgreen',
    name: 'Hank Green',
    handle: '@hankgreen1',
    platform: 'tiktok',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    category: 'science',
    active: true,
  },
  {
    id: 'creator-yt-veritasium',
    name: 'Veritasium',
    handle: '@veritasium',
    platform: 'youtube',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    category: 'science',
    active: true,
  },
  {
    id: 'creator-x-varietymag',
    name: 'Variety Magazine',
    handle: '@Variety',
    platform: 'twitter',
    avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80',
    category: 'entertainment',
    active: true,
  },
  {
    id: 'creator-fb-bloomberg',
    name: 'Bloomberg Business',
    handle: '@Bloomberg',
    platform: 'facebook',
    avatarUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=150&auto=format&fit=crop&q=80',
    category: 'business',
    active: true,
  },
  {
    id: 'creator-reddit-tech',
    name: 'r/Technology & Computing',
    handle: 'r/technology',
    platform: 'reddit',
    avatarUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80',
    category: 'tech',
    active: true,
  }
];

const INITIAL_POSTS: Post[] = [
  {
    id: 'post-101',
    platform: 'twitter',
    author: {
      name: 'Marques Brownlee',
      handle: '@MKBHD',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      verified: true,
      followers: '6.4M'
    },
    category: 'tech',
    originalContent: 'Rumors are swirling that Apple is completely ditching physical buttons on the upcoming iPhone 17 Pro in favor of solid-state haptic sensors. Supply chain analysts in Taiwan are reporting supplier orders have already shifted.',
    summary: 'Apple is reportedly transitioning to solid-state capacitive haptic buttons for the iPhone 17 Pro line, replacing all mechanical volume and action buttons based on recent Taiwanese supply chain reports.',
    keyTakeaways: [
      'Supply chain orders in Taiwan indicate solid-state touch sensors replacing mechanical toggles.',
      'Aims to improve water resistance and interior chassis space for larger batteries.',
      'Similar haptic technology to the Mac trackpad and iPhone SE home button.'
    ],
    mediaUrls: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1000&auto=format&fit=crop&q=80'
    ],
    originalUrl: 'https://x.com/MKBHD/status/1789201948',
    publishedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    factCheck: {
      accuracyScore: 88,
      status: 'verified',
      verdict: 'Substantially Corroborated by Supply Chain Reports',
      extractedClaim: 'Apple is replacing mechanical buttons with solid-state haptic sensors on iPhone 17 Pro based on Taiwan supplier shifts.',
      analysis: 'Ming-Chi Kuo and Bloomberg tech desk confirm Cirrus Logic supplier documentation indicates high-volume tactile IC orders. However, final production tooling is subject to pre-PVT yields.',
      evidence: [
        {
          sourceName: 'Bloomberg Technology',
          sourceDomain: 'bloomberg.com',
          url: 'https://bloomberg.com/news/articles/apple-supply-chain-sensors',
          title: 'Apple Supplier Cirrus Logic Signals Solid-State Button Transition for Flagship Devices',
          snippet: 'Key component manufacturers in Taipei reported elevated purchase commitments for specialized Taptic feedback controllers.',
          stance: 'corroborates',
          reliabilityScore: 94
        },
        {
          sourceName: 'Reuters Tech',
          sourceDomain: 'reuters.com',
          url: 'https://reuters.com/technology/apple-hardware-cycle-preview',
          title: 'Analysis: How Solid-State Components Impact Consumer Smartphone Longevity',
          snippet: 'Mechanical failure accounts for 14% of mid-life smartphone repairs; capacitive touch surfaces mitigate ingress points.',
          stance: 'corroborates',
          reliabilityScore: 92
        }
      ],
      verifiedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    },
    engagement: {
      likes: 18400,
      shares: 3200,
      comments: 940
    }
  },
  {
    id: 'post-102',
    platform: 'facebook',
    author: {
      name: 'NASA - National Aeronautics and Space Admin',
      handle: '@NASA',
      avatarUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150&auto=format&fit=crop&q=80',
      verified: true,
      followers: '28M'
    },
    category: 'science',
    originalContent: 'The James Webb Space Telescope has detected anomalous water vapor signals in the habitable zone of exoplanet K2-18b, alongside carbon-bearing molecules methane and carbon dioxide with potential dimethyl sulfide (DMS) traces.',
    summary: 'NASA\'s James Webb Space Telescope identified strong atmospheric signatures of methane, CO2, and potential dimethyl sulfide on exoplanet K2-18b, an ocean-covered "Hycean" world in its star\'s habitable zone.',
    keyTakeaways: [
      'Atmospheric spectra confirm abundant methane and CO2 with lack of ammonia, characteristic of an ocean under a hydrogen-rich atmosphere.',
      'Preliminary weak detection of dimethyl sulfide (DMS) - on Earth, DMS is predominantly produced by marine phytoplankton.',
      'Further deep-space spectroscopic observations required to confirm biological origin.'
    ],
    mediaUrls: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80'
    ],
    originalUrl: 'https://facebook.com/NASA/posts/8492048201',
    publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    factCheck: {
      accuracyScore: 96,
      status: 'verified',
      verdict: 'Confirmed by Peer-Reviewed Astrophysical Studies',
      extractedClaim: 'JWST detected methane, carbon dioxide, and tentative signs of dimethyl sulfide in the habitable zone atmosphere of K2-18b.',
      analysis: 'Published in The Astrophysical Journal Letters. Spectroscopic data from NIRISS and NIRSpec confirm carbon molecules with 3-sigma confidence; DMS signal remains tentative pending additional transit cycles.',
      evidence: [
        {
          sourceName: 'The Astrophysical Journal',
          sourceDomain: 'iopscience.iop.org',
          url: 'https://iopscience.iop.org/article/10.3847/2041-8213/acf577',
          title: 'Carbon-bearing Molecules in a Possible Hycean Atmosphere on K2-18 b',
          snippet: 'Spectroscopic absorption features reveal a water-depleted, methane-dominated atmosphere with tentative indications of dimethyl sulfide.',
          stance: 'corroborates',
          reliabilityScore: 99
        },
        {
          sourceName: 'Nature Astronomy',
          sourceDomain: 'nature.com',
          url: 'https://nature.com/articles/d41586-023-02888-2',
          title: 'Webb finds hints of a possible bio-signature on a distant planet',
          snippet: 'Independent astrophysicists praise the data quality while cautioning that DMS detection requires rigorous verification before biosignature conclusions.',
          stance: 'corroborates',
          reliabilityScore: 96
        }
      ],
      verifiedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString()
    },
    engagement: {
      likes: 45200,
      shares: 12100,
      comments: 2300
    }
  },
  {
    id: 'post-103',
    platform: 'tiktok',
    author: {
      name: 'Viral Tech Daily',
      handle: '@viraltechdaily',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      verified: false,
      followers: '850K'
    },
    category: 'tech',
    originalContent: 'BREAKING: Scientists have reportedly created an unlimited wireless power beam that can recharge every smartphone in a 50-mile radius without any chargers! Big battery companies are trying to ban it!',
    summary: 'A viral video claims researchers have developed a free wireless power beam recharging phones up to 50 miles away and that corporations are suppressing the tech.',
    keyTakeaways: [
      'Claims 50-mile radius ambient phone charging without receivers.',
      'Alleges corporate conspiracy suppressing the invention.',
      'Flouts basic electromagnetic radiation safety limits (inverse-square law).'
    ],
    mediaUrls: [
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1000&auto=format&fit=crop&q=80'
    ],
    originalUrl: 'https://tiktok.com/@viraltechdaily/video/72891049281',
    publishedAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    factCheck: {
      accuracyScore: 8,
      status: 'disputed',
      verdict: 'Fabricated & Scientifically False',
      extractedClaim: 'Unlimited wireless power beam recharges all smartphones in 50-mile radius and is being suppressed by battery companies.',
      analysis: 'Completely ungrounded claim. Under the physical inverse-square law of electromagnetism, transmitting wattage sufficient to charge devices at a 50-mile distance would deliver lethal thermal radiation to any organism in the path. No scientific institution or patent filing exists for such a claim.',
      evidence: [
        {
          sourceName: 'IEEE Spectrum',
          sourceDomain: 'spectrum.ieee.org',
          url: 'https://spectrum.ieee.org/wireless-power-transmission-limits',
          title: 'Physics and Safety Boundaries in Far-Field Radio Frequency Power Harvesting',
          snippet: 'Ambient RF energy harvesting is restricted by FCC radiation limits to micro-watts within meters, rendering long-range bulk charging physically impossible without directional military laser beams.',
          stance: 'refutes',
          reliabilityScore: 98
        },
        {
          sourceName: 'Snopes Fact Check',
          sourceDomain: 'snopes.com',
          url: 'https://snopes.com/fact-check/50-mile-wireless-charger-hoax',
          title: 'Viral TikTok Claiming 50-Mile Free Wireless Energy Is an Outright Hoax',
          snippet: 'The circulating footage re-purposes an unrelated 2018 DARPA radar test video with synthetic voiceover.',
          stance: 'refutes',
          reliabilityScore: 95
        }
      ],
      verifiedAt: new Date(Date.now() - 1000 * 60 * 70).toISOString()
    },
    engagement: {
      likes: 67300,
      shares: 19400,
      comments: 4800
    }
  },
  {
    id: 'post-104',
    platform: 'twitter',
    author: {
      name: 'Shams Charania',
      handle: '@ShamsCharania',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      verified: true,
      followers: '2.1M'
    },
    category: 'sports',
    originalContent: 'NBA and FIBA are exploring an official 4-team global Champions Showcase tournament to take place in Paris during the 2027 All-Star break, featuring EuroLeague and NBA champions.',
    summary: 'The NBA and FIBA are in active discussions to launch a 4-team mid-season international club tournament in Paris by 2027 pitting NBA titleholders against EuroLeague champions.',
    keyTakeaways: [
      'Historic 4-team tournament proposal uniting NBA and top European basketball clubs.',
      'Targeted for Paris in February 2027 around global All-Star scheduling.',
      'Endorsed by FIBA leadership to expand global cross-league competitiveness.'
    ],
    mediaUrls: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1000&auto=format&fit=crop&q=80'
    ],
    originalUrl: 'https://x.com/ShamsCharania/status/1789209931',
    publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    factCheck: {
      accuracyScore: 91,
      status: 'verified',
      verdict: 'Corroborated by League Executives & FIBA Statements',
      extractedClaim: 'NBA and FIBA are planning a 4-team global champions tournament in Paris in 2027.',
      analysis: 'Both Adam Silver and FIBA Secretary General Andreas Zagklis confirmed exploratory working committees at the recent Paris Games press briefing.',
      evidence: [
        {
          sourceName: 'ESPN Sports',
          sourceDomain: 'espn.com',
          url: 'https://espn.com/nba/story/_/id/fiba-nba-global-club-tourney',
          title: 'NBA, FIBA Advance Working Group on Midseason Intercontinental Showdown',
          snippet: 'Senior league officials confirmed exploratory discussions regarding an expanded format featuring top EuroLeague finalists and NBA contenders.',
          stance: 'corroborates',
          reliabilityScore: 93
        },
        {
          sourceName: 'L\'Équipe',
          sourceDomain: 'lequipe.fr',
          url: 'https://lequipe.fr/Basket/Actualites/Un-tournoi-nba-fiba-a-paris-en-2027/1460021',
          title: 'Paris Arena Accordée pour des pourparlers NBA/EuroLeague',
          snippet: 'French sports ministry confirmed early calendar consultations for 2027 dates.',
          stance: 'corroborates',
          reliabilityScore: 90
        }
      ],
      verifiedAt: new Date(Date.now() - 1000 * 60 * 115).toISOString()
    },
    engagement: {
      likes: 24500,
      shares: 5100,
      comments: 1120
    }
  },
  {
    id: 'post-105',
    platform: 'facebook',
    author: {
      name: 'Bloomberg Business',
      handle: '@Bloomberg',
      avatarUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=150&auto=format&fit=crop&q=80',
      verified: true,
      followers: '14.2M'
    },
    category: 'business',
    originalContent: 'TSMC has accelerated mass production of 2-nanometer gate-all-around (GAA) semiconductor nodes at its Hsinchu plant, with trial yields exceeding initial projections by 15%.',
    summary: 'Taiwan Semiconductor Manufacturing Co. (TSMC) has accelerated 2nm GAA wafer production at its Baoshan fab after initial risk production yields exceeded benchmarks.',
    keyTakeaways: [
      '2nm GAA nanosheet architecture yields 15% above early internal forecasts.',
      'Trial silicon samples dispatched to flagship customers Apple and NVIDIA.',
      'Commercial volume production slated to lead 2025-2026 hardware cycles.'
    ],
    mediaUrls: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80'
    ],
    originalUrl: 'https://facebook.com/Bloomberg/posts/991029381',
    publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    factCheck: {
      accuracyScore: 94,
      status: 'verified',
      verdict: 'Verified via Corporate Quarterly Disclosures & Financial Filings',
      extractedClaim: 'TSMC accelerated 2nm GAA node mass production with test yields exceeding internal projections by 15%.',
      analysis: 'TSMC CEO C.C. Wei confirmed during the latest earnings conference call that 2nm development is ahead of schedule with GAA nanosheet performance meeting targets.',
      evidence: [
        {
          sourceName: 'Financial Times',
          sourceDomain: 'ft.com',
          url: 'https://ft.com/content/tsmc-2nm-chip-production-advances',
          title: 'TSMC Steals March in Nanosheet Race with Strong 2nm Yields',
          snippet: 'Analysts note Taiwanese foundries are maintaining a 6-to-9 month node cadence lead over Intel and Samsung.',
          stance: 'corroborates',
          reliabilityScore: 96
        },
        {
          sourceName: 'Nikkei Asia',
          sourceDomain: 'asia.nikkei.com',
          url: 'https://asia.nikkei.com/Business/Tech/TSMC-2nm-yield-exceeds-estimates',
          title: 'Supply Chain Brief: Hsinchu Fab 20 Begins Tool Installation',
          snippet: 'Extreme ultraviolet lithography tools installed ahead of schedule for high volume packaging.',
          stance: 'corroborates',
          reliabilityScore: 92
        }
      ],
      verifiedAt: new Date(Date.now() - 1000 * 60 * 175).toISOString()
    },
    engagement: {
      likes: 12900,
      shares: 2800,
      comments: 420
    }
  }
];

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

export function loadData(): DatabaseSchema {
  try {
    ensureDirectoryExistence(DATA_FILE);
    if (!fs.existsSync(DATA_FILE)) {
      const initial: DatabaseSchema = {
        creators: DEFAULT_CREATORS,
        posts: INITIAL_POSTS,
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return {
      creators: parsed.creators || DEFAULT_CREATORS,
      posts: parsed.posts || INITIAL_POSTS,
    };
  } catch (err) {
    console.error('Error loading data store, using fallback:', err);
    return {
      creators: DEFAULT_CREATORS,
      posts: INITIAL_POSTS,
    };
  }
}

export function saveData(data: DatabaseSchema): void {
  try {
    ensureDirectoryExistence(DATA_FILE);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving data store:', err);
  }
}

export function getPosts(): Post[] {
  const db = loadData();
  return db.posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function addPost(post: Post): Post {
  const db = loadData();
  db.posts.unshift(post);
  // Keep up to 100 latest posts
  if (db.posts.length > 100) {
    db.posts = db.posts.slice(0, 100);
  }
  saveData(db);
  return post;
}

export function getCreators(): FollowedCreator[] {
  const db = loadData();
  return db.creators;
}

export function addCreator(creator: Omit<FollowedCreator, 'id'>): FollowedCreator {
  const db = loadData();
  const newCreator: FollowedCreator = {
    ...creator,
    id: `creator-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  };
  db.creators.push(newCreator);
  saveData(db);
  return newCreator;
}

export function toggleCreator(id: string): FollowedCreator | null {
  const db = loadData();
  const creator = db.creators.find(c => c.id === id);
  if (creator) {
    creator.active = !creator.active;
    saveData(db);
    return creator;
  }
  return null;
}

export function deleteCreator(id: string): boolean {
  const db = loadData();
  const index = db.creators.findIndex(c => c.id === id);
  if (index !== -1) {
    db.creators.splice(index, 1);
    saveData(db);
    return true;
  }
  return false;
}
