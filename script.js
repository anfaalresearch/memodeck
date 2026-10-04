"use strict";

/* ============================================================
   MemoDeck — Inventors & Mnemonics

   Learning flow:
   1. Study cards pair each invention with a memorable phrase.
   2. Practice quiz asks for the inventor using increasingly direct cues.
   3. Four choices test recall instead of typing the answer.
   4. Fewer revealed clues = more points.
   ============================================================ */

const QUESTIONS = [
  {
    invention: "Telephone",
    inventor: "Alexander Graham Bell",
    answer: "Alexander Graham Bell",
    icon: "📞",
    mnemonic: "BELL rings when the telephone rings!",
    clues: ["Telephone", "BELL rings when the telephone rings!", "Alexander Graham _"]
  },
  {
    invention: "Incandescent Light Bulb",
    inventor: "Thomas Edison",
    answer: "Thomas Edison",
    icon: "💡",
    mnemonic: "Edi-SON, turn the light ON!",
    clues: ["Incandescent Light Bulb", "Edi-SON, turn the light ON!", "Thomas _"]
  },
  {
    invention: "Motorized Airplane",
    inventor: "Orville & Wilbur Wright",
    answer: "Orville & Wilbur Wright",
    icon: "✈️",
    mnemonic: "Fly RIGHT with WRIGHT!",
    clues: ["Motorized Airplane", "Fly RIGHT with WRIGHT!", "Orville & Wilbur _"]
  },
  {
    invention: "Printing Press",
    inventor: "Johannes Gutenberg",
    answer: "Johannes Gutenberg",
    icon: "🖨️",
    mnemonic: "GUTENBERG prints GOOD BOOKS!",
    clues: ["Printing Press", "GUTENBERG prints GOOD BOOKS!", "Johannes _"]
  },
  {
    invention: "Electric Battery",
    inventor: "Alessandro Volta",
    answer: "Alessandro Volta",
    icon: "🔋",
    mnemonic: "VOLTA powers the VOLTS in a battery!",
    clues: ["Electric Battery", "VOLTA powers the VOLTS in a battery!", "Alessandro _"]
  },
  {
    invention: "Astronomical Telescope",
    inventor: "Galileo Galilei",
    answer: "Galileo Galilei",
    icon: "🔭",
    mnemonic: "GALILEO = Gazer of the Galaxies!",
    clues: ["Astronomical Telescope", "GALILEO = Gazer of the Galaxies!", "Galileo _"]
  },
  {
    invention: "AC Induction Motor",
    inventor: "Nikola Tesla",
    answer: "Nikola Tesla",
    icon: "⚡",
    mnemonic: "TESLA Triggers Electric Sparks!",
    clues: ["AC Induction Motor", "TESLA Triggers Electric Sparks!", "Nikola _"]
  },
  {
    invention: "Mechanical Computer (Analytical Engine)",
    inventor: "Charles Babbage",
    answer: "Charles Babbage",
    icon: "🧮",
    mnemonic: "BABBAGE Built the Base of Bytes!",
    clues: ["Mechanical Computer", "BABBAGE Built the Base of Bytes!", "Charles _"]
  },
  {
    invention: "Electric Telegraph and Morse Code",
    inventor: "Samuel Morse",
    answer: "Samuel Morse",
    icon: "📨",
    mnemonic: "MORSE sends Messages in Dashes & Dots!",
    clues: ["Electric Telegraph", "MORSE sends Messages in Dashes & Dots!", "Samuel _"]
  },
  {
    invention: "Cotton Gin",
    inventor: "Eli Whitney",
    answer: "Eli Whitney",
    icon: "☁️",
    mnemonic: "WHITNEY weaves WHITE cotton!",
    clues: ["Cotton Gin", "WHITNEY weaves WHITE cotton!", "Eli _"]
  },
  {
    invention: "Electronic Television",
    inventor: "Philo Farnsworth",
    answer: "Philo Farnsworth",
    icon: "📺",
    mnemonic: "FARNSWORTH lets you watch from FAR away!",
    clues: ["Electronic Television", "FARNSWORTH lets you watch from FAR away!", "Philo _"]
  },
  {
    invention: "Modern Helicopter",
    inventor: "Igor Sikorsky",
    answer: "Igor Sikorsky",
    icon: "🚁",
    mnemonic: "SIKORSKY Sky-soars high!",
    clues: ["Modern Helicopter", "SIKORSKY Sky-soars high!", "Igor _"]
  },
  {
    invention: "Barometer",
    inventor: "Evangelista Torricelli",
    answer: "Evangelista Torricelli",
    icon: "🌡️",
    mnemonic: "TORRicelli measures PRESSURE (Torr) with a BAROMETER!",
    clues: ["Barometer", "TORRicelli measures PRESSURE (Torr) with a BAROMETER!", "Evangelista _"]
  },
  {
    invention: "Steam Engine",
    inventor: "James Watt",
    answer: "James Watt",
    icon: "🚂",
    mnemonic: "WATT makes the engine WAT(T)ER: Watt, steam, power.",
    clues: ["Steam Engine", "WATT makes the engine WAT(T)ER: Watt, steam, power.", "James _"]
  },
  {
    invention: "Radio",
    inventor: "Guglielmo Marconi",
    answer: "Guglielmo Marconi",
    icon: "📻",
    mnemonic: "MARCONI = MARK ON AIR: radio sends signals through air.",
    clues: ["Radio", "MARCONI = MARK ON AIR: radio sends signals through air.", "Guglielmo _"]
  }
];

