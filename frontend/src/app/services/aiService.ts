import { api } from "./apiClient";

export interface AIRecommendation {
  title: string;
  author: string;
  reason?: string;
}

export interface RecommendationParams {
  genre?: string;
  mood?: string;
  query?: string;
}

export interface RecommendationsResponse {
  recommendations: AIRecommendation[];
}

// Curated fallbacks by genre/mood if backend is unreachable or returns empty
const CURATED_RECOMMENDATIONS: Record<string, AIRecommendation[]> = {
  fiction: [
    { title: "Tomorrow, and Tomorrow, and Tomorrow", author: "Gabrielle Zevin", reason: "A rich, vibrant novel about identity, creativity, love, and video game design." },
    { title: "Klara and the Sun", author: "Kazuo Ishiguro", reason: "A quiet, profound look at connection, love, and what it means to be human." },
    { title: "The Midnight Library", author: "Matt Haig", reason: "An uplifting, thought-provoking journey exploring infinite life choices." },
  ],
  fantasy: [
    { title: "The Name of the Wind", author: "Patrick Rothfuss", reason: "Lyrical storytelling following the legendary life of Kvothe." },
    { title: "Piranesi", author: "Susanna Clarke", reason: "An ethereal, atmospheric mystery set in an infinite labyrinth of halls and tides." },
    { title: "The Priory of the Orange Tree", author: "Samantha Shannon", reason: "An epic, sprawling high fantasy filled with dragons and court intrigue." },
  ],
  "science fiction": [
    { title: "Project Hail Mary", author: "Andy Weir", reason: "A thrilling, humorous, science-packed survival mission across space." },
    { title: "Dark Matter", author: "Blake Crouch", reason: "A relentless, mind-bending sci-fi thriller about alternate realities and choices." },
    { title: "Children of Time", author: "Adrian Tchaikovsky", reason: "An imaginative, grand-scale story of evolution, space colonization, and first contact." },
  ],
  mystery: [
    { title: "The Thursday Murder Club", author: "Richard Osman", reason: "Charming, witty mystery featuring four sharp retirees investigating unsolved crimes." },
    { title: "The Silent Patient", author: "Alex Michaelides", reason: "A gripping psychological puzzle that will keep you guessing until the final twist." },
    { title: "The Maid", author: "Nita Prose", reason: "A warm, heartwarming whodunit with an unforgettable and endearing protagonist." },
  ],
  thriller: [
    { title: "Verity", author: "Colleen Hoover", reason: "A dark, intense romantic thriller packed with disturbing revelations." },
    { title: "Gone Girl", author: "Gillian Flynn", reason: "The quintessential psychological thriller about marriage, deceit, and media frenzy." },
    { title: "None of This Is True", author: "Lisa Jewell", reason: "A chilling, twisty story of a podcaster who befriends her mysterious birthday twin." },
  ],
  romance: [
    { title: "Book Lovers", author: "Emily Henry", reason: "A witty, delightful enemies-to-lovers romance that plays playfully on bookish tropes." },
    { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", reason: "A captivating, glamorous tale of old Hollywood, secret love, and ambition." },
    { title: "Red, White & Royal Blue", author: "Casey McQuiston", reason: "A spirited, heartfelt romantic comedy full of humor and warmth." },
  ],
};

function getLocalFallbacks(params: RecommendationParams): AIRecommendation[] {
  const g = (params.genre || "").toLowerCase();
  const matchedKey = Object.keys(CURATED_RECOMMENDATIONS).find((k) => g.includes(k));

  if (matchedKey && CURATED_RECOMMENDATIONS[matchedKey]) {
    return CURATED_RECOMMENDATIONS[matchedKey];
  }

  // General fallback
  return [
    {
      title: "Tomorrow, and Tomorrow, and Tomorrow",
      author: "Gabrielle Zevin",
      reason: "An engrossing, heartfelt story about friendship, art, and building worlds together.",
    },
    {
      title: "Project Hail Mary",
      author: "Andy Weir",
      reason: "An exhilarating, accessible adventure of science, companionship, and resilience.",
    },
    {
      title: "Piranesi",
      author: "Susanna Clarke",
      reason: "A poetic, deeply atmospheric exploration of wonder and mystery.",
    },
  ];
}

export async function getRecommendations(
  params: RecommendationParams
): Promise<RecommendationsResponse> {
  try {
    const res = await api.post<RecommendationsResponse>("/ai/recommendations", params);
    if (res && Array.isArray(res.recommendations) && res.recommendations.length > 0) {
      return res;
    }
  } catch {
    // Backend endpoint may not be implemented or reached; proceed to fallback
  }

  // Graceful fallback to guarantee discovery always works
  return {
    recommendations: getLocalFallbacks(params),
  };
}
