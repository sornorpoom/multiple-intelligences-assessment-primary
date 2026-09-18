/**
 * แอพพลิเคชันหลักของระบบประเมินพหุปัญญาออนไลน์ ประถมศึกษาตอนปลาย
 */

const AppState = {
  studentInfo: {
    fullName: '',
    grade: 'ประถมศึกษาปีที่ 4 (ป.4)',
    studentNo: '',
    schoolName: '',
    date: new Date().toISOString().slice(0, 10)
  },
  mode: 'all', // 'all', 'set1', 'set2', 'set3'
  answers: {}, // { 1: 3, 2: 2, ... }
  currentQuestionId: 1,
  activeQuestions: [],
  scoringResults: null,
  pendingResetAction: null // callback for reset modal
};

// เริ่มต้นระบบเมื่อ DOM พร้อม
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  initModeCardListeners();
  loadSavedState();
  updateQuestionsByMode();
  updateModeCardsVisual();
});

/**
 * บันทึกสถานะลง localStorage
 */
function saveState() {
  localStorage.setItem('mi_assessment_state_prathomsuksa', JSON.stringify({
    studentInfo: AppState.studentInfo,
    mode: AppState.mode,
    answers: AppState.answers
  }));
}

/**
 * โหลดสถานะเดิมจาก localStorage
 */
function loadSavedState() {
  try {
    const saved = localStorage.getItem('mi_assessment_state_prathomsuksa');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.studentInfo) AppState.studentInfo = parsed.studentInfo;
      if (parsed.mode) AppState.mode = parsed.mode;
      if (parsed.answers) AppState.answers = parsed.answers;
      
      // อัปเดตฟอร์มข้อมูลนักเรียน
      document.getElementById('input-fullname').value = AppState.studentInfo.fullName || '';
      document.getElementById('input-grade').value = AppState.studentInfo.grade || 'ประถมศึกษาปีที่ 4 (ป.4)';
      document.getElementById('input-student-no').value = AppState.studentInfo.studentNo || '';
      document.getElementById('input-school').value = AppState.studentInfo.schoolName || '';
      document.getElementById('input-date').value = AppState.studentInfo.date || new Date().toISOString().slice(0, 10);
      
      // อัปเดต Mode Radio
      const modeRadio = document.querySelector(`input[name="assessment-mode"][value="${AppState.mode}"]`);
      if (modeRadio) modeRadio.checked = true;
      updateModeCardsVisual();
    }
  } catch (e) {
    console.warn('Could not load saved state', e);
  }
}

/**
 * กำหนดรายการข้อสอบตาม Mode
 */
function updateQuestionsByMode() {
  if (AppState.mode === 'set1') {
    AppState.activeQuestions = MI_QUESTIONS.filter(q => q.id >= 1 && q.id <= 15);
  } else if (AppState.mode === 'set2') {
    AppState.activeQuestions = MI_QUESTIONS.filter(q => q.id >= 16 && q.id <= 30);
  } else if (AppState.mode === 'set3') {
    AppState.activeQuestions = MI_QUESTIONS.filter(q => q.id >= 31 && q.id <= 45);
  } else {
    AppState.activeQuestions = [...MI_QUESTIONS];
  }
  
  if (!AppState.activeQuestions.some(q => q.id === AppState.currentQuestionId)) {
    AppState.currentQuestionId = AppState.activeQuestions[0].id;
  }
}

/**
 * จัดการสีและการเคลื่อนไหวของกล่องเลือกรูปแบบการทำแบบประเมิน (Mode Cards)
 */
function initModeCardListeners() {
  const modeCards = document.querySelectorAll('.mode-card');
  modeCards.forEach(card => {
    card.addEventListener('click', (e) => {
      const mode = card.getAttribute('data-mode');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      AppState.mode = mode;
      updateModeCardsVisual();
      saveState();
    });
  });
}

function updateModeCardsVisual() {
  const modeCards = document.querySelectorAll('.mode-card');
  modeCards.forEach(card => {
    const mode = card.getAttribute('data-mode');
    const radio = card.querySelector('input[type="radio"]');
    if (mode === AppState.mode || (radio && radio.checked)) {
      card.classList.add('active-mode');
      if (radio) radio.checked = true;
    } else {
      card.classList.remove('active-mode');
      if (radio) radio.checked = false;
    }
  });
}

/**
 * แสดง Popup ยืนยันการ Reset
 * @param {string} title 
 * @param {string} desc 
 * @param {Function} onConfirmCallback 
 */
