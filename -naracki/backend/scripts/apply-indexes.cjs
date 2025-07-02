const fs = require('fs');
const path = require('path');
const pgPromise = require('pg-promise');
const dotenv = require('dotenv');

dotenv.config();

const pgp = pgPromise({});

const dbConfig = {
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
};

const db = pgp(dbConfig);

async function applyIndexes() {
  try {
    console.log('Connecting to database...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'src', 'database-indexes.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Applying database indexes...');
    
    // Split the SQL content by semicolons and execute each statement
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await db.none(statement);
          console.log('✓ Applied:', statement.trim().split('\n')[0]);
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log('⚠ Index already exists:', statement.trim().split('\n')[0]);
          } else {
            console.error('✗ Error applying:', statement.trim().split('\n')[0], error.message);
          }
        }
      }
    }
    
    console.log('Database indexes applied successfully!');
    
  } catch (error) {
    console.error('Error applying database indexes:', error);
  } finally {
    await pgp.end();
  }
}

applyIndexes(); 