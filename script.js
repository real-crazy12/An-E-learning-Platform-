
// Dark Mode Toggle
const darkToggle = document.querySelector(".toggle-icon");

if (darkToggle) {
  const isDark = localStorage.getItem("theme") === "dark";

  // Set the theme on page load
  document.body.setAttribute("data-bs-theme", isDark ? "dark" : "light");

  // Adjust the button appearance
  darkToggle.classList.toggle("on", isDark);  // ON when dark mode is active
  darkToggle.classList.toggle("off", !isDark); // OFF when light mode is active
  darkToggle.classList.toggle("fa-toggle-on", isDark); // Solid toggle for dark mode
  darkToggle.classList.toggle("fa-toggle-off", !isDark); // Regular toggle for light mode

  darkToggle.onclick = function () {
    const isDark = document.body.getAttribute("data-bs-theme") === "dark";

    // Switch theme
    document.body.setAttribute("data-bs-theme", isDark ? "light" : "dark");

    // Update the button classes
    darkToggle.classList.toggle("on", !isDark);
    darkToggle.classList.toggle("off", isDark);
    darkToggle.classList.toggle("fa-toggle-on", !isDark);
    darkToggle.classList.toggle("fa-toggle-off", isDark);

    // Save preference
    localStorage.setItem("theme", isDark ? "light" : "dark");
  };
}

// Toggle between login and signup forms
function toggleForm() {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (loginForm.classList.contains("active")) {
      loginForm.classList.remove("active");
      loginForm.style.opacity = "0";
      
      setTimeout(() => {
          loginForm.style.display = "none";
          signupForm.style.display = "block";
          signupForm.style.opacity = "0"; // Start hidden for smooth fade-in
          setTimeout(() => signupForm.classList.add("active"), 10);
          signupForm.style.opacity = "1"; // Fade in
      }, 300);
  } else {
      signupForm.classList.remove("active");
      signupForm.style.opacity = "0";

      setTimeout(() => {
          signupForm.style.display = "none";
          loginForm.style.display = "block";
          loginForm.style.opacity = "0"; // Start hidden for smooth fade-in
          setTimeout(() => loginForm.classList.add("active"), 10);
          loginForm.style.opacity = "1"; // Fade in
      }, 300);
  }
}
// Ensure only login form is visible when the page loads
window.addEventListener("load", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  loginForm.style.display = "block"; // Ensure login is visible first
  signupForm.style.display = "none"; // Ensure signup is hidden
  setTimeout(() => loginForm.classList.add("active"), 10);
});


// Toggle password visibility
document.addEventListener("click", (event) => {
    if (event.target.closest(".toggle-password")) {
        const toggleButton = event.target.closest(".toggle-password");
        const targetId = toggleButton.getAttribute("data-target");
        const passwordField = document.getElementById(targetId);
        const icon = toggleButton.querySelector("i");

        if (passwordField) {
            passwordField.type = passwordField.type === "password" ? "text" : "password";
            icon.classList.toggle("fa-eye");
            icon.classList.toggle("fa-eye-slash");
        }
    }
});

// Display Login modal(alert) with a message
const alertModalInstance = new bootstrap.Modal(document.getElementById("alertModal"));

function showModal(message) {
  const modalBody = document.getElementById("alertModalBody");
  if (modalBody) {
      modalBody.textContent = message;
      alertModalInstance.show();
  } else {
      console.error("Modal body element not found.");
  }
}


// Open modal on link click
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const resetModal = new bootstrap.Modal(document.getElementById("resetPasswordModal"));

forgotPasswordLink.addEventListener("click", () => {
  resetModal.show();
});

// Handle form submit
const resetPasswordForm = document.getElementById("resetPasswordForm");

resetPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("resetEmail").value.trim();
  if (!email) {
    showModal("Please enter your email address.");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/forgot-password", {
      method: "POST", // Ensure it's POST
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Something went wrong.");

    resetModal.hide();
    showModal("Reset link sent! Please check your email.");
  } catch (err) {
    showModal(err.message);
  }
});