function showResetModal(title, desc, onConfirmCallback) {
  const modal = document.getElementById('reset-modal');
  document.getElementById('reset-modal-title').textContent = title;
  document.getElementById('reset-modal-desc').innerHTML = desc;
  AppState.pendingResetAction = onConfirmCallback;
  modal.classList.remove('hidden');
}

function closeResetModal() {
  const modal = document.getElementById('reset-modal');
  modal.classList.add('hidden');
  AppState.pendingResetAction = null;
}

/**
 * ผูก Event Listeners
 */
function initEventListeners() {
  // Start Assessment Button
  const btnStart = document.getElementById('btn-start-assessment');
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      // ดึงข้อมูลผู้เรียน
      AppState.studentInfo.fullName = document.getElementById('input-fullname').value.trim();
      AppState.studentInfo.grade = document.getElementById('input-grade').value;
      AppState.studentInfo.studentNo = document.getElementById('input-student-no').value.trim();
      AppState.studentInfo.schoolName = document.getElementById('input-school').value.trim();
      AppState.studentInfo.date = document.getElementById('input-date').value;

      const selectedMode = document.querySelector('input[name="assessment-mode"]:checked');
      if (selectedMode) {
        AppState.mode = selectedMode.value;
      }

      if (!AppState.studentInfo.fullName) {
        alert('กรุณากรอกชื่อ-นามสกุลของผู้รับการประเมิน');
        document.getElementById('input-fullname').focus();
        return;
      }

      updateQuestionsByMode();
      saveState();
      showScreen('quiz-screen');
      renderQuiz();
    });
  }

  // Load Demo Data Button
  const btnDemo = document.getElementById('btn-load-demo');
  if (btnDemo) {
    btnDemo.addEventListener('click', loadDemoData);
  }

  // Nav Home Button
  const btnNavHome = document.getElementById('btn-nav-home');
  if (btnNavHome) {
    btnNavHome.addEventListener('click', handleHomeNavigation);
  }

  // Stop Assessment Buttons & Modal
  const btnQuizStop = document.getElementById('btn-quiz-stop');
  const btnHeaderStop = document.getElementById('btn-header-stop');
  const stopModal = document.getElementById('stop-modal');
  const btnCancelStop = document.getElementById('btn-cancel-stop');
  const btnConfirmStop = document.getElementById('btn-confirm-stop');

  const openStopModal = () => {
    stopModal.classList.remove('hidden');
  };

  const closeStopModal = () => {
    stopModal.classList.add('hidden');
  };

  if (btnQuizStop) btnQuizStop.addEventListener('click', openStopModal);
  if (btnHeaderStop) btnHeaderStop.addEventListener('click', openStopModal);
  if (btnCancelStop) btnCancelStop.addEventListener('click', closeStopModal);

  if (btnConfirmStop) {
    btnConfirmStop.addEventListener('click', () => {
      closeStopModal();
      saveState();
      showScreen('welcome-screen');
    });
  }

  stopModal.addEventListener('click', (e) => {
    if (e.target === stopModal) closeStopModal();
  });

  // Reset Modal Handlers
  document.getElementById('btn-cancel-reset').addEventListener('click', closeResetModal);
  document.getElementById('btn-confirm-reset').addEventListener('click', () => {
    if (typeof AppState.pendingResetAction === 'function') {
      AppState.pendingResetAction();
    }
    closeResetModal();
  });
  document.getElementById('reset-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('reset-modal')) closeResetModal();
  });

  // 1. Reset รายข้อ (Clear current question answer)
  const btnClearCurrentQ = document.getElementById('btn-clear-current-q');
  if (btnClearCurrentQ) {
    btnClearCurrentQ.addEventListener('click', () => {
      if (AppState.answers[AppState.currentQuestionId] !== undefined) {
        delete AppState.answers[AppState.currentQuestionId];
        saveState();
        renderQuiz();
      }
    });
  }

  // 2. Reset รายด้าน (Reset current dimension answers)
  const btnResetDim = document.getElementById('btn-reset-dimension');
  if (btnResetDim) {
    btnResetDim.addEventListener('click', () => {
      const currentQ = MI_QUESTIONS.find(q => q.id === AppState.currentQuestionId);
      const currentDim = MI_DIMENSIONS.find(d => d.id === currentQ.dimensionId);
      const dimQuestions = MI_QUESTIONS.filter(q => q.dimensionId === currentDim.id);

      showResetModal(
        `รีเซ็ตคำตอบเฉพาะ "${currentDim.name}"?`,
        `คุณต้องการล้างคำตอบทั้งหมด 5 ข้อ (ข้อ ${currentDim.startQuestion} - ${currentDim.endQuestion}) ใน<strong>${currentDim.name}</strong> ใช่หรือไม่?`,
        () => {
          dimQuestions.forEach(q => {
            delete AppState.answers[q.id];
          });
          saveState();
          renderQuiz();
        }
      );
    });
  }

  // 3. Reset ภาพรวมในหน้าทำข้อสอบ (Reset All Quiz Answers)
  const btnResetAllQuiz = document.getElementById('btn-reset-all-quiz');
  if (btnResetAllQuiz) {
    btnResetAllQuiz.addEventListener('click', () => {
      showResetModal(
        'รีเซ็ตคำตอบทั้งหมดในแบบประเมิน?',
        'คุณต้องการล้างคำตอบทุกข้อที่ทำไว้เพื่อเริ่มทำใหม่ทั้งหมดใช่หรือไม่?',
        () => {
          AppState.answers = {};
          AppState.currentQuestionId = AppState.activeQuestions[0].id;
          saveState();
          renderQuiz();
        }
      );
    });
  }

  // 4. Reset ข้อมูลทั้งหมดในหน้าแรก (Reset Form & All Data)
  const btnResetAllForm = document.getElementById('btn-reset-all-form');
  if (btnResetAllForm) {
    btnResetAllForm.addEventListener('click', () => {
      showResetModal(
        'รีเซ็ตข้อมูลและคำตอบทั้งหมด?',
        'คุณต้องการล้างข้อมูลผู้รับการประเมิน (ชื่อ, ชั้น, เลขที่, โรงเรียน) และคำตอบทั้งหมดในระบบเพื่อเริ่มต้นใหม่ใช่หรือไม่?',
        () => {
          // ล้างข้อมูลใน state
          AppState.studentInfo = {
            fullName: '',
            grade: 'ประถมศึกษาปีที่ 4 (ป.4)',
            studentNo: '',
            schoolName: '',
            date: new Date().toISOString().slice(0, 10)
          };
          AppState.answers = {};
          AppState.mode = 'all';
          AppState.scoringResults = null;

          // ลบข้อมูลออกจาก localStorage
          localStorage.removeItem('mi_assessment_state_prathomsuksa');

          // ล้างค่าในช่องกรอกฟอร์มหน้าเว็บทั้งหมดทันที
          document.getElementById('input-fullname').value = '';
          document.getElementById('input-grade').value = 'ประถมศึกษาปีที่ 4 (ป.4)';
          document.getElementById('input-student-no').value = '';
          document.getElementById('input-school').value = '';
          document.getElementById('input-date').value = new Date().toISOString().slice(0, 10);
          
          updateModeCardsVisual();
          updateQuestionsByMode();
        }
      );
    });
  }

  // Navigation Buttons
  document.getElementById('btn-prev-question').addEventListener('click', prevQuestion);
  document.getElementById('btn-next-question').addEventListener('click', nextQuestion);
  document.getElementById('btn-submit-assessment').addEventListener('click', submitAssessment);

  // Results Actions
  document.getElementById('btn-download-pdf').addEventListener('click', () => {
    MIPDFExport.downloadPDF(AppState.studentInfo, AppState.scoringResults);
  });

  document.getElementById('btn-print-report').addEventListener('click', () => {
    window.print();
  });

  const btnHomeResults = document.getElementById('btn-home-from-results');
  if (btnHomeResults) {
    btnHomeResults.addEventListener('click', handleHomeNavigation);
  }

  document.getElementById('btn-retest').addEventListener('click', () => {
    showResetModal(
      'รีเซ็ตคำตอบและทำใหม่?',
      'คุณต้องการล้างคำตอบที่ประเมินไว้ทั้งหมด และกลับไปหน้าแรกเพื่อทำแบบประเมินใหม่อีกครั้งใช่หรือไม่?',
      () => {
        AppState.answers = {};
        saveState();
        showScreen('welcome-screen');
      }
    );
  });

  document.getElementById('btn-edit-answers').addEventListener('click', () => {
    showScreen('quiz-screen');
    renderQuiz();
  });
}

