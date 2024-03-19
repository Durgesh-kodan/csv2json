const express = require('express');
const app = express();
const dotenv = require('dotenv');
const usersRoutes = require('./userLogic/userLogic');

dotenv.config();

app.use(express.json());

app.use('/users', usersRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});