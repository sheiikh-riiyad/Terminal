document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const message = document.getElementById("login-message");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Reset styles
    emailInput.style.border = "";
    passwordInput.style.border = "";
    message.textContent = "";
    message.style.color = "";

    // Basic validation
    if (!email || !password) {
      message.textContent = "Please fill in both email and password.";
      message.style.color = "red";
      if (!email) emailInput.style.border = "1px solid red";
      if (!password) passwordInput.style.border = "1px solid red";
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      message.textContent = "Please enter a valid email.";
      message.style.color = "red";
      message.style.fontFamily = "bold";
      emailInput.style.border = "1px solid red";
      return;
    }

    try {
      const response = await fetch("http://localhost:8889/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (response.ok && result.user) {
        const { username, contact, email } = result.user;






        sessionStorage.setItem("username", username);
        sessionStorage.setItem("contact", contact);
        sessionStorage.setItem("email", email);

        

        console.log(username, contact, email)

        message.textContent = "Login successful.";
        message.style.color = "green";


       
        window.electronAPI.loginSuccess({
          username,
          contact,
          email
        });



        // Optional redirect
        // setTimeout(() => {
        //   window.location.href = "dashboard.html";
        // }, 1000);
      } else {
        message.textContent = result.message || "Incorrect email or password.";
        message.style.color = "red";
        message.style.fontFamily = "bold";
        emailInput.style.border = "1px solid red";
        passwordInput.style.border = "1px solid red";
      }
    } catch (err) {
      console.error("Login error:", err);
      message.textContent = "Server error. Please try again.";
      message.style.color = "red";
    }
  });
});
