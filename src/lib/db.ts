import pgPromise from 'pg-promise';

const pgp = pgPromise({});

const config = {
  host: import.meta.env.VITE_DATABASE_HOST,
  port: parseInt(import.meta.env.VITE_DATABASE_PORT, 10),
  user: import.meta.env.VITE_DATABASE_USER,
  password: import.meta.env.VITE_DATABASE_PASSWORD,
  database: import.meta.env.VITE_DATABASE_NAME,
};

export const db = pgp(config);

// Log database connection
db.connect()
  .then((obj) => {
    obj.done(); // success, release the connection;
    console.log('Database connection successful!');
  })
  .catch((error) => {
    console.error('Database connection error:', error.message || error);
  }); 