const POINTS_FOR_CLUES = {
  1: 3,
  2: 2,
  3: 1
};

const STORAGE_KEY = "memodeck_inventors_mnemonics_v3";

const state = {
  view: "home",

  studyIndex: 0,

  studySeen: new Set(),

  quiz: {
    cards: [],
    index: 0,
    score: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    cluesShown: 1,
    answered: false,
    selectedAnswer: null
  }
};

const $ = id => document.getElementById(id);


/* ============================================================
   GENERAL HELPERS
   ============================================================ */

function shuffle(items) {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] =
      [result[j], result[i]];
  }

  return result;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHTML(value);
}


/* ============================================================
   LOCAL PROGRESS
   ============================================================ */

function readProgress() {
  try {
    return (
      JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      ) || {
        studied: [],
        attempts: 0,
        correct: 0,
        bestScore: 0,
        streak: 0,
        lastStudyDay: null
      }
    );
  } catch {
    return {
      studied: [],
      attempts: 0,
      correct: 0,
      bestScore: 0,
      streak: 0,
      lastStudyDay: null
    };
  }
}

let progress = readProgress();

function saveProgress() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(progress)
    );
  } catch {}

  renderStats();
  renderDecks();
}

function todayKey() {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function updateStudyStreak() {
  const today = todayKey();

  if (progress.lastStudyDay === today) {
    return;
  }

  if (!progress.lastStudyDay) {
    progress.streak = 1;
  } else {
    const previous = new Date();

    previous.setDate(
      previous.getDate() - 1
    );

    const previousKey =
      `${previous.getFullYear()}-${String(
        previous.getMonth() + 1
      ).padStart(2, "0")}-${String(
        previous.getDate()
      ).padStart(2, "0")}`;

    progress.streak =
      progress.lastStudyDay === previousKey
        ? progress.streak + 1
        : 1;
  }

  progress.lastStudyDay = today;
}

function markCardStudied(card) {
  const index = QUESTIONS.findIndex(
    q => q.invention === card.invention
  );

  if (
    index === -1 ||
    state.studySeen.has(index)
  ) {
    return;
  }

  state.studySeen.add(index);

  if (!progress.studied.includes(index)) {
    progress.studied.push(index);
  }

  updateStudyStreak();
  saveProgress();
}


/* ============================================================
   VIEW NAVIGATION
   ============================================================ */

function showView(name) {
  const views = [
    "home",
    "library",
    "study",
    "quiz",
    "stats",
    "results"
  ];

  views.forEach(view => {
    const element =
      $(`${view}-view`);

    if (!element) return;

    element.hidden = view !== name;

    element.classList.toggle(
      "active-view",
      view === name
    );
  });

  state.view = name;

  const labels = {
    home: "Home",
    library: "Card Library",
    study: "Learning Cards",
    quiz: "Practice Quiz",
    stats: "Progress",
    results: "Results"
  };

  if ($("crumb")) {
    $("crumb").textContent =
      labels[name] || "Home";
  }

  document
    .querySelectorAll(".nav-item")
    .forEach(btn => {
      btn.classList.toggle(
        "active",
        btn.dataset.view === name
      );
    });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  document
    .querySelector(".sidebar")
    ?.classList.remove("open");
}


/* ============================================================
   DECK
   ============================================================ */

function renderDeckCard() {
  const mastery =
    Math.round(
      (progress.studied.length /
        QUESTIONS.length) *
        100
    );

  return `
    <article
      class="deck-card"
      data-major-deck="true"
    >
      <div class="deck-icon">💡</div>

      <div>
        <div class="deck-top">
          <span class="deck-count">
            ${QUESTIONS.length} cards
          </span>
        </div>

        <h3>
          Inventors &amp; Mnemonics
        </h3>

        <p>
          Learn each invention through a
          quick mnemonic, then test
          your active recall.
        </p>

        <div class="deck-progress">
          <div
            style="width:${mastery}%"
          ></div>
        </div>
      </div>
    </article>
  `;
}

function renderLibraryCard() {
  const mastery =
    Math.round(
      (progress.studied.length /
        QUESTIONS.length) *
        100
    );

  return `
    <article
      class="library-deck"
      data-major-deck="true"
    >
      <div class="deck-icon">💡</div>

      <div>
        <div class="deck-top">
          <span class="deck-count">
            ${QUESTIONS.length} cards
          </span>
        </div>

        <h3>
          Inventors &amp; Mnemonics
        </h3>

        <p>
          Bell, Edison, Wright, Volta,
          Tesla, Morse, Watt and more.
        </p>

        <div class="mini-progress">
          <div
            style="width:${mastery}%"
          ></div>
        </div>
      </div>

      <button
        class="primary-btn study-deck"
        type="button"
        data-study="major"
      >
        Study →
      </button>
    </article>
  `;
}

function renderDecks() {
  const home = $("home-decks");
  const library = $("library-decks");

  if (home) {
    home.innerHTML =
      renderDeckCard();

    home
      .querySelector("[data-major-deck]")
      ?.addEventListener(
        "click",
        startStudy
      );
  }

  if (library) {
    library.innerHTML =
      renderLibraryCard();

    library
      .querySelector(
        "[data-major-deck]"
      )
      ?.addEventListener(
        "click",
        event => {
          if (
            !event.target.closest(
              "[data-study]"
            )
          ) {
            startStudy();
          }
        }
      );

    library
      .querySelector("[data-study]")
      ?.addEventListener(
        "click",
        startStudy
      );
  }
}


/* ============================================================
   LEARNING CARDS
   ============================================================ */

function startStudy() {
  state.studyIndex = 0;
  state.studySeen.clear();

  if ($("study-deck-label")) {
    $("study-deck-label").textContent =
      "INVENTORS & MNEMONICS";
  }

  if ($("study-title")) {
    $("study-title").textContent =
      `Learn ${QUESTIONS.length} inventors`;
  }

  showView("study");

  renderStudyCard();
}

function renderStudyCard() {
  const card =
    QUESTIONS[state.studyIndex];

  if (!card) return;

  $("flashcard")
    ?.classList.remove("flipped");

  if ($("study-counter")) {
    $("study-counter").textContent =
      `${state.studyIndex + 1} / ${QUESTIONS.length}`;
  }

  if ($("study-progress")) {
    $("study-progress").style.width =
      `${(
        ((state.studyIndex + 1) /
          QUESTIONS.length) *
        100
      )}%`;
  }

  if ($("flash-category")) {
    $("flash-category").textContent =
      "INVENTORS & MNEMONICS";
  }

  if ($("flash-visual")) {
    $("flash-visual").textContent =
      card.icon;
  }

  if ($("flash-front-title")) {
    $("flash-front-title").textContent =
      card.invention;
  }

  if ($("flash-front-subtitle")) {
    $("flash-front-subtitle").textContent =
      "Learn the invention. Flip for the name and mnemonic.";
  }

  if ($("flash-back-title")) {
    $("flash-back-title").textContent =
      card.inventor;
  }

  if ($("flash-definition")) {
    $("flash-definition").textContent =
      `${card.invention} → ${card.inventor}`;
  }

  if ($("flash-hook")) {
    $("flash-hook").textContent =
      card.mnemonic;
  }

  if ($("flash-fact")) {
    $("flash-fact").textContent =
      `Say it once: ${card.inventor} - ${card.invention}.`;
  }

  markCardStudied(card);
}

function stepStudy(delta) {
  state.studyIndex =
    Math.max(
      0,
      Math.min(
        QUESTIONS.length - 1,
        state.studyIndex + delta
      )
    );

  renderStudyCard();
}


/* ============================================================
   QUIZ
   ============================================================ */

function startQuiz() {
  state.quiz.cards =
    shuffle(QUESTIONS);

  state.quiz.index = 0;
  state.quiz.score = 0;
  state.quiz.correct = 0;
  state.quiz.streak = 0;
  state.quiz.bestStreak = 0;
  state.quiz.cluesShown = 1;
  state.quiz.answered = false;
  state.quiz.selectedAnswer = null;

  if ($("quiz-deck-label")) {
    $("quiz-deck-label").textContent =
      "INVENTORS & MNEMONICS";
  }

  ensureRevealButton();

  showView("quiz");

  renderQuiz();
}

function buildChoices(correct) {
  const distractors =
    shuffle(
      QUESTIONS.filter(
        q => q.answer !== correct.answer
      )
    ).slice(0, 3);

  return shuffle([
    correct,
    ...distractors
  ]);
}


/* ============================================================
   CLUE BUTTON
   ============================================================ */

function ensureRevealButton() {
  if ($("reveal-clue")) {
    return;
  }

  const footer =
    document.querySelector(
      ".quiz-footer"
    );

  if (!footer) {
    return;
  }

  const button =
    document.createElement("button");

  button.type = "button";
  button.id = "reveal-clue";
  button.className =
    "secondary-btn";

  button.textContent =
    "Reveal clue 2";

  button.addEventListener(
    "click",
    revealNextClue
  );

  footer.insertBefore(
    button,
    $("next-question")
  );
}


/* ============================================================
   QUIZ CLUES
   ============================================================ */

function formatClue(clue) {
  if (!clue.includes("_")) {
    return escapeHTML(clue);
  }

  const parts =
    clue.split("_");

  return `
    ${escapeHTML(parts[0])}
    <span
      class="clue-blank"
      style="
        color:var(--accent-2);
        border-bottom:3px solid var(--accent-2);
        padding:0 5px;
      "
    >
      _
    </span>
    ${escapeHTML(parts[1] || "")}
  `;
}

function renderClues(card) {
  const visible =
    card.clues.slice(
      0,
      state.quiz.cluesShown
    );

  if (!$("quiz-art")) {
    return;
  }

  $("quiz-art").innerHTML = `
    <div
      class="clue-stack"
      style="
        display:flex;
        flex-direction:column;
        gap:12px;
        align-items:center;
        width:100%;
      "
    >

      ${visible
        .map(
          (clue, index) => `
          <div
            style="
              width:min(560px,100%);
              padding:14px 18px;
              border-radius:16px;
              background:var(--surface-2);
              border:1px solid var(--line);
              display:flex;
              gap:12px;
              align-items:center;
              justify-content:center;
            "
          >

            <span
              style="
                font-size:.72rem;
                font-weight:800;
                letter-spacing:.08em;
                opacity:.65;
              "
            >
              CLUE ${index + 1}
            </span>

            <strong
              style="
                font-size:${
                  index === 0
                    ? "clamp(1.2rem, 3vw, 2rem)"
                    : "clamp(.9rem, 2vw, 1.2rem)"
                };
                line-height:1.35;
                text-align:center;
                overflow-wrap:anywhere;
              "
            >
              ${formatClue(clue)}
            </strong>

          </div>
        `
        )
        .join("")}

    </div>
  `;
}


/* ============================================================
   RENDER QUESTION
   ============================================================ */

function renderQuiz() {
  const card =
    state.quiz.cards[
      state.quiz.index
    ];

  if (!card) {
    showResults();
    return;
  }

  state.quiz.answered = false;
  state.quiz.selectedAnswer = null;
  state.quiz.cluesShown = 1;

  if ($("quiz-number")) {
    $("quiz-number").textContent =
      `Question ${
        state.quiz.index + 1
      } of ${
        state.quiz.cards.length
      }`;
  }

  if ($("quiz-streak")) {
    $("quiz-streak").textContent =
      `${state.quiz.streak} correct streak`;
  }

  if ($("quiz-score")) {
    $("quiz-score").textContent =
      String(state.quiz.score);
  }

  if ($("quiz-progress")) {
    $("quiz-progress").style.width =
      `${
        (
          state.quiz.index /
          state.quiz.cards.length
        ) * 100
      }%`;
  }

  renderClues(card);

  if ($("quiz-question")) {
    $("quiz-question").textContent =
      "Who is associated with this invention?";
  }

  if ($("quiz-prompt")) {
    $("quiz-prompt").textContent =
      "Use the memory clues and choose one of the four inventors.";
  }

  if ($("quiz-feedback")) {
    $("quiz-feedback").hidden =
      true;
  }

  if ($("next-question")) {
    $("next-question").hidden =
      true;
  }

  const revealBtn =
    $("reveal-clue");

  if (revealBtn) {
    revealBtn.hidden =
      false;

    revealBtn.disabled =
      false;

    revealBtn.textContent =
      "Reveal clue 2";
  }

  const choices =
    buildChoices(card);

  if ($("answer-grid")) {
    $("answer-grid").innerHTML =
      choices
        .map(
          (choice, index) => `
          <button
            class="answer-btn"
            type="button"
            data-answer="${escapeAttr(
              choice.answer
            )}"
          >
            <span class="letter">
              ${String.fromCharCode(
                65 + index
              )}
            </span>

            <span>
              ${escapeHTML(
                choice.answer
              )}
            </span>

          </button>
        `
        )
        .join("");
  }

  document
    .querySelectorAll(".answer-btn")
    .forEach(button => {
      button.addEventListener(
        "click",
        () =>
          handleAnswer(
            button.dataset.answer,
            card
          )
      );
    });
}


/* ============================================================
   REVEAL CLUES
   ============================================================ */

function revealNextClue() {
  if (
    state.quiz.answered ||
    state.quiz.cluesShown >= 3
  ) {
    return;
  }

  state.quiz.cluesShown += 1;

  renderClues(
    state.quiz.cards[
      state.quiz.index
    ]
  );

  const button =
    $("reveal-clue");

  if (!button) {
    return;
  }

  if (state.quiz.cluesShown === 2) {
    button.textContent =
      "Reveal clue 3";
  } else {
    button.textContent =
      "All clues revealed";

    button.disabled =
      true;
  }
}


/* ============================================================
   ANSWER CHECK
   ============================================================ */

function handleAnswer(answer, card) {
  if (state.quiz.answered) {
    return;
  }

  state.quiz.answered = true;
  state.quiz.selectedAnswer =
    answer;

  const correct =
    answer === card.answer;

  const points =
    correct
      ? POINTS_FOR_CLUES[
          state.quiz.cluesShown
        ]
      : 0;

  document
    .querySelectorAll(
      ".answer-btn"
    )
    .forEach(button => {
      button.disabled = true;

      if (
        button.dataset.answer ===
        card.answer
      ) {
        button.classList.add(
          "correct"
        );
      }

      if (
        button.dataset.answer ===
          answer &&
        !correct
      ) {
        button.classList.add(
          "wrong"
        );
      }
    });

  if (correct) {
    state.quiz.correct += 1;

    state.quiz.score +=
      points;

    state.quiz.streak += 1;

    state.quiz.bestStreak =
      Math.max(
        state.quiz.bestStreak,
        state.quiz.streak
      );

    showQuizFeedback(
      true,
      `Correct! <strong>+${points} point${
        points === 1 ? "" : "s"
      }</strong> — ${escapeHTML(
        card.mnemonic
      )}`
    );
  } else {
    state.quiz.streak = 0;

    showQuizFeedback(
      false,
      `Not quite. The answer is <strong>${escapeHTML(
        card.answer
      )}</strong> — ${escapeHTML(
        card.mnemonic
      )}`
    );
  }

  progress.attempts += 1;

  if (correct) {
    progress.correct += 1;
  }

  progress.bestScore =
    Math.max(
      progress.bestScore,
      state.quiz.score
    );

  saveProgress();

  const revealBtn =
    $("reveal-clue");

  if (revealBtn) {
    revealBtn.hidden = true;
  }

  if ($("next-question")) {
    $("next-question").textContent =
      state.quiz.index ===
      state.quiz.cards.length - 1
        ? "See results →"
        : "Next question →";

    $("next-question").hidden =
      false;
  }

  if ($("quiz-progress")) {
    $("quiz-progress").style.width =
      `${
        (
          (state.quiz.index + 1) /
          state.quiz.cards.length
        ) * 100
      }%`;
  }
}


/* ============================================================
   FEEDBACK
   ============================================================ */

function showQuizFeedback(
  good,
  html
) {
  const box =
    $("quiz-feedback");

  if (!box) return;

  box.hidden = false;

  box.className =
    `quiz-feedback ${
      good ? "good" : "bad"
    }`;

  box.innerHTML = html;
}


/* ============================================================
   NEXT QUESTION
   ============================================================ */

function nextQuizQuestion() {
  if (!state.quiz.answered) {
    return;
  }

  state.quiz.index += 1;

  if (
    state.quiz.index >=
    state.quiz.cards.length
  ) {
    showResults();
  } else {
    renderQuiz();
  }
}


/* ============================================================
   RESULTS
   ============================================================ */

function showResults() {
  showView("results");

  const total =
    state.quiz.cards.length || 1;

  const maxScore =
    total * 3;

  const percentage =
    Math.round(
      (state.quiz.score /
        maxScore) *
        100
    );

  if ($("result-score")) {
    $("result-score").textContent =
      String(percentage);
  }

  if ($("result-correct")) {
    $("result-correct").textContent =
      String(state.quiz.correct);
  }

  if ($("result-total")) {
    $("result-total").textContent =
      String(total);
  }

  if ($("result-streak")) {
    $("result-streak").textContent =
      String(
        state.quiz.bestStreak
      );
  }

  if ($("result-title")) {
    $("result-title").textContent =
      percentage === 100
        ? "Perfect recall."
        : percentage >= 80
          ? "Strong memory."
          : percentage >= 60
            ? "Good start."
            : "Review and run it again.";
  }

  if ($("result-subtitle")) {
    $("result-subtitle").textContent =
      `You scored ${
        state.quiz.score
      } / ${
        maxScore
      } points by recalling inventors from memory clues.`;
  }
}


/* ============================================================
   STATS
   ============================================================ */

function renderStats() {
  const studied =
    progress.studied.length;

  const accuracy =
    progress.attempts
      ? Math.round(
          (progress.correct /
            progress.attempts) *
            100
        )
      : 0;

  if ($("stat-studied")) {
    $("stat-studied").textContent =
      String(studied);
  }

  if ($("stat-accuracy")) {
    $("stat-accuracy").textContent =
      `${accuracy}%`;
  }

  if ($("stat-best")) {
    $("stat-best").textContent =
      String(
        progress.bestScore || 0
      );
  }

  if ($("stat-streak")) {
    $("stat-streak").textContent =
      String(
        progress.streak || 0
      );
  }

  if ($("side-streak")) {
    $("side-streak").textContent =
      `${progress.streak || 0} ${
        (progress.streak || 0) === 1
          ? "day"
          : "days"
      }`;
  }

  const mastery =
    Math.round(
      (studied /
        QUESTIONS.length) *
        100
    );

  if ($("mastery-list")) {
    $("mastery-list").innerHTML = `
      <div class="mastery-row">

        <div class="deck-icon">
          💡
        </div>

        <div class="mastery-name">

          <strong>
            Inventors &amp; Mnemonics
          </strong>

          <span>
            ${QUESTIONS.length} cards ·
            ${mastery}% learned
          </span>

          <div class="mastery-bar">
            <div
              style="width:${mastery}%"
            ></div>
          </div>

        </div>

        <div class="mastery-percent">
          ${mastery}%
        </div>

      </div>
    `;
  }
}


/* ============================================================
   THEME
   ============================================================ */

function initTheme() {
  let saved = null;

  try {
    saved =
      localStorage.getItem(
        "memodeck_theme"
      );
  } catch {}

  if (saved === "dark") {
    document.body.classList.add(
      "dark"
    );
  }

  if ($("theme-toggle")) {
    $("theme-toggle").textContent =
      document.body.classList.contains(
        "dark"
      )
        ? "☾"
        : "☼";
  }
}


/* ============================================================
   EVENT BINDING
   ============================================================ */

function bindNavigation() {
  document
    .querySelectorAll(
      "[data-view]"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          if (
            button.dataset.view ===
            "quiz"
          ) {
            startQuiz();
          } else {
            showView(
              button.dataset.view
            );
          }
        }
      );
    });

  document
    .querySelectorAll(
      "[data-view-link]"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () =>
          showView(
            button.dataset
              .viewLink
          )
      );
    });

  $("mobile-menu")
    ?.addEventListener(
      "click",
      () => {
        document
          .querySelector(
            ".sidebar"
          )
          ?.classList.toggle(
            "open"
          );
      }
    );

  document
    .querySelectorAll(
      "[data-start]"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          if (
            button.dataset
              .start ===
            "learn"
          ) {
            startStudy();
          } else {
            startQuiz();
          }
        }
      );
    });

  $("theme-toggle")
    ?.addEventListener(
      "click",
      () => {
        document.body.classList.toggle(
          "dark"
        );

        try {
          localStorage.setItem(
            "memodeck_theme",
            document.body.classList.contains(
              "dark"
            )
              ? "dark"
              : "light"
          );
        } catch {}

        $("theme-toggle").textContent =
          document.body.classList.contains(
            "dark"
          )
            ? "☾"
            : "☼";
      }
    );

  $("reset-progress")
    ?.addEventListener(
      "click",
      () => {
        if (
          !confirm(
            "Reset all Inventors & Mnemonics progress?"
          )
        ) {
          return;
        }

        progress = {
          studied: [],
          attempts: 0,
          correct: 0,
          bestScore: 0,
          streak: 0,
          lastStudyDay: null
        };

        state.studySeen.clear();

        saveProgress();
        renderDecks();
      }
    );

  $("flashcard")
    ?.addEventListener(
      "click",
      () => {
        $("flashcard")
          .classList.toggle(
            "flipped"
          );
      }
    );

  $("flashcard")
    ?.addEventListener(
      "keydown",
      event => {
        if (
          event.key ===
            "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();

          $("flashcard")
            .classList.toggle(
              "flipped"
            );
        }
      }
    );

  $("study-prev")
    ?.addEventListener(
      "click",
      () =>
        stepStudy(-1)
    );

  $("study-next")
    ?.addEventListener(
      "click",
      () =>
        stepStudy(1)
    );

  $("study-ready")
    ?.addEventListener(
      "click",
      () => {
        if (
          state.studyIndex <
          QUESTIONS.length - 1
        ) {
          stepStudy(1);
        } else {
          startQuiz();
        }
      }
    );

  $("next-question")
    ?.addEventListener(
      "click",
      nextQuizQuestion
    );

  $("quit-quiz")
    ?.addEventListener(
      "click",
      () =>
        showView("home")
    );

  $("retry-quiz")
    ?.addEventListener(
      "click",
      startQuiz
    );
}


/* ============================================================
   INITIALIZE
   ============================================================ */

renderDecks();
renderStats();
initTheme();
bindNavigation();
showView("home");


/* Debug hook */
window.MemoDeck = {
  QUESTIONS,
  state,
  progress,
  startStudy,
  startQuiz
};
