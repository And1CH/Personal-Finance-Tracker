// Initialize an empty array for transactions
const transactions = [];

// Global variables for finances
let totalIncome = 0;
let totalExpense = 0;
let balance = 0;

// Function to update the dashboard
let initialBalance = 0; // New variable to store the initial balance

function updateDashboard() {
  // Recalculate total income and expenses
  totalIncome = transactions
    .filter((t) => t.type === "Income")
    .reduce((sum, t) => sum + t.amount, 0);

  totalExpense = transactions
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Include the initial balance in the balance calculation
  balance = initialBalance + totalIncome - totalExpense;

  // Update the DOM
  document.getElementById("total-income").textContent = `$${totalIncome.toFixed(2)}`;
  document.getElementById("total-expense").textContent = `$${totalExpense.toFixed(2)}`;
  document.getElementById("balance").textContent = `$${balance.toFixed(2)}`;
}

// Handle setting the initial balance
document.getElementById("initial-balance-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const initialBalanceInput = document.getElementById("initial-balance");
  const initialBalanceValue = parseFloat(initialBalanceInput.value);

  if (isNaN(initialBalanceValue) || initialBalanceValue < 0) {
    alert("Please enter a valid initial balance!");
    return;
  }

  // Update the initial balance and current balance
  initialBalance = initialBalanceValue; // Store in the global variable
  balance = initialBalanceValue; // Initialize the balance

  // Update the dashboard to reflect the new initial balance
  updateDashboard();

  // Clear the input field
  initialBalanceInput.value = "";

  // Alert the user
  alert("Initial balance set successfully!");
});

// Handle adding income
document.getElementById("income-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const incomeAmountInput = document.getElementById("income-amount");
  const incomeAmount = parseFloat(incomeAmountInput.value);

  if (isNaN(incomeAmount) || incomeAmount <= 0) {
    alert("Please enter a valid income amount!");
    return;
  }

  // Add the income to total income and update the balance
  totalIncome += incomeAmount; // Add to total income
  balance += incomeAmount; // Add income to the current balance

  // Add the income transaction to the transaction array
  transactions.push({
    category: "Income",
    amount: incomeAmount,
    type: "Income",
    date: new Date().toISOString().split("T")[0], // Add the current date
  });

  // Update the dashboard and charts
  updateDashboard();
  renderCharts();

  // Alert the user and reset the form
  alert("Income added!");
  incomeAmountInput.value = ""; // Clear the input field
});

// Handle adding expense transactions
document.getElementById("transaction-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const category = document.getElementById("category").value; // Get the selected category
  const amountInput = document.getElementById("amount");
  const amount = parseFloat(amountInput.value);

  if (!category || isNaN(amount) || amount <= 0) {
    alert("Please enter valid transaction details!");
    return;
  }

  // Add the transaction as an "Expense"
  transactions.push({
    category,
    amount,
    type: "Expense",
    date: new Date().toISOString().split("T")[0], // Add the current date
  });

  // Update the dashboard and charts
  updateDashboard();
  renderCharts();

  // Alert the user and reset the form
  alert("Transaction added!");
  e.target.reset(); // Reset the form fields
});

// Render charts
let pieChart;
let lineChart;
let currentView = "day"; // Default view for the line chart

