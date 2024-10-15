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

let leaderboards = [];

// Function to generate math question
function getQuestion() {
    const operators = ['+', '-', '*', '/'];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    let num1 = Math.floor(Math.random() * 100) + 1;
    let num2 = Math.floor(Math.random() * 100) + 1;

    if (operator === '/') {
        num1 = num1 * num2; // Ensure num1 is divisible by num2 for integer division
    }

    const questionText = `${num1} ${operator} ${num2}`;
    let answer;

    switch (operator) {
        case '+':
            answer = num1 + num2;
            break;
        case '-':
            answer = num1 - num2;
            break;
        case '*':
            answer = num1 * num2;
            break;
        case '/':
            answer = num1 / num2;
            break;
    }

    return { text: questionText, answer: answer };
}
// Function to check the answer
function isCorrectAnswer(question, userAnswer) {
    console.log("Checking answer:", question, userAnswer);
    return parseInt(userAnswer) === question.answer;
}

module.exports = { getQuestion, isCorrectAnswer };

// Route to render the homepage
app.get('/', (req, res) => {
    const lastStreak = req.session.correctAnswers || 0;
    res.render('index', {
        correctAnswers: lastStreak,
        message: lastStreak > 0 ? `Your last streak was ${lastStreak}` : "No streak available"
    });
});

// Route to start the quiz
app.get('/quiz', (req, res) => {
    req.session.correctAnswers = 0;
    req.session.currentQuestionIndex = 0;
    req.session.answers = [];
    
    // Generate the first question dynamically
    const firstQuestion = getQuestion();
    req.session.currentQuestion = firstQuestion;  

    res.render('quiz', {
        question: firstQuestion,
        totalQuestions: null
    });
});

// Route to handle quiz answers (POST request)
app.post('/quiz', (req, res) => {
    const { userAnswer } = req.body;
    const currentQuestion = req.session.currentQuestion;

    // Check if the currentQuestion exists
    if (!currentQuestion) {
        return res.redirect('/quiz'); 
    }

    if (isNaN(userAnswer) || userAnswer.trim() === '') {
        return res.render('quiz', {
            question: currentQuestion,
            totalQuestions: null,
            errorMessage: "Please enter a valid number."  
        });
    }

    // Check if the user's answer is correct using the checkAnswer function
    const isCorrect = checkAnswer(currentQuestion, userAnswer);

    // Record the user's answer
    req.session.answers.push({
        question: currentQuestion.text,
        userAnswer: parseInt(userAnswer),
        correctAnswer: currentQuestion.answer,
        isCorrect: isCorrect
    });

    // If the answer is correct, continue with the quiz
    if (isCorrect) {
        req.session.correctAnswers += 1;

        // Generate the next question dynamically
        const nextQuestion = getQuestion();
        req.session.currentQuestion = nextQuestion;

        res.render('quiz', {
            question: nextQuestion,
            totalQuestions: null
        });
    } else {
        // If the answer is incorrect, redirect to the quiz_complete page
        res.redirect('/quiz_complete');
    }
});


// Route for quiz complete page
app.get('/quiz_complete', (req, res) => {
    // Add the current user's streak to the leaderboard
    leaderboards.push({
        correctAnswers: req.session.correctAnswers,
        totalQuestions: req.session.answers.length, // The number of questions answered
        date: new Date().toLocaleString() // Store the date completed
    });

    // Sort leaderboard to show highest streaks first
    leaderboards.sort((a, b) => b.correctAnswers - a.correctAnswers);

    // Keep only the top 10 streaks
    if (leaderboards.length > 10) {
        leaderboards = leaderboards.slice(0, 10);
    }

    // Render the quiz complete page with the results
    res.render('quiz_complete', {
        correctAnswers: req.session.correctAnswers,
        totalQuestions: req.session.answers.length, // The number of questions answered
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
