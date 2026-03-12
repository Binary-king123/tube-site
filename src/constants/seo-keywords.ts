/**
 * Massive SEO Keyword Database for Adult Niche
 * Used for dynamic tag injection on video pages to boost Google rankings.
 */
export const SEO_KEYWORDS = [
  "best desi porn", "indian bhabhi sex", "sexy college girl", "hindu girl fucked", 
  "pakistani scandals", "mumbai call girls", "delhi sex videos", "bengali hot porn",
  "tamil sex stories", "telugu boothu kathalu", "mallu aunties hot", "kerala porn",
  "pune escort service", "bangalore sex chat", "hyderabad sex vids", "chennai hot girls",
  "punjabi kudi sex", "haryanvi dancer hot", "rajasthani bhabhi", "gujarati sex video",
  "marathi sex kathao", "bihar scandal", "up bhabhi fucked", "desi wife swapped",
  "indian housemaid sex", "neighbor girl pussy", "office colleague sex", "teacher student sex",
  "bus conductor sex", "train sex scandal", "flight attendant sex", "college hostel sex",
  "gym instructor sex", "doctor patient sex", "nurse sex videos", "police girl sex",
  "army officer sex", "yoga teacher hot", "massag girl sex", "spa girl fucked",
  "mallu mallu", "kambi kambi", "vedi vedi", "kalam kalam", "pavada pavada",
  "saree sex videos", "lehenga choli sex", "salwar kameez sex", "kurti sex",
  "jeans girl sex", "underwear sex", "bra sex", "panty sex", "condom sex",
  "creampie porn", "facial cum", "deepthroat blowjob", "anal sex indian", "double penetration",
  "threesome desi", "gangbang indian", "orgy sex", "lesbian desi girls", "bisexual sex",
  "transgender sex", "shemale sex", "gay porn desi", "mature indian aunties",
  "milf desi bhabhi", "teen indian girls", "young desi babes", "hot indian models",
  "bollywood scandals", "actress sex tape", "tiktok stars leaked", "instagram reels hot",
  "camgirl desi", "webcam sex indian", "live sex chat desi", "virtual reality sex",
  "hentai desi art", "cartoon sex indian", "comic sex desi", "story telling sex",
  "audio sex desi", "marathi sex tales", "tamil kambi", "kannada sex clips",
  "haryanvi ragni hot", "bhojpuri sex movie", "oriya sex video", "assamese sex clip",
  "nepali sex video", "sri lankan sex", "bangladeshi sex tape", "asian sex videos",
  "world wide porn", "free porn clips", "hd porn videos", "4k sex videos",
  "vr porn desi", "adult cinema indian", "erotic stories desi", "romance sex",
  "dirty talk indian", "moaning sounds sex", "orgasm videos", "clitoris play",
  "vibrator sex", "toy sex indian", "lingerie show hot", "bikini sex desi",
  "outdoor sex indian", "beach sex desi", "car sex scandal", "public sex desi",
  "washroom sex scandal", "staircase sex", "balcony sex", "roof top sex",
  "garden sex indian", "swimming pool sex", "library sex", "classroom sex",
  "examination hall sex", "interview sex scandal", "casting couch desi",
  "modeling sex", "acting sex", "theater sex", "backstage sex scandal",
  "desi girl next door", "innocent girl fucked", "wild sex desi", "rough sex indian",
  "gentle sex", "loving sex", "passionate sex", "sensual massage", "bdsm indian",
  "bondage sex", "discipline sex", "dominance submission", "foot fetish desi",
  "armpit sex", "breast feeding sex", "pregnancy sex", "period sex",
  "shaved pussy desi", "hairy pussy indian", "big boobs desi", "big ass indian",
  "long hair sex", "glasses girl sex", "tatoo girl sex", "piercing sex",
  "nerdy girl sex", "goth girl sex", "emo girl sex", "cosplay sex indian",
  "roleplay sex desi", "fetish sex indian", "kink sex desi", "dirty sex",
  "nasty sex indian", "filthy sex desi", "perverted sex", "kinky sex",
  "erotic art indian", "sex education desi", "sex health", "sex tips desi",
  "sex positions indian", "kamasutra sex", "tantra sex", "spiritual sex",
  "conscious sex", "sacred sex", "holistic sex", "healing sex", "pleasure sex",
  "ecstasy sex", "bliss sex", "joy sex", "love sex", "peace sex",
  "harmony sex", "balance sex", "flow sex", "energy sex", "vibration sex",
  "frequency sex", "light sex", "dark sex", "shadow sex", "mystery sex",
  "magic sex", "miracle sex", "wonder sex", "dream sex", "fantasy sex",
  "reality sex", "truth sex", "life sex", "death sex", "rebirth sex",
  "evolution sex", "transformation sex", "awakening sex", "enlightenment sex",
];

export const getDeterministicKeywords = (seed: string, count: number = 50) => {
  // Simple deterministic shuffle using seed
  let shuffled = [...SEO_KEYWORDS];
  let n = seed.length;
  for (let i = 0; i < shuffled.length; i++) {
    const j = (i + n + seed.charCodeAt(i % n)) % shuffled.length;
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
};
