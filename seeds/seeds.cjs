// To run this script, use the command: node seeds/seeds.js
// Ensure your MongoDB connection string is set in the .env file as MONGODB_URI

require("dotenv").config();
const mongoose = require("mongoose");
const Genre = require("../models/genre");
const Director = require("../models/director");
const Movie = require("../models/movie"); // Import Movie model

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
});
mongoose.connection.on("error", (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

// Genre seed data
const genres = [
  { name: "Action" },
  { name: "Comedy" },
  { name: "Drama" },
  { name: "Horror" },
  { name: "Sci-Fi" },
  { name: "Romance" },
  { name: "Thriller" },
  { name: "Fantasy" },
  { name: "Adventure" },
  { name: "Documentary" },
  { name: "Animation" },
  { name: "Mystery" },
  { name: "Crime" },
  { name: "Musical" },
  { name: "Western" },
  { name: "Historical" },
  { name: "War" },
  { name: "Superhero" },
];

// Director seed data
const directors = [
  { name: "Steven Spielberg" },
  { name: "Christopher Nolan" },
  { name: "Martin Scorsese" },
  { name: "Quentin Tarantino" },
  { name: "Denis Villeneuve" },
  { name: "Robert Zemeckis" },
  { name: "James Cameron" },
  { name: "Werner Herzog" },
  { name: "James Gunn" },
  { name: "Ryan Coogler" },
  { name: "Francis Ford Coppola" },
  { name: "Frank Darabont" },
  { name: "Peter Jackson" },
  { name: "Len Wiseman" },
];

// Movie seed data
const movies = [
  { 
    title: "Inception", 
    releaseYear: 2010, 
    genre: "Sci-Fi", 
    director: "Christopher Nolan", 
    rating: 9, 
    review: "Mind-bending movie!" 
  },
  { 
    title: "The Matrix", 
    releaseYear: 1999, 
    genre: "Action", 
    director: "The Wachowskis", 
    rating: 8, 
    review: "Great action film!" 
  },
  // Add more movie data...
];

async function seed() {
  try {
    console.log("Clearing existing genres, directors, and movies...");
    await Genre.deleteMany({});
    await Director.deleteMany({});
    await Movie.deleteMany({});

    console.log("Seeding genres...");
    const insertedGenres = await Genre.insertMany(genres);
    console.log(`Inserted ${insertedGenres.length} genres.`);

    console.log("Seeding directors...");
    const insertedDirectors = await Director.insertMany(directors);
    console.log(`Inserted ${insertedDirectors.length} directors.`);

    // Confirm insertion by querying back
    const checkGenres = await Genre.find({});
    console.log("Confirming inserted genres:", checkGenres.map(g => g.name));

    const checkDirectors = await Director.find({});
    console.log("Confirming inserted directors:", checkDirectors.map(d => d.name));

    console.log("Seeding movies...");
    // Link movies to genres by genre name
    for (const movie of movies) {
      const genre = await Genre.findOne({ name: movie.genre });
      const director = await Director.findOne({ name: movie.director });
      if (genre && director) {
        movie.genre = genre._id;  // Assign the genre's ObjectId
        movie.director = director._id;  // Assign the director's ObjectId
        await Movie.create(movie); // Insert movie into the database
      }
    }
    console.log("Movies successfully seeded!");

    console.log("Database successfully seeded!");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seed function
seed();
