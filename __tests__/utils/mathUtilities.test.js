const { isCorrectAnswer, getQuestion } = require("../../utils/mathUtilities");
module.exports = { getQuestion, isCorrectAnswer };

describe ("Math Utlilities", () => {
    describe("Tests for getQuestion", () => {
        test("should properly generate a question", () => {
            const question = getQuestion();
            // Check if question has a 'text' and 'answer' 
            expect(question).toHaveProperty('text');
            expect(question).toHaveProperty('answer');
            // Check that 'text' is a string and 'answer' is a number
            console.log("Generated question:", question);  // Add this line to check the result
            expect(typeof question.text).toBe('string');
            expect(typeof question.answer).toBe('number');
        });
    });

    describe("Tests for isCorrectAnswer", () => {
        test("should get a correct answer", () => {
            const question = { text: "2 + 2", answer: 4 };
            const userAnswer = 4;
            // Check that the correct answer returns true
            const result = isCorrectAnswer(question, userAnswer);
            expect(result).toBe(true);
        });
        test("should get an incorrect answer", () => {
            const question = { text: "2 + 2", answer: 4 };
            const userAnswer = 5;
            // Check that the incorrect answer returns false
            const result = isCorrectAnswer(question, userAnswer);
            expect(result).toBe(false);
        });
    });
});