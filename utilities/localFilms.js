const LOCAL_FILMS = [
  {
    id: 'the-godfather',
    title: 'The Godfather',
    releaseYear: 1972,
    director: 'Francis Ford Coppola',
    genre: 'Crime',
    overview: 'The aging patriarch of an organized crime dynasty transfers control to his reluctant son.',
    cast: [
      { name: 'Marlon Brando', character: 'Don Vito Corleone' },
      { name: 'Al Pacino', character: 'Michael Corleone' },
    ],
  },
  {
    id: 'the-godfather-part-ii',
    title: 'The Godfather Part II',
    releaseYear: 1974,
    director: 'Francis Ford Coppola',
    genre: 'Crime',
    overview: 'The early life and career of Vito Corleone in 1920s New York is portrayed, as his son Michael expands the family business.',
  },
  {
    id: 'the-shawshank-redemption',
    title: 'The Shawshank Redemption',
    releaseYear: 1994,
    director: 'Frank Darabont',
    genre: 'Drama',
    overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    cast: [
      { name: 'Tim Robbins', character: 'Andy Dufresne' },
      { name: 'Morgan Freeman', character: 'Ellis Boyd Redding' },
    ],
  },
  {
    id: 'forrest-gump',
    title: 'Forrest Gump',
    releaseYear: 1994,
    director: 'Robert Zemeckis',
    genre: 'Drama',
    overview: 'The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man.',
    cast: [{ name: 'Tom Hanks', character: 'Forrest Gump' }],
  },
  {
    id: 'the-sixth-sense',
    title: 'The Sixth Sense',
    releaseYear: 1999,
    director: 'M. Night Shyamalan',
    genre: 'Thriller',
    overview: 'A frightened, withdrawn Philadelphia boy who communicates with spirits seeks the help of a child psychologist.',
    cast: [{ name: 'Haley Joel Osment', character: 'Cole Sear' }],
  },
  {
    id: 'blade-runner-2049',
    title: 'Blade Runner 2049',
    releaseYear: 2017,
    director: 'Denis Villeneuve',
    genre: 'Sci-Fi',
    overview: 'A young blade runner\'s discovery of a long-buried secret leads him to track down former blade runner Rick Deckard.',
    cast: [
      { name: 'Ryan Gosling', character: 'K' },
      { name: 'Harrison Ford', character: 'Rick Deckard' },
    ],
  },
  {
    id: 'dune',
    title: 'Dune',
    releaseYear: 2021,
    director: 'Denis Villeneuve',
    genre: 'Sci-Fi',
    overview: 'A noble family becomes embroiled in a war for control over the galaxy\'s most valuable asset while its heir becomes troubled by visions.',
    cast: [
      { name: 'Timothée Chalamet', character: 'Paul Atreides' },
      { name: 'Zendaya', character: 'Chani' },
    ],
  },
  {
    id: 'dune-part-two',
    title: 'Dune: Part Two',
    releaseYear: 2024,
    director: 'Denis Villeneuve',
    genre: 'Sci-Fi',
    overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    cast: [
      { name: 'Timothée Chalamet', character: 'Paul Atreides' },
      { name: 'Zendaya', character: 'Chani' },
    ],
  },
  {
    id: 'nosferatu',
    title: 'Nosferatu',
    releaseYear: 2024,
    director: 'Robert Eggers',
    genre: 'Horror',
    overview: 'A gothic tale of obsession between a haunted young woman and the terrifying ancient vampire infatuated with her.',
    cast: [{ name: 'Lily-Rose Depp', character: 'Ellen Hutter' }],
  },
  {
    id: 'blackfish',
    title: 'Blackfish',
    releaseYear: 2013,
    director: 'Gabriela Cowperthwaite',
    genre: 'Documentary',
    overview: 'A documentary following the controversy of captive orca Tilikum, who was involved in the deaths of several people.',
  },
  {
    id: 'grizzly-man',
    title: 'Grizzly Man',
    releaseYear: 2005,
    director: 'Werner Herzog',
    genre: 'Documentary',
    overview: 'A devastating and heart-rending take on grizzly bear activists Timothy Treadwell and Amie Huguenard.',
  },
  {
    id: 'inception',
    title: 'Inception',
    releaseYear: 2010,
    director: 'Christopher Nolan',
    genre: 'Sci-Fi',
    overview: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
    cast: [{ name: 'Leonardo DiCaprio', character: 'Cobb' }],
  },
  {
    id: 'parasite',
    title: 'Parasite',
    releaseYear: 2019,
    director: 'Bong Joon-ho',
    genre: 'Thriller',
    overview: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
  },
  {
    id: 'everything-everywhere-all-at-once',
    title: 'Everything Everywhere All at Once',
    releaseYear: 2022,
    director: 'Daniel Kwan, Daniel Scheinert',
    genre: 'Sci-Fi',
    overview: 'A middle-aged Chinese immigrant is swept up in an insane adventure in which she alone can save existence.',
    cast: [{ name: 'Michelle Yeoh', character: 'Evelyn Wang' }],
  },
  {
    id: 'the-dark-knight',
    title: 'The Dark Knight',
    releaseYear: 2008,
    director: 'Christopher Nolan',
    genre: 'Action',
    overview: 'When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest tests of his ability to fight injustice.',
    cast: [
      { name: 'Christian Bale', character: 'Bruce Wayne / Batman' },
      { name: 'Heath Ledger', character: 'Joker' },
    ],
  },
];

function getLocalFilms() {
  return LOCAL_FILMS;
}

function getLocalFilm(id) {
  return LOCAL_FILMS.find((film) => film.id === id) || null;
}

function searchLocalFilms(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return LOCAL_FILMS;

  return LOCAL_FILMS.filter((film) => (
    film.title.toLowerCase().includes(q)
    || film.director.toLowerCase().includes(q)
    || film.genre.toLowerCase().includes(q)
    || (film.overview && film.overview.toLowerCase().includes(q))
    || (film.cast || []).some((member) => member.name.toLowerCase().includes(q))
  ));
}

function getLocalFilmsByDirector(directorId) {
  const { getLocalDirector } = require('./localPeople');
  const director = getLocalDirector(directorId);
  if (!director) return [];

  return LOCAL_FILMS.filter((film) => film.director === director.name);
}

function getLocalFilmsByActor(actorId) {
  const { getLocalActor } = require('./localPeople');
  const actor = getLocalActor(actorId);
  if (!actor) return [];

  return LOCAL_FILMS.filter((film) => (
    (film.cast || []).some((member) => member.name === actor.name)
  ));
}

module.exports = {
  getLocalFilms,
  getLocalFilm,
  searchLocalFilms,
  getLocalFilmsByDirector,
  getLocalFilmsByActor,
};
