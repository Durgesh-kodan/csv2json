const express = require('express');
const router = express.Router();
const fs = require("fs");
const db = require('../database');

// Function to calculate age distribution
function calculateAgeDistribution(res) {
    const query = {
        text: 'SELECT age FROM public.users'
    };

    db.query(query, (err, dbRes) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error calculating age distribution.");
            return;
        }

        const ages = dbRes.rows.map(row => row.age);
        const totalUsers = ages.length;

        const ageDistribution = {
            '< 20': 0,
            '20 to 40': 0,
            '40 to 60': 0,
            '> 60': 0
        };

        ages.forEach(age => {
            if (age < 20) {
                ageDistribution['< 20']++;
            } else if (age >= 20 && age <= 40) {
                ageDistribution['20 to 40']++;
            } else if (age > 40 && age <= 60) {
                ageDistribution['40 to 60']++;
            } else {
                ageDistribution['> 60']++;
            }
        });

        const ageDistributionPercentage = {
            '< 20': ((ageDistribution['< 20'] / totalUsers) * 100).toFixed(2),
            '20 to 40': ((ageDistribution['20 to 40'] / totalUsers) * 100).toFixed(2),
            '40 to 60': ((ageDistribution['40 to 60'] / totalUsers) * 100).toFixed(2),
            '> 60': ((ageDistribution['> 60'] / totalUsers) * 100).toFixed(2)
        };

        const ageGroupArray = Object.keys(ageDistributionPercentage);
        console.log("Age-Group       % Distribution");
        ageGroupArray.forEach(ageGroup => {
            console.log(ageGroup.padEnd(15), ageDistributionPercentage[ageGroup]);
        });

        res.status(200).json({ ageDistributionPercentage });
    });
}

router.get('/', async (req, res) => {
    try {
        const csv = fs.readFileSync("./public/assets/sample.csv", "utf-8");
        const rows = csv.split('\n').slice(1); // Exclude header row
        const result = rows.map(row => {
            const fields = row.split(',');
            if (fields.length !== 8) {
                console.error("Invalid row:", row);
                return null; // Skip this row
            }
            const [firstName, lastName, age, line1, line2, city, state, gender] = fields;
            const address = { line1: line1.trim(), line2: line2.trim(), city: city.trim(), state: state.trim() };
            const name = { firstName: firstName.trim(), lastName: lastName.trim() };
            const additional_info = { gender: gender.trim() };
            return {
                name,
                age: parseInt(age.trim()),
                address,
                additional_info
            };
        }).filter(row => row !== null); // Remove null values (invalid rows)

        for (const row of result) {
            const { name, age, address, additional_info } = row;
            const query = {
                text: 'INSERT INTO public.users (name, age, address, additional_info) VALUES ($1, $2, $3, $4) RETURNING *',
                values: [name.firstName + ' ' + name.lastName, age, JSON.stringify(address), JSON.stringify(additional_info)]
            };
            await db.query(query);
        }
        // All data uploaded successfully
        calculateAgeDistribution(res);
    } catch (error) {
        console.error("Error uploading data:", error);
        res.status(500).send("Error uploading data to PostgreSQL database.");
    }
});

function calculateAgeDistribution(res) {
    const query = {
        text: 'SELECT age FROM public.users'
    };

    db.query(query, (err, dbRes) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error calculating age distribution.");
            return;
        }

        // Calculate age distribution and send response
        const ages = dbRes.rows.map(row => row.age);
        // Rest of your logic to calculate age distribution...
        res.status(200).json({ /* Age distribution data */ });
    });
}

module.exports = router;
