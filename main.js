const monitor = document.querySelector(".monitor");
const btnNumber = document.querySelectorAll("button");
const hasil = document.createElement("p");
let firstNumber = 0;
let secondNumber = 0;
let currentInput = "";
let operator ;
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

        if(type==="clear"){
            clear();
        }else if(type==="delete"){
            handleDelete();
        }else if(type==="number"){
            handleNumber(value);
        }else if(type==="operator"){
             handleOperator(operator);
        }else if(type === "dot"){
            handleDecimal();
        }
    });
});

//handle click number by user
function handleNumber(value){
    if(shouldResetInput || currentInput === "0" || waitingForSecondNumber){
        currentInput = value;
        shouldResetInput = false;
        waitingForSecondNumber = false;
    } else{
        currentInput += value;
    }

    if(currentInput.length >12){
        currentInput = currentInput.slice(0,12);
    }
    hasil.textContent = currentInput;
}

//handle clik operator
function handleOperator(operator){
    if(op === "="){
        if(operator && firstNumber !== null && currentInput !== ""){
            secondNumber = parseFloat(currentInput);
            const result = calculate(firstNumber, secondNumber, operator);
            displayResult(result);
            firstNumber = result;
            operator = null;
            secondNumber = null;
            shouldResetInput = true;
        }
        return
    }

    if(firstNumber === null){
        firstNumber = parseFloat(currentInput);
    } else if (operator && !waitingForSecondNumber){
        secondNumber = parseFloat(currentInput);
        const result = calculate(firstNumber, secondNumber, operator);
        displayResult(result);
        firstNumber = result;
        secondNumber = null;
    }
    operator = op;
    waitingForSecondNumber = true;
    shouldResetInput = true;
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
    if(currentInput.length>1){
        currentInput = currentInput.slice(0,-1);
    } else{
        currentInput = "0";
    }
    hasil.textContent = currentInput;
}

//clearing all calculation
function clear(){
    currentInput = "0";
    firstNumber = null;
    operator = null;
    secondNumber = null;
    waitingForSecondNumber = false;
    shouldResetInput = false;
    hasil.textContent = currentInput;
}
//displaying the result
function displayResult(){
    if(result === Infinity || isNaN(result)){
        hasil.textContent = "Error";
        currentInput = "0"
    }else{
        result = Math.round(result * 100000000) / 100000000;
        hasil.textContent = result.toString().slice(0,12);
        currentInput = result.toString();
    }
}


// calculator operator
function calculate(a,b,op){
    switch (op){
        case "+":
            return a + b;
        case "-":
            return a - b;
        case "*":
            return a * b;
        case "/":
           if(b===0){
            return NaN;
           }
           return a/b;
        default: return "Error";
    }
}

