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

// Function to generate math question
function generateQuestion() {
    const operators = ['+', '-', '*', '/'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let num1, num2;

    // Generate numbers based on the operation type
    if (operator === '/') {
        // Ensure division results in an integer (avoid decimals)
        num1 = Math.floor(Math.random() * 100) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        num1 = num1 * num2;  // Make num1 divisible by num2
    } else {
        num1 = Math.floor(Math.random() * 100) + 1;
        num2 = Math.floor(Math.random() * 100) + 1;
    }

    const questionText = `${num1} ${operator} ${num2}`;
    let answer;

    // Calculate the answer based on the operation
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
function checkAnswer(question, userAnswer) {
    return parseInt(userAnswer) === question.answer;
}



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
    const firstQuestion = generateQuestion();
    req.session.currentQuestion = firstQuestion;  

    res.render('quiz', {
        question: firstQuestion,
        totalQuestions: null 
    });
});

// Route to handle quiz answers (POST request)
// Route to handle quiz answers (POST request)
app.post('/quiz', (req, res) => {
    const { userAnswer } = req.body;
    const currentQuestion = req.session.currentQuestion;

    // Check if the currentQuestion exists (to avoid TypeError)
    if (!currentQuestion) {
        return res.redirect('/quiz');  // Handle the case where the question is not in session
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
        const nextQuestion = generateQuestion();
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



let leaderboards = [];

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
