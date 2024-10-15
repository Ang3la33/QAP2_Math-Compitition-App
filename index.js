const express = require('express');
const session = require('express-session');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

// To track user's scores
app.use(express.urlencoded({ extended: true })); // For parsing form data
app.use(express.static('public')); // To serve static files (e.g., CSS)

// Set up session middleware to keep track of users progress
app.use(session({
    secret: 'quiz_secret_key',
    resave: false,
    saveUninitialized: true,
}));

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

// Route to render the homepage
app.get('/', (req, res) => {
    res.render('index');
});

// Route to start the quiz
app.get('/quiz', (req, res) => {
    // reset the session if user is starting a new quiz
    req.session.correctAnswers = 0;
    req.session.currentQuestionIndex = 0;
    req.session.answers = [];
    res.render('quiz', { question: questions[0], totalQuestions: questions.length });
});

// Route to handle quiz answers
app.post('/quiz', (req, res) => {
    const { userAnswer } = req.body;
    const currentQuestionIndex = req.session.currentQuestionIndex;
    const currentQuestion = questions[currentQuestionIndex];

    // Check if the users answer is correct
    const isCorrect = parseInt(userAnswer) === currentQuestion.answer;

    // Record the user's answer
    req.session.answers.push({
        question: currentQuestion.text,
        userAnswer: parseInt(userAnswer),
        correctAnswer: currentQuestion.answer,
        isCorrect: isCorrect
    });

    // If the user's answer is correct, increase the score
    if (isCorrect) {
        req.session.correctAnswers += 1;
    }

    // Move to the next question or complete the quiz
    req.session.currentQuestionIndex += 1;
    if (req.session.currentQuestionIndex < questions.length) {
        res.render('quiz', {
            question: questions[req.session.currentQuestionIndex],
            totalQuestions: questions.length
        });
    } else {
        // If there are no more questions, redirect to quiz complete
        res.redirect('/quiz_complete');
    }
});

let leaderboards = [];

// Route for quiz complete page
app.get('/quiz_complete', (req, res) => {
    // Add the current users streak to leaderboard
    leaderboards.push({
        correctAnswers: req.session.correctAnswers,
        totalQuestions: questions.length,
        // Store date completed
        date: new Date().toLocaleString()
    });

    // Sort leaderboard to show highest streaks first
    leaderboards.sort((a, b) => b.correctAnswers - a.correctAnswers);

    // Keep only top 10 streaks
    if (leaderboards.length > 10) {
        leaderboards = leaderboards.slice(0, 10);
    }

    res.render('quiz_complete', {
        correctAnswers: req.session.correctAnswers,
        totalQuestions: questions.length,
        answers: req.session.answers
    });
});

// Route for leaderboards
app.get('/leaderboards', (req, res) => {
    res.render('leaderboards', { leaderboards });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
