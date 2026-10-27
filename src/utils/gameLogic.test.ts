import { calculateScore, checkPassingStatus, validateAnswer, validateStudentIdentity, shuffleQuestions } from './gameLogic';
import { INITIAL_QUESTION_BANK } from '../data/questionBank';

console.log('--- STARTING ENGLISH TENSE CATCHER LOGIC TESTS ---');

// 1. Bank Soal Verification
const presentCount = INITIAL_QUESTION_BANK.filter(q => q.category === 'PRESENT').length;
const pastCount = INITIAL_QUESTION_BANK.filter(q => q.category === 'PAST').length;
const futureCount = INITIAL_QUESTION_BANK.filter(q => q.category === 'FUTURE').length;
console.log(`Bank Soal Total: ${INITIAL_QUESTION_BANK.length} items`);
console.log(`- Simple Present: ${presentCount} items`);
console.log(`- Simple Past: ${pastCount} items`);
console.log(`- Simple Future: ${futureCount} items`);

if (INITIAL_QUESTION_BANK.length < 90 || presentCount < 30 || pastCount < 30 || futureCount < 30) {
  throw new Error('Question bank does not meet 90 items requirement!');
}

// 2. Score Calculation Test
const score1 = calculateScore(8, 10); // 80.0%
const score2 = calculateScore(5, 10); // 50.0%
const score3 = calculateScore(10, 10); // 100.0%
console.log(`Score Calculation (8/10): ${score1}% (Expected: 80.0%)`);
if (score1 !== 80.0 || score2 !== 50.0 || score3 !== 100.0) {
  throw new Error('calculateScore failed');
}

// 3. Passing Threshold Test (Minimal 6 kata benar, 10 kata benar = 100 poin)
const passResult1 = checkPassingStatus(80.0, 10, 10, 60, 8); // 8 benar -> PASS
const passResult2 = checkPassingStatus(50.0, 10, 10, 60, 5); // 5 benar -> FAIL (kurang dari 6)
const passResult3 = checkPassingStatus(100.0, 10, 10, 60, 10); // 10 benar -> PASS (100 Poin)

console.log('Passing Status 8 benar (80 Pts):', passResult1);
console.log('Passing Status 5 benar (50 Pts):', passResult2);
console.log('Passing Status 10 benar (100 Pts):', passResult3);

if (!passResult1.passed || passResult1.points !== 80) {
  throw new Error('8 correct words should PASS with 80 points');
}
if (passResult2.passed) {
  throw new Error('5 correct words should NOT pass (minimum 6)');
}
if (!passResult3.passed || passResult3.points !== 100) {
  throw new Error('10 correct words should PASS with 100 points');
}

// 4. Answer Validation Test
if (!validateAnswer('PRESENT', 'PRESENT') || validateAnswer('PRESENT', 'PAST')) {
  throw new Error('validateAnswer failed');
}

// 5. Student Identity Validation
const validStudent = validateStudentIdentity({
  fullName: 'Farid Idham',
  nis: '20268491',
  className: 'VIII-A',
  subject: 'Bahasa Inggris'
});
const invalidStudent = validateStudentIdentity({
  fullName: 'Al',
  nis: '',
  className: '',
  subject: ''
});

if (!validStudent.isValid || invalidStudent.isValid) {
  throw new Error('validateStudentIdentity failed');
}

console.log('--- ALL ENGLISH TENSE CATCHER TESTS PASSED SUCCESSFULLY! ---');
