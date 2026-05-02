export interface Phase {
  id: number;
  name: string;
  sagaName: 'Infinity Saga' | 'Multiverse Saga';
  tagline: string;
  colorVar: string;
  yearRange: string;
  totalMovies: number;
  movies: Movie[];
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  phase: number;
  synopsis: string;
  importance: 'essential' | 'recommended' | 'optional';
  keyEvents: StoryEvent[];
  charactersIntroduced: string[];
  charactersAppearing: string[];
  infinityStone?: InfinityStone;
  posterGradient: string;
  imagePath?: string;
}

export interface Character {
  id: string;
  name: string;
  alias?: string;
  side: 'hero' | 'villain' | 'neutral';
  phaseIntroduced: number;
  description: string;
  avatarColor: string;
  imagePath?: string;
  movieIds: string[];
  connections: CharacterConnection[];
}

export interface CharacterConnection {
  characterId: string;
  relationshipType: 'ally' | 'enemy' | 'mentor' | 'family' | 'rival';
  description: string;
}

export interface StoryEvent {
  id: string;
  title: string;
  description: string;
  significance: 'low' | 'medium' | 'high' | 'critical';
  charactersInvolved: string[];
}

export interface InfinityStone {
  name: string;
  color: string;
  location: string;
}

export interface PhaseComingSoon {
  id: number;
  name: string;
  status: 'upcoming';
  tagline: string;
  movies: ComingSoonMovie[];
}

export interface ComingSoonMovie {
  title: string;
  year: number;
  status: 'filming' | 'announced' | 'released';
}