function renderCharts() {
  if (transactions.length === 0) return;

  // Calculate category totals for the pie chart
  const categoryTotals = {};
  transactions.forEach((t) => {
    if (t.type === "Expense") {
      // Group expenses by category
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    }
  });

  // Prepare pie chart data
  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: ["#007bff", "#ffc107", "#28a745", "#dc3545", "#17a2b8"],
      },
    ],
  };

  // Destroy existing pie chart
  if (pieChart) pieChart.destroy();

  // Render pie chart
  const ctxPie = document.getElementById("expensePieChart").getContext("2d");
  pieChart = new Chart(ctxPie, {
    type: "pie",
    data: pieData,
  });

  // Prepare line chart labels and data based on the selected view
  let lineLabels = [];
  const cumulativeBalance = [];
  let currentBalance = 0;

  if (currentView === "day") {
    transactions.forEach((t) => {
      lineLabels.push(t.date); // Use the date for daily transactions
      currentBalance += t.type === "Income" ? t.amount : -t.amount;
      cumulativeBalance.push(currentBalance);
    });
  } else if (currentView === "week") {
    const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const weekTotals = {};

    transactions.forEach((t) => {
      const day = new Date(t.date).getDay();
      const dayName = weekDays[day];
      weekTotals[dayName] = (weekTotals[dayName] || 0) + (t.type === "Income" ? t.amount : -t.amount);
    });

    lineLabels = Object.keys(weekTotals);
    lineLabels.forEach((label) => {
      cumulativeBalance.push(weekTotals[label]);
    });
  } else if (currentView === "month") {
    const dailyTotals = {};

    transactions.forEach((t) => {
      const date = t.date;
      dailyTotals[date] = (dailyTotals[date] || 0) + (t.type === "Income" ? t.amount : -t.amount);
    });

    lineLabels = Object.keys(dailyTotals);
    lineLabels.forEach((label) => {
      cumulativeBalance.push(dailyTotals[label]);
    });
  } else if (currentView === "year") {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthTotals = {};

    transactions.forEach((t) => {
      const month = new Date(t.date).getMonth();
      const monthName = months[month];
      monthTotals[monthName] = (monthTotals[monthName] || 0) + (t.type === "Income" ? t.amount : -t.amount);
    });

    lineLabels = Object.keys(monthTotals);
    lineLabels.forEach((label) => {
      cumulativeBalance.push(monthTotals[label]);
    });
  }

  // Prepare line chart data
  const lineData = {
    labels: lineLabels,
    datasets: [
      {
        label: "Cumulative Balance",
        data: cumulativeBalance,
        borderColor: "#007bff",
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  // Destroy existing line chart
  if (lineChart) lineChart.destroy();

  // Render line chart
  const ctxLine = document.getElementById("incomeExpenseLineChart").getContext("2d");
  lineChart = new Chart(ctxLine, {
    type: "line",
    data: lineData,
    options: {
      tension: 0.4, // Smooth the line
      scales: {
        x: {
          grid: { color: "rgba(255, 255, 255, 0.1)" },
        },
        y: {
          grid: { color: "rgba(255, 255, 255, 0.1)" },
          ticks: { color: "#ffffff" },
        },
      },
      plugins: {
        legend: { labels: { color: "#ffffff" } },
      },
    },
  });
}

// Add event listeners to switch views
document.getElementById("view-selector").addEventListener("change", (e) => {
  currentView = e.target.value; // Update the view
  renderCharts(); // Re-render charts with the new view
});

// Smooth scroll for navbar links
document.querySelectorAll('.navbar-links a').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = e.target.getAttribute('href').substring(1);
    document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
  });
});


// Initial render
updateDashboard();

// app.js or server.js - email service 
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Import your email service module
const { sendEmailNotification } = require('./emailService');

// Example route to send a verification email
app.post('/api/send-verification', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  // Generate a token (for a real app, generate a secure random token)
  const token = '12345';  // Replace with your token generation logic

  // Build the email content
  const message = `
    <h1>Thanks for signing up!</h1>
    <p>Click <a href="http://yourdomain.com/email-response?token=${token}">here</a> to verify your account.</p>
  `;

  sendEmailNotification(email, 'Welcome to Our App', message, (err, info) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to send email.' });
    }
    res.json({ success: true, response: info });
  });
});

// Endpoint to handle the email response (e.g., verification)
app.get('/email-response', async (req, res) => {
  try {
    const token = req.query.token;
    // 1) Validate the token (e.g., look it up in your database)
    // 2) Mark the user as verified or perform any other action
    // 3) Send a success page or message
    res.send('Thank you for clicking the link! Your account is now verified.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong.');
  }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

