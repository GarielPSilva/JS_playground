let counter = 0;
let lastClickTime = 0;
let warningTimer = null;
let pauseTimer = null;
const WARNING_DURATION = 2000;
let isCounterPaused = false;

const counterValue = document.getElementById('counterValue');
const incrementBtn = document.getElementById('incrementBtn');
const decrementBtn = document.getElementById('decrementBtn');
const speedWarning = document.getElementById('speedWarning');
const resetBtn = document.getElementById('resetBtn');

function hideSpeedWarning() {
    clearTimeout(warningTimer);
    if (speedWarning) {
        speedWarning.classList.remove('visible');
        speedWarning.textContent = '';
    }
}

function resetCounter() {
    counter = 0;
    lastClickTime = 0;
    isCounterPaused = false;
    clearTimeout(pauseTimer);
    if (incrementBtn && decrementBtn) {
        incrementBtn.disabled = false;
        decrementBtn.disabled = false;
    }
    hideSpeedWarning();
    updateCounter();
}

function updateCounter() {
    counterValue.textContent = counter;
}

function showSpeedWarning() {
    if (speedWarning) {
        speedWarning.textContent = 'Woow, not so fast buddy';
        speedWarning.classList.add('visible');

        clearTimeout(warningTimer);
        warningTimer = setTimeout(hideSpeedWarning, WARNING_DURATION);
    }
}

function stopCounter() {
    isCounterPaused = true;
    incrementBtn.disabled = true;
    decrementBtn.disabled = true;
    showSpeedWarning();

    clearTimeout(pauseTimer);
    pauseTimer = setTimeout(() => {
        isCounterPaused = false;
        if (incrementBtn && decrementBtn) {
            incrementBtn.disabled = false;
            decrementBtn.disabled = false;
        }
    }, WARNING_DURATION);
}

function handleCounterChange() {
    const now = Date.now();

    if (now - lastClickTime < 100) {
        stopCounter();
    }

    lastClickTime = now;
}

function incrementCounter() {
    if (isCounterPaused) {
        return;
    }

    counter += 1;
    handleCounterChange();
    updateCounter();
}

function decrementCounter() {
    if (isCounterPaused) {
        return;
    }

    counter -= 1;
    handleCounterChange();
    updateCounter();
}

if (incrementBtn && decrementBtn && counterValue) {
    incrementBtn.addEventListener('click', incrementCounter);
    decrementBtn.addEventListener('click', decrementCounter);
    if (resetBtn) {
        resetBtn.addEventListener('click', resetCounter);
    }
    updateCounter();
}

