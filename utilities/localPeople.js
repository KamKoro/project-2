const LOCAL_DIRECTORS = [
  {
    id: 'francis-ford-coppola',
    name: 'Francis Ford Coppola',
    bio: 'New Hollywood auteur behind The Godfather trilogy and Apocalypse Now.',
  },
  {
    id: 'frank-darabont',
    name: 'Frank Darabont',
    bio: 'Writer-director known for Stephen King adaptations and The Shawshank Redemption.',
  },
  {
    id: 'robert-zemeckis',
    name: 'Robert Zemeckis',
    bio: 'Director of Forrest Gump, Back to the Future, and Who Framed Roger Rabbit.',
  },
  {
    id: 'm-night-shyamalan',
    name: 'M. Night Shyamalan',
    bio: 'Filmmaker known for twist-driven thrillers including The Sixth Sense and Unbreakable.',
  },
  {
    id: 'denis-villeneuve',
    name: 'Denis Villeneuve',
    bio: 'Acclaimed director of Arrival, Blade Runner 2049, and the Dune films.',
  },
  {
    id: 'robert-eggers',
    name: 'Robert Eggers',
    bio: 'Director of The Witch, The Lighthouse, and Nosferatu.',
  },
  {
    id: 'gabriela-cowperthwaite',
    name: 'Gabriela Cowperthwaite',
    bio: 'Documentary filmmaker behind Blackfish.',
  },
  {
    id: 'werner-herzog',
    name: 'Werner Herzog',
    bio: 'Legendary German director of Fitzcarraldo, Grizzly Man, and many documentaries.',
  },
  {
    id: 'christopher-nolan',
    name: 'Christopher Nolan',
    bio: 'Blockbuster filmmaker behind Inception, Interstellar, and The Dark Knight trilogy.',
  },
  {
    id: 'bong-joon-ho',
    name: 'Bong Joon-ho',
    bio: 'South Korean director of Parasite, Memories of Murder, and Snowpiercer.',
  },
  {
    id: 'daniels',
    name: 'Daniel Kwan, Daniel Scheinert',
    bio: 'Directing duo known as Daniels, creators of Everything Everywhere All at Once.',
  },
];

const LOCAL_ACTORS = [
  {
    id: 'marlon-brando',
    name: 'Marlon Brando',
    bio: 'Iconic actor of A Streetcar Named Desire and The Godfather.',
  },
  {
    id: 'al-pacino',
    name: 'Al Pacino',
    bio: 'Legendary star of The Godfather, Scarface, and Scent of a Woman.',
  },
  {
    id: 'tim-robbins',
    name: 'Tim Robbins',
    bio: 'Actor and filmmaker known for The Shawshank Redemption and Mystic River.',
  },
  {
    id: 'morgan-freeman',
    name: 'Morgan Freeman',
    bio: 'Acclaimed actor with roles in The Shawshank Redemption, Se7en, and Million Dollar Baby.',
  },
  {
    id: 'tom-hanks',
    name: 'Tom Hanks',
    bio: 'Two-time Oscar winner known for Forrest Gump, Cast Away, and Saving Private Ryan.',
  },
  {
    id: 'haley-joel-osment',
    name: 'Haley Joel Osment',
    bio: 'Actor who rose to fame in The Sixth Sense and A.I. Artificial Intelligence.',
  },
  {
    id: 'ryan-gosling',
    name: 'Ryan Gosling',
    bio: 'Star of Drive, La La Land, and Blade Runner 2049.',
  },
  {
    id: 'harrison-ford',
    name: 'Harrison Ford',
    bio: 'Star of Indiana Jones, Star Wars, and Blade Runner.',
  },
  {
    id: 'timothee-chalamet',
    name: 'Timothée Chalamet',
    bio: 'Leading actor of Dune, Call Me by Your Name, and Wonka.',
  },
  {
    id: 'zendaya',
    name: 'Zendaya',
    bio: 'Actor known for Euphoria, Spider-Man, and Dune.',
  },
  {
    id: 'lily-rose-depp',
    name: 'Lily-Rose Depp',
    bio: 'Actor who starred in Nosferatu and The Idol.',
  },
  {
    id: 'leonardo-dicaprio',
    name: 'Leonardo DiCaprio',
    bio: 'Oscar-winning star of Titanic, Inception, and The Revenant.',
  },
  {
    id: 'michelle-yeoh',
    name: 'Michelle Yeoh',
    bio: 'Oscar-winning actor of Everything Everywhere All at Once and Crouching Tiger, Hidden Dragon.',
  },
  {
    id: 'christian-bale',
    name: 'Christian Bale',
    bio: 'Actor known for The Dark Knight trilogy, American Psycho, and The Fighter.',
  },
  {
    id: 'heath-ledger',
    name: 'Heath Ledger',
    bio: 'Oscar-winning actor remembered for Brokeback Mountain and The Dark Knight.',
  },
];

function getLocalDirectors() {
  return LOCAL_DIRECTORS;
}

function getLocalActors() {
  return LOCAL_ACTORS;
}

function getLocalDirector(id) {
  return LOCAL_DIRECTORS.find((person) => person.id === id) || null;
}

function getLocalActor(id) {
  return LOCAL_ACTORS.find((person) => person.id === id) || null;
}

function searchLocalDirectors(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return LOCAL_DIRECTORS;

  return LOCAL_DIRECTORS.filter((person) => (
    person.name.toLowerCase().includes(q)
    || person.bio.toLowerCase().includes(q)
  ));
}

function searchLocalActors(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return LOCAL_ACTORS;

  return LOCAL_ACTORS.filter((person) => (
    person.name.toLowerCase().includes(q)
    || person.bio.toLowerCase().includes(q)
  ));
}

module.exports = {
  LOCAL_DIRECTORS,
  LOCAL_ACTORS,
  getLocalDirectors,
  getLocalActors,
  getLocalDirector,
  getLocalActor,
  searchLocalDirectors,
  searchLocalActors,
};