// Show spinner
// Hide loading spinner once page fully loads
window.addEventListener("load", () => {
    const loadingSpinner = document.getElementById("loadingSpinner");
    if (loadingSpinner) {
      loadingSpinner.style.display = "none";
    }
  });
  
  

  

  async function handleLogin(event) {
    event.preventDefault();
  
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const rememberMe = document.getElementById("rememberMe").checked;
  
    if (!email || !password) {
        showModal("Please fill in all the fields.");
        return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    
      const data = await response.json();
    
      if (!response.ok) {
        if (response.status === 429) {
          // 🔐 Rate limit error (too many attempts)
          showModal(data.error || "⛔ Too many failed attempts. Please try again later.");
        } else {
          // ❌ Wrong email or password
          showModal(data.error || "Invalid email or password.");
        }
        return; // Stop here
      }
    
      // ✅ Login success
      if (data.token) {
        localStorage.setItem("authToken", data.token);
    
        if (rememberMe) {
          localStorage.setItem("savedEmail", email);
          localStorage.setItem("savedPassword", password);
        } else {
          localStorage.removeItem("savedEmail");
          localStorage.removeItem("savedPassword");
        }
    
        showModal("✅ Login successful!");
        setTimeout(() => (window.location.href = "index.html"), 1500);
      } else {
        // Just in case something slipped through
        showModal(data.error || "Login failed. Please try again.");
      }
    
    } catch (error) {
      console.error("Error during login:", error);
    
      // Handle unexpected fetch/network errors
      if (error.message.includes("429")) {
        showModal("⛔ You're temporarily locked out. Try again in a few minutes.");
      } else {
        showModal("🚫 Unable to connect to the server. Please check your connection or try again later.");
      }
    }
  }

document.getElementById("loginForm").onsubmit = handleLogin;

// Auto-fill saved credentials
window.addEventListener("load", () => {
  document.getElementById("loginEmail").value = localStorage.getItem("savedEmail") || "";
  document.getElementById("loginPassword").value = localStorage.getItem("savedPassword") || "";
});


// Sign-Up form submission

function handleSignup(event) {
  event.preventDefault(); // Prevent page reload

  // Get form input values
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const confirmPassword = document.getElementById("signupConfirmPassword").value.trim();
  const recaptchaResponse = grecaptcha.getResponse(); // reCAPTCHA token

  // Validation checks
  if (!email || !password || !confirmPassword) {
      showModal("Please fill in all fields.");
      return;
  }

  if (password !== confirmPassword) {
      showModal("Passwords do not match.");
      return;
  }

  // Submit the signup request
  fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, confirmPassword, recaptchaResponse }),
  })
      .then((response) => response.json())
      .then((data) => {
          if (data.message) {
              // Success: Show success modal and redirect to login
              showModal(data.message); // Show success message
              setTimeout(() => {
                  window.location.href = "login.html"; // Redirect to login page
              }, 1500);
          } else {
              // Handle errors sent by the server
              showModal(data.error || "Registration failed. Please try again.");
          }
      })
      .catch((error) => {
          // Handle network or server errors
          console.error("Error during registration:", error);
          showModal("Unable to connect to the server.");
      });
}

// Attach the event listener to the signup form
document.getElementById("signupForm").onsubmit = handleSignup;

//carousel control
document.addEventListener("DOMContentLoaded", function () {
  const messages = [
    "Welcome to CDS (Create, Develop and Strive) Elearning Platform",
    " Your future awaits " ,
    "Learn anytime, anywhere, at your pace"
  ];

  const messageEl = document.getElementById("carouselMessage");
  let index = 0;

  function slideMessage() {
    messageEl.style.opacity = 0;
    messageEl.style.transform = "translateX(-100%)";

    setTimeout(() => {
      messageEl.style.transition = "none";
      messageEl.style.transform = "translateX(100%)";
      void messageEl.offsetWidth;
      messageEl.textContent = messages[index];
      messageEl.style.transition = "transform 0.6s ease-in-out, opacity 0.6s ease-in-out";
      messageEl.style.opacity = 1;
      messageEl.style.transform = "translateX(0%)";

      index = (index + 1) % messages.length;
    }, 600);
  }

  slideMessage();
  setInterval(slideMessage, 4000);
});