function handleHomeNavigation() {
  const isQuizVisible = !document.getElementById('quiz-screen').classList.contains('hidden');
  if (isQuizVisible) {
    document.getElementById('stop-modal').classList.remove('hidden');
  } else {
    showScreen('welcome-screen');
  }
}

/**
 * สลับหน้าจอ
 */
function showScreen(screenId) {
  document.getElementById('welcome-screen').classList.add('hidden');
  document.getElementById('quiz-screen').classList.add('hidden');
  document.getElementById('results-screen').classList.add('hidden');
  document.getElementById(screenId).classList.remove('hidden');

  const btnHeaderStop = document.getElementById('btn-header-stop');
  if (screenId === 'quiz-screen') {
    btnHeaderStop.classList.remove('hidden');
  } else {
    btnHeaderStop.classList.add('hidden');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * แสดงผลหน้าทำแบบทดสอบ
 */
function renderQuiz() {
  const currentQ = MI_QUESTIONS.find(q => q.id === AppState.currentQuestionId);
  if (!currentQ) return;

  const currentDim = MI_DIMENSIONS.find(d => d.id === currentQ.dimensionId);

  // อัปเดตข้อมูลส่วนหัวของข้อสอบ
  document.getElementById('quiz-dimension-badge').innerHTML = `
    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-xs" style="background-color: ${currentDim.color};">
      <i class="fa-solid ${currentDim.icon}"></i> ${currentDim.name} (ข้อ ${currentDim.startQuestion} - ${currentDim.endQuestion})
    </span>
  `;

  document.getElementById('quiz-question-number').textContent = `ข้อที่ ${currentQ.id} จาก ${AppState.activeQuestions.length} ข้อ`;
  document.getElementById('quiz-scenario').textContent = currentQ.scenario;

  // Update clear current question button
  const chosenOption = AppState.answers[currentQ.id];
  const btnClearCurrentQ = document.getElementById('btn-clear-current-q');
  if (btnClearCurrentQ) {
    btnClearCurrentQ.disabled = (chosenOption === undefined);
  }

  // Render Options
  const optionsContainer = document.getElementById('quiz-options-container');
  optionsContainer.innerHTML = '';

  currentQ.options.forEach(opt => {
    const isSelected = chosenOption === opt.id;
    const optCard = document.createElement('div');
    optCard.className = `option-card rounded-xl p-4 flex items-start gap-3.5 ${isSelected ? 'selected' : ''}`;
    optCard.innerHTML = `
      <div class="radio-circle w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5"></div>
      <div class="flex-1 text-slate-800 text-sm md:text-base leading-relaxed">
        <span class="font-bold mr-1">${opt.id}.</span> ${opt.text}
      </div>
    `;

    optCard.addEventListener('click', () => {
      AppState.answers[currentQ.id] = opt.id;
      saveState();
      renderQuiz();
    });

    optionsContainer.appendChild(optCard);
  });

  // Render Question Navigator Grid
  renderQuestionNav();

  // Update Progress Bar
  const answeredCount = AppState.activeQuestions.filter(q => AppState.answers[q.id] !== undefined).length;
  const progressPct = Math.round((answeredCount / AppState.activeQuestions.length) * 100);
  document.getElementById('quiz-progress-bar').style.width = `${progressPct}%`;
  document.getElementById('quiz-progress-text').textContent = `ตอบแล้ว ${answeredCount} / ${AppState.activeQuestions.length} ข้อ (${progressPct}%)`;

  // Update Prev/Next/Submit Buttons
  const currentIndexInActive = AppState.activeQuestions.findIndex(q => q.id === currentQ.id);
  const btnPrev = document.getElementById('btn-prev-question');
  const btnNext = document.getElementById('btn-next-question');
  const btnSubmit = document.getElementById('btn-submit-assessment');

  btnPrev.disabled = currentIndexInActive === 0;
  if (currentIndexInActive === AppState.activeQuestions.length - 1) {
    btnNext.classList.add('hidden');
    btnSubmit.classList.remove('hidden');
  } else {
    btnNext.classList.remove('hidden');
    btnSubmit.classList.add('hidden');
  }
}

/**
 * แถบเลขข้อสำหรับคลิกข้ามข้อ
 */
function renderQuestionNav() {
  const container = document.getElementById('question-nav-grid');
  container.innerHTML = '';

  AppState.activeQuestions.forEach(q => {
    const isAnswered = AppState.answers[q.id] !== undefined;
    const isActive = q.id === AppState.currentQuestionId;

    let badgeClass = 'q-badge w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center text-xs md:text-sm font-semibold cursor-pointer ';
    if (isActive) {
      badgeClass += 'active ';
    } else if (isAnswered) {
      badgeClass += 'answered ';
    } else {
      badgeClass += 'unanswered ';
    }

    const badge = document.createElement('button');
    badge.className = badgeClass;
    badge.textContent = q.id;
    badge.title = `ไปยังข้อ ${q.id}`;
    badge.addEventListener('click', () => {
      AppState.currentQuestionId = q.id;
      renderQuiz();
    });

    container.appendChild(badge);
  });
}

function prevQuestion() {
  const currentIndex = AppState.activeQuestions.findIndex(q => q.id === AppState.currentQuestionId);
  if (currentIndex > 0) {
    AppState.currentQuestionId = AppState.activeQuestions[currentIndex - 1].id;
    renderQuiz();
  }
}

function nextQuestion() {
  const currentIndex = AppState.activeQuestions.findIndex(q => q.id === AppState.currentQuestionId);
  if (currentIndex < AppState.activeQuestions.length - 1) {
    AppState.currentQuestionId = AppState.activeQuestions[currentIndex + 1].id;
    renderQuiz();
  }
}

/**
 * ส่งแบบประเมินและประมวลผล
 */
function submitAssessment() {
  const unanswered = AppState.activeQuestions.filter(q => AppState.answers[q.id] === undefined);
  if (unanswered.length > 0) {
    const confirmSubmit = confirm(`คุณยังไม่ได้ตอบอีก ${unanswered.length} ข้อ (เช่น ข้อ ${unanswered.slice(0, 5).map(q => q.id).join(', ')}${unanswered.length > 5 ? '...' : ''})\nต้องการส่งแบบประเมินเลยหรือไม่?`);
    if (!confirmSubmit) {
      AppState.currentQuestionId = unanswered[0].id;
      renderQuiz();
      return;
    }
  }

  // คำนวณผลคะแนน
  AppState.scoringResults = MIScoring.calculate(AppState.answers);
  saveState();
  showResults();
}

/**
 * แสดงผลสรุปและการวิเคราะห์
 */
function showResults() {
  showScreen('results-screen');
  const { dimensionResults, totalStats, topStrengths } = AppState.scoringResults;
  const narrative = MIScoring.getSummaryNarrative(AppState.scoringResults);

  // Student Info Header
  document.getElementById('res-student-name').textContent = AppState.studentInfo.fullName || 'นักเรียน';
  document.getElementById('res-student-meta').textContent = `ชั้น ${AppState.studentInfo.grade} เลขที่ ${AppState.studentInfo.studentNo || '-'} | โรงเรียน ${AppState.studentInfo.schoolName || '-'} | วันที่: ${AppState.studentInfo.date}`;

  // Average Score Badge
  document.getElementById('res-overall-pct').textContent = `${totalStats.averagePercentage}%`;
  document.getElementById('res-answered-count').textContent = `${totalStats.totalAnswered} / ${totalStats.totalQuestions} ข้อ`;

  // Status Alert
  const alertContainer = document.getElementById('res-status-alert');
  if (totalStats.isOverallLevel0) {
    alertContainer.className = 'p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 mb-6';
    alertContainer.innerHTML = `
      <div class="flex items-center gap-2 font-bold mb-1 text-amber-800">
        <i class="fa-solid fa-triangle-exclamation"></i> ข้อสังเกต: ข้อมูลอาจไม่เพียงพอ (ระดับ 0)
      </div>
      <p class="text-sm">${narrative.summaryText}</p>
    `;
  } else {
    alertContainer.className = 'p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 mb-6';
    alertContainer.innerHTML = `
      <div class="flex items-center gap-2 font-bold mb-1 text-emerald-800">
        <i class="fa-solid fa-circle-check"></i> สรุปผลการประเมินศักยภาพ
      </div>
      <p class="text-sm">${narrative.summaryText}</p>
    `;
  }

  // Render Charts
  setTimeout(() => {
    MICharts.renderRadarChart('radar-chart-canvas', dimensionResults);
    MICharts.renderBarChart('bar-chart-canvas', dimensionResults);
  }, 100);

  // Render Top Strengths Cards
  const strengthsContainer = document.getElementById('top-strengths-cards');
  strengthsContainer.innerHTML = '';
  if (topStrengths.length > 0 && !totalStats.isOverallLevel0) {
    topStrengths.forEach((s, idx) => {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-xl p-5 shadow-sm border-l-4 hover:shadow-md transition';
      card.style.borderLeftColor = s.dimension.color;
      card.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2 font-bold text-base" style="color: ${s.dimension.color};">
            <span class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">${idx + 1}</span>
            <i class="fa-solid ${s.dimension.icon}"></i> ${s.dimension.name}
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${s.levelInfo.badgeColor}">
            ${s.percentage}% | ${s.levelInfo.shortTitle}
          </span>
        </div>
        <p class="text-xs text-slate-600 mb-2">${s.dimension.description}</p>
        <div class="bg-slate-50 p-2.5 rounded-lg text-xs text-slate-700">
          <strong class="text-slate-900">💡 แนวทางส่งเสริม:</strong> ${s.dimension.guidance}
        </div>
      `;
      strengthsContainer.appendChild(card);
    });
  } else {
    strengthsContainer.innerHTML = `<div class="col-span-3 text-center py-6 text-slate-500 text-sm">ยังไม่มีข้อมูลจุดเด่นที่ชัดเจน</div>`;
  }

  // Render 9 Dimensions Table & Accordion
  renderDimensionsSummary(dimensionResults);
}

/**
 * แสดงตารางสรุป 9 ด้าน
 */
function renderDimensionsSummary(dimensionResults) {
  const tbody = document.getElementById('dimensions-table-body');
  tbody.innerHTML = '';

  dimensionResults.forEach((dim, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-100 hover:bg-slate-50/80 transition text-sm';
    tr.innerHTML = `
      <td class="py-3 px-3 text-center font-bold text-slate-400">${idx + 1}</td>
      <td class="py-3 px-3">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${dim.dimension.color};"></span>
          <span class="font-medium text-slate-800">${dim.dimension.name}</span>
        </div>
        <div class="text-[11px] text-slate-400 ml-4">${dim.dimension.englishName}</div>
      </td>
      <td class="py-3 px-3 text-center text-slate-600 font-mono">${dim.rawScore} / 10</td>
      <td class="py-3 px-3 text-center">
        <div class="font-bold text-slate-800 font-mono">${dim.percentage}%</div>
        <div class="w-16 bg-slate-200 h-1.5 rounded-full mx-auto mt-1 overflow-hidden">
          <div class="h-full rounded-full" style="width: ${dim.percentage}%; background-color: ${dim.dimension.color};"></div>
        </div>
      </td>
      <td class="py-3 px-3 text-center">
        <span class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${dim.levelInfo.badgeColor}">
          ${dim.levelInfo.shortTitle}
        </span>
      </td>
      <td class="py-3 px-3 text-xs text-slate-500 max-w-xs">
        ${dim.levelInfo.description}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * โหลดข้อมูลจำลองตัวอย่าง
 */
function loadDemoData() {
  AppState.studentInfo = {
    fullName: 'เด็กหญิงมณีรัตน์ ใจดี',
    grade: 'ประถมศึกษาปีที่ 5 (ป.5)',
    studentNo: '8',
    schoolName: 'โรงเรียนสาธิตประถมศึกษา',
    date: new Date().toISOString().slice(0, 10)
  };

  // จำลองคำตอบ 45 ข้อที่มีจุดเด่นด้านภาษาและการเข้าใจผู้อื่น
  const demoAnswers = {
    // ด้านภาษา (คะแนนสูง)
    1: 3, 2: 2, 3: 1, 4: 2, 5: 3,
    // ด้านตรรกะคณิตศาสตร์
    6: 4, 7: 3, 8: 4, 9: 3, 10: 4,
    // ด้านมิติสัมพันธ์
    11: 2, 12: 3, 13: 4, 14: 4, 15: 4,
    // ด้านดนตรี
    16: 2, 17: 3, 18: 2, 19: 4, 20: 4,
    // ด้านรอบรู้ธรรมชาติ
    21: 1, 22: 4, 23: 3, 24: 4, 25: 4,
    // ด้านร่างกาย
    26: 3, 27: 3, 28: 1, 29: 3, 30: 4,
    // ด้านการเข้าใจผู้อื่น (คะแนนสูง)
    31: 4, 32: 3, 33: 4, 34: 3, 35: 3,
    // ด้านการเข้าใจตนเอง
    36: 4, 37: 2, 38: 3, 39: 4, 40: 3,
    // ด้านการดำรงอยู่ของชีวิต
    41: 4, 42: 1, 43: 2, 44: 3, 45: 3
  };

  AppState.answers = demoAnswers;
  AppState.scoringResults = MIScoring.calculate(AppState.answers);
  saveState();
  showResults();
}
