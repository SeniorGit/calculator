const monitor = document.querySelector(".monitor");
const btnNumber = document.querySelectorAll("button");
const hasil = document.createElement("p");
let firstNumber = null;
let secondNumber = null;
let currentInput = "";
let currentOperator = null;
let waitingForSecondNumber = false;
let shouldResetInput = false;

//first display
hasil.textContent = "0";
monitor.appendChild(hasil);

// user Clicked button operator or number
btnNumber.forEach((btn) => {
    btn.addEventListener("click", function (e) {
        const type = e.target.dataset.type;
        const value = e.target.dataset.value;

        if(type === "clear"){
            clear();
        } else if(type === "delete"){
            handleDelete();
        } else if(type === "number"){
            handleNumber(value);
        } else if(type === "operator"){
            handleOperator(value); 
        } else if(type === "dot"){
            handleDecimal();
        } else if(type === "equals") {
            handleEquals();
        }
    });
});

//handle click number by user
function handleNumber(value){
    if(shouldResetInput || currentInput === "0" || waitingForSecondNumber){
        currentInput = value;
        shouldResetInput = false;
        waitingForSecondNumber = false;
    } else {
        currentInput += value;
    }

    if(currentInput.length > 12){
        currentInput = currentInput.slice(0, 12);
    }
    hasil.textContent = currentInput;
}

//handle click operator
function handleOperator(op){
    if(currentInput === "" || currentInput === "0") return; 
    
    if(firstNumber === null){
        firstNumber = parseFloat(currentInput);
        currentOperator = op;
        waitingForSecondNumber = true;
        shouldResetInput = true;
    } else if (!waitingForSecondNumber) {
        handleEquals();
        currentOperator = op;
        waitingForSecondNumber = true;
        shouldResetInput = true;
    } else {
        currentOperator = op;
    }
}

//handle equals button
function handleEquals(){
    if(firstNumber !== null && currentOperator !== null && currentInput !== "" && !waitingForSecondNumber){
        secondNumber = parseFloat(currentInput);
        const result = calculate(firstNumber, secondNumber, currentOperator);
        displayResult(result);
        firstNumber = result;
        currentOperator = null;
        secondNumber = null;
        waitingForSecondNumber = false;
        shouldResetInput = true;
    }
}

// if user want using decimal
function handleDecimal(){
    if(shouldResetInput || waitingForSecondNumber){
        currentInput = "0.";
        shouldResetInput = false;
        waitingForSecondNumber = false;
    } else if (!currentInput.includes(".")){
        currentInput += ".";
    }
    hasil.textContent = currentInput;
}

//delete number
function handleDelete(){
    if(currentInput.length > 1){
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = "0";
    }
    hasil.textContent = currentInput;
}

//clearing all calculation
function clear(){
    currentInput = "0";
    firstNumber = null;
    currentOperator = null;
    secondNumber = null;
    waitingForSecondNumber = false;
    shouldResetInput = false;
    hasil.textContent = currentInput;
}

//displaying the result
function displayResult(result){
    if(result === Infinity || isNaN(result)){
        hasil.textContent = "Error";
        currentInput = "0";
        firstNumber = null;
        currentOperator = null;
    } else {
        result = Math.round(result * 100000000) / 100000000;
        hasil.textContent = result.toString().slice(0, 12);
        currentInput = result.toString();
    }
}

// calculator operator
function calculate(a, b, op){
    switch (op){
        case "+":
            return a + b;
        case "-":
            return a - b;
        case "*":
            return a * b;
        case "/":
            if(b === 0){
                return NaN;
            }
            return a / b;
        default: 
            return "Error";
    }
}