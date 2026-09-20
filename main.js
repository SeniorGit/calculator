"use strict";

const MAX_DIGITS = 12;
const RESULT_PRECISION = 12;
const EXPONENT_ABOVE = 10 ** MAX_DIGITS;
const EXPONENT_BELOW = 1e-6;
const MIN_DISPLAY_CHARS = 8;
const PRESS_FEEDBACK_MS = 120;

const KEY_ALIASES = {
    ",": ".",
    "=": "Enter",
    x: "*",
    X: "*",
    c: "Escape",
    C: "Escape",
    Delete: "Escape",
};

class CalculatorError extends Error {}

const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;

function divide(a, b) {
    if (b === 0) throw new CalculatorError("Cannot divide by zero");
    return a / b;
}

const OPERATORS = {
    "+": { symbol: "+", apply: add },
    "-": { symbol: "−", apply: subtract },
    "*": { symbol: "×", apply: multiply },
    "/": { symbol: "÷", apply: divide },
};

function calculate(a, b, operator) {
    const result = OPERATORS[operator].apply(a, b);
    if (!Number.isFinite(result)) throw new CalculatorError("Result is out of range");
    return Number(result.toPrecision(RESULT_PRECISION));
}

function formatNumber(value) {
    const size = Math.abs(value);
    const needsExponent = size >= EXPONENT_ABOVE || (size !== 0 && size < EXPONENT_BELOW);
    if (!needsExponent) return String(value);
    return value.toExponential(RESULT_PRECISION - 1).replace(/\.?0+e/, "e");
}

const countDigits = (text) => text.replace(/\D/g, "").length;

const createState = () => ({
    current: "0",
    previous: null,
    operator: null,
    overwrite: true,
    history: "",
    error: "",
});

const state = createState();

const canAddDigit = () => state.overwrite || state.current === "0" || countDigits(state.current) < MAX_DIGITS;
const canAddDecimal = () => state.overwrite || !state.current.includes(".");
const canDelete = () => !state.overwrite && state.current !== "0";
const canEvaluate = () => state.operator !== null && !state.overwrite;

function startsFreshNumber() {
    if (state.overwrite && state.operator === null) state.history = "";
}

function inputDigit(digit) {
    if (!canAddDigit()) return;
    startsFreshNumber();
    if (state.overwrite || state.current === "0") {
        state.current = digit;
        state.overwrite = false;
    } else {
        state.current += digit;
    }
}

function inputDecimal() {
    if (!canAddDecimal()) return;
    startsFreshNumber();
    if (state.overwrite) {
        state.current = "0.";
        state.overwrite = false;
    } else {
        state.current += ".";
    }
}

function chooseOperator(operator) {
    if (state.operator === null || !state.overwrite) {
        const typed = Number(state.current);
        state.previous = state.operator === null ? typed : calculate(state.previous, typed, state.operator);
        state.current = formatNumber(state.previous);
    }
    state.operator = operator;
    state.overwrite = true;
    state.history = `${formatNumber(state.previous)} ${OPERATORS[operator].symbol}`;
}

function evaluate() {
    if (!canEvaluate()) return false;
    const left = state.previous;
    const right = Number(state.current);
    const symbol = OPERATORS[state.operator].symbol;
    const result = calculate(left, right, state.operator);

    state.history = `${formatNumber(left)} ${symbol} ${formatNumber(right)} =`;
    state.current = formatNumber(result);
    state.previous = null;
    state.operator = null;
    state.overwrite = true;
    return true;
}

function deleteDigit() {
    if (!canDelete()) return;
    state.current = state.current.slice(0, -1) || "0";
}

function clear() {
    Object.assign(state, createState());
}

function fail(message) {
    Object.assign(state, createState(), { error: message });
}

const displayEl = document.querySelector(".display");
const valueEl = document.getElementById("value");
const historyEl = document.getElementById("history");
const messageEl = document.getElementById("message");
const keypadEl = document.querySelector(".keypad");
const keyEls = [...keypadEl.querySelectorAll(".key")];

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const KEY_AVAILABILITY = {
    digit: canAddDigit,
    decimal: canAddDecimal,
    delete: canDelete,
    equals: canEvaluate,
};

function updateKeys() {
    for (const key of keyEls) {
        const type = key.dataset.digit !== undefined ? "digit" : key.dataset.action;
        const isAvailable = KEY_AVAILABILITY[type]?.() ?? true;
        if (isAvailable) key.removeAttribute("aria-disabled");
        else key.setAttribute("aria-disabled", "true");
    }
}

function updateDisplay() {
    const isError = state.error !== "";
    const text = isError ? "Error" : state.current;

    if (valueEl.textContent !== text) valueEl.textContent = text;
    historyEl.textContent = state.history;
    historyEl.hidden = isError;
    messageEl.textContent = state.error;
    messageEl.hidden = !isError;
    displayEl.classList.toggle("is-error", isError);

    displayEl.style.setProperty("--chars", Math.max(text.length, MIN_DISPLAY_CHARS));
    displayEl.style.setProperty("--note-chars", Math.max(state.history.length, 1));

    updateKeys();
}

function animate(element, keyframes, duration) {
    if (!reducedMotion.matches) element.animate(keyframes, { duration, easing: "ease-out" });
}

const showResult = () => animate(valueEl, [{ opacity: 0.3 }, { opacity: 1 }], 160);

const showError = () => animate(displayEl, [
    { transform: "translateX(0)" },
    { transform: "translateX(-4px)" },
    { transform: "translateX(4px)" },
    { transform: "translateX(-2px)" },
    { transform: "translateX(0)" },
], 240);

function showKeyPress(key) {
    key.classList.add("is-pressed");
    setTimeout(() => key.classList.remove("is-pressed"), PRESS_FEEDBACK_MS);
}

const ACTIONS = {
    clear,
    delete: deleteDigit,
    decimal: inputDecimal,
    equals: evaluate,
};

function press({ digit, operator, action }) {
    let evaluated = false;
    state.error = "";

    try {
        if (digit !== undefined) inputDigit(digit);
        else if (operator !== undefined) chooseOperator(operator);
        else if (action in ACTIONS) evaluated = ACTIONS[action]() === true;
    } catch (error) {
        if (!(error instanceof CalculatorError)) throw error;
        fail(error.message);
    }

    updateDisplay();
    if (state.error) showError();
    else if (evaluated) showResult();
}

keypadEl.addEventListener("click", (event) => {
    const key = event.target.closest(".key");
    if (key) press(key.dataset);
});

const keyByName = new Map(keyEls.map((key) => [key.dataset.key, key]));

document.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    const name = KEY_ALIASES[event.key] ?? event.key;
    const key = keyByName.get(name);
    if (!key) return;

    if (name === "Enter" && document.activeElement.matches(":focus-visible")
        && document.activeElement.classList.contains("key")) return;

    event.preventDefault();
    showKeyPress(key);
    key.click();
});

updateDisplay();
