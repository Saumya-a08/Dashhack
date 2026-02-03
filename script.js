let myChart;

function calculate() {
    // 1. Get Values
    const income = parseFloat(document.getElementById('income').value) || 0;
    const rent = parseFloat(document.getElementById('rent').value) || 0;
    const utilities = parseFloat(document.getElementById('utilities').value) || 0;
    const other = parseFloat(document.getElementById('other').value) || 0;

    // 2. Logic: Savings is the Remainder
    const emi = getCurrentEMI();
    const totalExpenses = rent + utilities + other + emi;
    const savings = income - totalExpenses;

    // 3. Update Text UI
    const savingsEl = document.getElementById('savings-val');
    const healthEl = document.getElementById('health-val');
    const warningEl = document.getElementById('warning-msg');

    // Reset AI report if new calculation is done
    document.getElementById('ai-report-box').classList.add('hidden');

    savingsEl.textContent = "₹" + savings.toFixed(2);

    // Health Logic
    if (income === 0) {
        healthEl.textContent = "-";
        healthEl.style.color = "#86868b";
    } else if (savings < 0) {
        healthEl.textContent = "Deficit";
        healthEl.style.color = "#ff453a"; // Red
        warningEl.classList.remove('hidden');
    } else if (savings < (income * 0.1)) {
        healthEl.textContent = "Low Savings";
        healthEl.style.color = "#ff9f0a"; // Orange
        warningEl.classList.add('hidden');
    } else {
        healthEl.textContent = "Strong";
        healthEl.style.color = "#32d74b"; // Green
        warningEl.classList.add('hidden');
    }

    // 4. Update Chart
    const ctx = document.getElementById('budgetChart').getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Rent', 'Utilities', 'Other Exp.', 'EMI', 'Savings'],
            datasets: [{
                data: [
                    rent,
                    utilities,
                    other,
                    emi,
                    (savings > 0 ? savings : 0)
                ],
                backgroundColor: [
                    '#ff453a', // Rent
                    '#ff9f0a', // Utilities
                    '#bf5af2', // Other
                    '#0a84ff', // EMI
                    '#32d74b'  // Savings
                ], borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 5000,
                easing: 'easeOutCubic'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#f5f5f7',
                        usePointStyle: true,
                        font: { family: 'Inter', size: 12 }
                    }
                }
            }
        }
    });
}

// NEW: Function to generate AI Report
function generateAIReport() {
    const income = parseFloat(document.getElementById('income').value) || 0;
    const rent = parseFloat(document.getElementById('rent').value) || 0;
    const health = document.getElementById('health-val').textContent;
    const savings = document.getElementById('savings-val').textContent;
    const reportBox = document.getElementById('ai-report-box');

    if (income === 0) {
        reportBox.textContent = "Please run a simulation with valid income data first.";
        reportBox.classList.remove('hidden');
        return;
    }

    // Logic for dynamic text
    let analysis = `<strong>AI Analysis:</strong><br>Based on your income of ₹${income}, your financial health is currently rated as <strong>${health}</strong>. `;

    if (health === "Deficit") {
        analysis += `You are spending more than you earn. Immediate action is required to reduce "Other Expenses" or Rent costs.`;
    } else if (health === "Low Savings") {
        analysis += `You are saving ${savings}, which is below the recommended 20%. Consider reducing utilities or discretionary spending.`;
    } else {
        analysis += `Great work! Your projected savings of ${savings} puts you in a secure position. Consider investing the surplus.`;
    }

    reportBox.innerHTML = analysis;
    reportBox.classList.remove('hidden');
}


function safeNumber(value) {
    return Number.isFinite(value) ? value : 0;
}



function calculateEMI() {
    const principal = safeNumber(parseFloat(document.getElementById('loan-amount').value));
    const annualRate = safeNumber(parseFloat(document.getElementById('loan-interest-rate').value));
    const totalMonths = safeNumber(parseFloat(document.getElementById('loan-time-period').value));
    const amountPaid = safeNumber(parseFloat(document.getElementById('amount-paid').value));
    const loanStartDateValue = document.getElementById('loan-start-date').value;

    const displayEMI = document.getElementById('monthly-emi-display');
    const displayMonths = document.getElementById('months-remaining-display');
    const displayAmountRemaining = document.getElementById('amount-remaining-display');

    // Hard validation
    if (!loanStartDateValue || totalMonths <= 0 || principal <= 0) {
        displayEMI.textContent = '-';
        displayMonths.textContent = '-';
        return;
    }

    const startDate = new Date(loanStartDateValue);
    if (isNaN(startDate.getTime())) {
        displayEMI.textContent = '-';
        displayMonths.textContent = '-';
        return;
    }

    const today = new Date();

    let monthsElapsed =
        (today.getFullYear() - startDate.getFullYear()) * 12 +
        (today.getMonth() - startDate.getMonth());

    monthsElapsed = Math.max(0, safeNumber(monthsElapsed));

    const monthsRemaining = Math.max(0, totalMonths - monthsElapsed);

    displayMonths.textContent = monthsRemaining + ' months';
    displayMonths.style.color = monthsRemaining > 0 ? '#32d74b' : '#ff453a';

    if (monthsRemaining === 0) {
        displayEMI.textContent = '₹0.00';
        return;
    }

    const timeInYears = totalMonths / 12;
    const simpleInterest = safeNumber((principal * annualRate * timeInYears) / 100);
    const totalAmount = principal + simpleInterest;

    const remainingBalance = Math.max(0, totalAmount - amountPaid);
    displayAmountRemaining.textContent = '₹' + remainingBalance.toFixed(2);
    displayAmountRemaining.style.color = '#32d74b';

    const monthlyEMI = remainingBalance / monthsRemaining;

    if (!Number.isFinite(monthlyEMI)) {
        displayEMI.textContent = '-';
        return;
    }

    displayEMI.textContent = '₹' + monthlyEMI.toFixed(2) + ' per month';

    calculate();
}

function getCurrentEMI() {
    const emiText = document.getElementById('monthly-emi-display').textContent;
    const emiValue = parseFloat(emiText.replace(/[^\d.]/g, ''));
    return Number.isFinite(emiValue) ? emiValue : 0;
}


document.addEventListener('DOMContentLoaded', () => {
    calculate();
});