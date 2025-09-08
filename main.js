const monitor = document.querySelector(".monitor");
const btnNumber = document.querySelectorAll("button");
const hasil = document.createElement("p");
let firstNumber = 0;
let secondNumber = 0;
let currentInput = "";
let operator ;
let waitingForSecondNumber = false;

// user Clicked button operator or number
btnNumber.forEach((btn) => {
    btn.addEventListener("click", function (e) {
        const type = e.target.dataset.type;
        const value = e.target.dataset.value;

        if(type==="clear"){
            clear();
        }else if(type==="delete"){
            currentInput = currentInput.slice(0, -1);
            hasil.textContent = currentInput;
        }else if(type==="number"){
             if (waitingForSecondNumber) {
                currentInput = value; 
                waitingForSecondNumber = false;
            } else {
                currentInput += value;
            }
            hasil.textContent = currentInput;
            monitor.appendChild(hasil);
        }else if(type==="operator"){
             if (operator && !waitingForSecondNumber) {
                secondNumber = parseInt(currentInput);
                const result = calculate(firstNumber, secondNumber, operator);
                hasil.textContent = result;
                monitor.appendChild(hasil);
                firstNumber = result;
                currentInput = result.toString();
            } else {
                firstNumber = parseInt(currentInput);
            }

            operator = value;
            waitingForSecondNumber = true;

            if (operator === "=") {
                operator = null;
                waitingForSecondNumber = false;
            }
        }
    });
});

function clear(){
    hasil.innerHTML = "";
    currentInput = "";
    firstNumber = null;
    operator = null;
    secondNumber = null;

}

// calculator operator
function calculate(a,b,op){
    switch (op){
        case "+":
            return a + b;
        case "-":
            return a - b;
        case "X":
            return a * b;
        case "/":
            return b !== 0
            ? a / b
            : 0
        default: return "not found 404";
    }
}

