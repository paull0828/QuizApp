const leaderboardBtn = document.getElementById("leaderboard-btn");
const leaderboardDiv = document.querySelector(".leaderboard");
const leaderboardTableBody = document.querySelector("#leaderboard-table tbody");
const BACKEND_URL = "https://quizapp-srcl.onrender.com";

let userData = {
  name: "",
  surname: "",
  mobile: "",
};

const startScreen = document.querySelector(".start-screen");
const startBtn = document.getElementById("start-btn");
const app = document.querySelector(".app");
let timer;
let timeLeft;
let autoNextTimeout;
let questions = [];

startBtn.addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const surname = document.getElementById("surname").value.trim();
  const mobile = document.getElementById("mobile").value.trim();

  if (!name || !surname || !mobile) {
    alert("Please fill all the fields.");
    return;
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/check-mobile?mobile=${mobile}`
    );
    const data = await response.json();

    if (data.exists) {
      alert(
        "You have already attempted the quiz. Only one attempt allowed per mobile number."
      );
      return;
    }

    // Start quiz if allowed
    userData = { name, surname, mobile };
    startScreen.style.display = "none";
    app.style.display = "block";
    loadQuestions();
  } catch (err) {
    console.error("Mobile check failed:", err);
    alert("Something went wrong while checking mobile number.");
  }
});

async function loadQuestions() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/questions`);
    questions = await response.json();
    startQuiz();
  } catch (error) {
    console.error("Failed to load questions:", error);
  }
}

const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");

let currentQuestionIndex = 0;
let score = 0;

function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  nextButton.innerHTML = "Next";
  clearInterval(timer);
  showQuestion();
}

function showQuestion() {
  resetState();
  let currentQuestion = questions[currentQuestionIndex];
  let questionNo = currentQuestionIndex + 1;
  questionElement.innerHTML = questionNo + ". " + currentQuestion.question;

  currentQuestion.answers.forEach((answer) => {
    const button = document.createElement("button");
    button.innerHTML = answer.text;
    button.classList.add("btn");
    answerButtons.appendChild(button);
    if (answer.correct) {
      button.dataset.correct = answer.correct;
    }
    button.addEventListener("click", selectAnswer);
  });
  startTimer();
}

function resetState() {
  nextButton.style.display = "none";
  document.getElementById("timer").innerText = ""; // ← Add this
  while (answerButtons.firstChild) {
    answerButtons.removeChild(answerButtons.firstChild);
  }
}

function selectAnswer(e) {
  clearInterval(timer);
  const selectedBtn = e.target;
  const isCorrect = selectedBtn.dataset.correct === "true";

  if (isCorrect) {
    selectedBtn.classList.add("correct");
    score++;
  } else {
    selectedBtn.classList.add("incorrect");
  }

  // Show correct answers and disable all
  Array.from(answerButtons.children).forEach((button) => {
    if (button.dataset.correct === "true") {
      button.classList.add("correct");
    }
    button.disabled = true;
  });

  nextButton.style.display = "block";

  // Set 3-second auto-next unless user clicks manually
  autoNextTimeout = setTimeout(() => {
    handleNextButton();
  }, 3000);
}

function showscore() {
  clearInterval(timer);
  resetState();
  questionElement.innerHTML = `You scored ${score} out of ${questions.length}!`;
  document.getElementById("timer").innerText = "";

  fetch(`${BACKEND_URL}/api/submit-score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: userData.name,
      surname: userData.surname,
      mobile: userData.mobile,
      score: score,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        alert(data.error); // You can replace this with a toast message
      }
    })
    .catch((err) => {
      alert("Server error while submitting score.");
      console.error(err);
    });

  // ✅ Show "View Leaderboard" Button
  nextButton.style.display = "inline-block";
  nextButton.innerText = "View Leaderboard";
  nextButton.onclick = () => {
    window.location.href = "leaderboard.html";
  };
}

function handleNextButton() {
  clearInterval(timer);
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showscore();
  }
}

nextButton.addEventListener("click", () => {
  clearTimeout(autoNextTimeout); // cancel auto-next
  if (currentQuestionIndex < questions.length) {
    handleNextButton();
  } else {
    startQuiz();
  }
});

function startTimer() {
  clearInterval(timer);
  timeLeft = 30;
  document.getElementById("timer").innerText = `Time Left: ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").innerText = `Time Left: ${timeLeft}s`;

    if (timeLeft === 0) {
      clearInterval(timer);
      handleTimeUp();
    }
  }, 1000);
}

function handleTimeUp() {
  // Disable all options and show correct answers
  Array.from(answerButtons.children).forEach((button) => {
    if (button.dataset.correct === "true") {
      button.classList.add("correct");
    }
    button.disabled = true;
  });

  // Hide "Next" if visible and auto move
  nextButton.style.display = "none";

  autoNextTimeout = setTimeout(() => {
    handleNextButton();
  }, 3000);
}
