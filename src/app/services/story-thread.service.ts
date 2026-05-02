import { Injectable } from '@angular/core';

export interface StoryThread {
  id: string;
  fromMovieId: string;
  toMovieId: string;
  label: string;
  type: 'direct_sequel' | 'cause_effect' | 'character_arc' | 'infinity_stone';
}

const STORY_THREADS: StoryThread[] = [
  { id: 't1', fromMovieId: 'iron-man-2008', toMovieId: 'iron-man-2-2010', label: 'Tony\'s Arc Reactor legacy', type: 'direct_sequel' },
  { id: 't2', fromMovieId: 'avengers-2012', toMovieId: 'iron-man-3-2013', label: 'Tony\'s PTSD after New York', type: 'cause_effect' },
  { id: 't3', fromMovieId: 'thor-2011', toMovieId: 'thor-dark-world-2013', label: 'Asgardian politics continue', type: 'direct_sequel' },
  { id: 't4', fromMovieId: 'captain-america-winter-soldier-2014', toMovieId: 'avengers-age-of-ultron-2015', label: 'HYDRA infiltration revealed', type: 'cause_effect' },
  { id: 't5', fromMovieId: 'avengers-age-of-ultron-2015', toMovieId: 'captain-america-civil-war-2016', label: 'Sokovia Accords aftermath', type: 'cause_effect' },
  { id: 't6', fromMovieId: 'ant-man-2015', toMovieId: 'captain-america-civil-war-2016', label: 'Scott Lang joins the fight', type: 'character_arc' },
  { id: 't7', fromMovieId: 'captain-america-civil-war-2016', toMovieId: 'avengers-infinity-war-2018', label: 'Avengers fractured before Thanos', type: 'cause_effect' },
  { id: 't8', fromMovieId: 'doctor-strange-2016', toMovieId: 'avengers-infinity-war-2018', label: 'Strange guards the Time Stone', type: 'infinity_stone' },
  { id: 't9', fromMovieId: 'black-panther-2018', toMovieId: 'avengers-infinity-war-2018', label: 'Wakanda opens its borders', type: 'cause_effect' },
  { id: 't10', fromMovieId: 'avengers-endgame-2019', toMovieId: 'spider-man-far-from-home-2019', label: 'Peter Parker mourns Tony', type: 'character_arc' },
  { id: 't11', fromMovieId: 'spider-man-far-from-home-2019', toMovieId: 'spider-man-no-way-home-2021', label: 'Peter\'s identity revealed', type: 'direct_sequel' },
  { id: 't12', fromMovieId: 'avengers-endgame-2019', toMovieId: 'black-widow-2021', label: 'Natasha\'s past explored', type: 'character_arc' },
  { id: 't13', fromMovieId: 'spider-man-no-way-home-2021', toMovieId: 'doctor-strange-multiverse-of-madness-2022', label: 'Multiverse cracks open', type: 'cause_effect' },
  { id: 't14', fromMovieId: 'ant-man-quantumania-2023', toMovieId: 'deadpool-and-wolverine-2024', label: 'Kang Variants threaten reality', type: 'cause_effect' },
  { id: 't15', fromMovieId: 'black-widow-2021', toMovieId: 'thunderbolts-2025', label: 'Yelena joins government ops', type: 'character_arc' },
];

@Injectable({ providedIn: 'root' })
export class StoryThreadService {
  getThreadsForTransition(fromPhase: number, toPhase: number): StoryThread[] {
    const phaseMovieMap: Record<number, string[]> = {
      1: ['iron-man-2008','incredible-hulk-2008','iron-man-2-2010','thor-2011','captain-america-first-avenger-2011','avengers-2012'],
      2: ['iron-man-3-2013','thor-dark-world-2013','captain-america-winter-soldier-2014','guardians-of-the-galaxy-2014','avengers-age-of-ultron-2015','ant-man-2015'],
      3: ['captain-america-civil-war-2016','doctor-strange-2016','guardians-of-the-galaxy-vol2-2017','spider-man-homecoming-2017','thor-ragnarok-2017','black-panther-2018','avengers-infinity-war-2018','ant-man-and-the-wasp-2018','captain-marvel-2019','avengers-endgame-2019','spider-man-far-from-home-2019'],
      4: ['black-widow-2021','shang-chi-2021','eternals-2021','spider-man-no-way-home-2021','doctor-strange-multiverse-of-madness-2022','thor-love-and-thunder-2022','black-panther-wakanda-forever-2022'],
      5: ['ant-man-quantumania-2023','guardians-of-the-galaxy-vol3-2023','the-marvels-2023','deadpool-and-wolverine-2024','captain-america-brave-new-world-2025','thunderbolts-2025','fantastic-four-first-steps-2025'],
    };
    const fromMovies = phaseMovieMap[fromPhase] || [];
    const toMovies = phaseMovieMap[toPhase] || [];
    return STORY_THREADS.filter(t => fromMovies.includes(t.fromMovieId) && toMovies.includes(t.toMovieId));
  }
}
