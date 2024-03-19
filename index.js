const express = require('express');
const app = express();
const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config();

// Route to handle CSV to JSON conversion
app.get('/convert', (req, res) => {
  const csvFile = 'path/to/your/csv/file.csv'; // Replace with the actual path to your CSV file

  fs.readFile(csvFile, 'utf8', async (err, data) => {
    if (err) {
      console.error('Error reading CSV file:', err);
      res.status(500).send('Error converting CSV to JSON');
      return;
    }

    const rows = data.trim().split('\n');
    const headers = rows[0].split(',').map(header => header.trim());

    const results = rows.slice(1).map(row => {
      const values = row.split(',');
      const rowData = {};

      headers.forEach((header, index) => {
        const parts = header.split('.');
        if (parts.length > 1) {
          const rootKey = parts[0];
          const nestedKey = parts.slice(1).join('.');
          if (!rowData[rootKey]) {
            rowData[rootKey] = {};
          }
          rowData[rootKey][nestedKey] = values[index];
        } else {
          rowData[header] = values[index];
        }
      });

      return rowData;
    });

    // Connect to PostgreSQL database
    const client = new Client({
      host: process.env.POSTGRESDB_HOST,
      port: process.env.POSTGRESDB_PORT,
      user: process.env.POSTGRESDB_USER,
      password: process.env.POSTGRESDB_PASSWORD,
      database: process.env.POSTGRESDB_DATABASE,
    });

    try {
      await client.connect();

      // Store the converted JSON data in the database
      for (const data of results) {
        const query = {
          text: 'INSERT INTO your_table_name (column1, column2, ...) VALUES ($1, $2, ...)',
          values: [data.name, data.age, data.address , data.gender], // Replace with the actual column names and values
        };
        await client.query(query);
      }

      res.send('CSV data stored in PostgreSQL database');
    } catch (err) {
      console.error('Error storing data in PostgreSQL:', err);
      res.status(500).send('Error storing data in PostgreSQL');
    } finally {
      await client.end();
    }
  });
});

// Start the server
const port = process.env.POSTGRESDB_PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});