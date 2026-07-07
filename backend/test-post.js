const userId = "final-demo-user";
const sessionFeatures = {
  averageHoldTime: 150,
  averageFlightTime: 50,
  typingSpeed: 60,
  backspaceCount: 2,
  errorCount: 1,
  typingDuration: 8.5
};

fetch("https://backend-kappa-five-15.vercel.app/behavior-analysis", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ userId, sessionFeatures, register: true })
})
.then(res => res.json().then(data => ({status: res.status, data})))
.then(console.log)
.catch(console.error);
