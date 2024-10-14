const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); // For parsing form data
app.use(express.static('public')); // To serve static files (e.g., CSS)

// Math questions and solutions
const questions = [
    {id: 1, text: "25 + 37", answer: 62},
    {id: 2, text: "89 - 54", answer: 35},
    {id: 3, text: "12 x 9", answer: 108},
    {id: 4, text: "144 / 12", answer: 12},
    {id: 5, text: "102 + 58", answer: 160},
    {id: 6, text: "200 - 75", answer: 125},
    {id: 7, text: "15 x 6", answer: 90},
    {id: 8, text: "81 / 9", answer: 9},
    {id: 9, text: "350 + 225", answer: 575},
    {id: 10, text: "500 - 320", answer: 180}
];

//Some routes required for full functionality are missing here. Only get routes should be required
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/quiz', (req, res) => {
    res.render('quiz', { questions: questions });
});

app.get('/leaderboards', (req,res) => {
    res.render('leaderboards');
});

app.get('quiz_complete', (req,res) => {
    res.render('quiz_complete');
});

//Handles quiz submissions.
app.post('/quiz', (req, res) => {
    const { answer } = req.body;
    console.log(`Answer: ${answer}`);

    //answer will contain the value the user entered on the quiz page
    //Logic must be added here to check if the answer is correct, then track the streak and redirect properly
    //By default we'll just redirect to the homepage again.
    res.redirect('/');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});