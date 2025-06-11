document.addEventListener("DOMContentLoaded", function () {
  const loveIcons = document.querySelectorAll(".love-icon");
  let favoriteCourses = JSON.parse(localStorage.getItem("favorites")) || [];

  // Toast setup
  const toastNotification = new bootstrap.Toast(
    document.getElementById("toastNotification")
  );
  const toastMessage = document.getElementById("toastMessage");

  loveIcons.forEach((icon) => {
    const isSelected = favoriteCourses.some(
      (fav) => fav.id === icon.dataset.id
    );
    if (isSelected) {
      icon.classList.add("fa-solid", "selected");
      icon.classList.remove("fa-regular");
    } else {
      icon.classList.add("fa-regular");
    }

    icon.onclick = function () {
      const course = {
        id: icon.dataset.id,
        title: icon.dataset.title,
        description: icon.dataset.description,
        image: icon.dataset.image,
        link: icon.dataset.link,
      };

      icon.classList.toggle("fa-regular");
      icon.classList.toggle("fa-solid");
      icon.classList.toggle("selected");

      if (icon.classList.contains("selected")) {
        // Add to favorites
        const alreadyExists = favoriteCourses.some(
          (fav) => fav.id === course.id
        );
        if (!alreadyExists) {
          favoriteCourses.push(course);
          localStorage.setItem("favorites", JSON.stringify(favoriteCourses));
        }

        // Show Modal for Add
        const modal = new bootstrap.Modal(
          document.getElementById("favoriteModal")
        );
        modal.show();
      } else {
        // Remove from favorites
        favoriteCourses = favoriteCourses.filter(
          (fav) => fav.id !== course.id
        );
        localStorage.setItem("favorites", JSON.stringify(favoriteCourses));

        // Show Toast for Remove with Undo option
        toastMessage.innerHTML = `"${course.title}" has been removed from favorites! 
          <button id="undoRemove" class="btn btn-link text-white">Undo</button>`;
        toastNotification.show();

        // Undo Removal
        document.getElementById("undoRemove").addEventListener("click", function () {
          const alreadyExists = favoriteCourses.some(c => c.id === course.id);
          if (!alreadyExists) {
            favoriteCourses.push(course);
            localStorage.setItem("favorites", JSON.stringify(favoriteCourses));
          }

          toastNotification.hide();
          icon.classList.add("fa-solid", "selected");
          icon.classList.remove("fa-regular");

          updateFavoritesCount();
          renderFavorites(); // ✅ Restore it to the UI
        });
      }

      updateFavoritesCount();
      renderFavorites(); // Optional: re-render on every toggle for full sync
    };
  });

  // 👇 Function to render all favorites to the page
  function renderFavorites() {
    const favoritesContainer = document.getElementById("favorites-container");
    if (!favoritesContainer) return; // In case you're not on the favorites page

    favoritesContainer.innerHTML = "";

    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (storedFavorites.length === 0) {
      favoritesContainer.innerHTML = "<p>No favorites yet. Add some courses!</p>";
      return;
    }

    storedFavorites.forEach((course) => {
      if (course && course.id && course.title && course.image && course.link) {
        const courseCard = document.createElement("div");
        courseCard.className = "col-md-4 my-3";
        courseCard.innerHTML = `
          <div class="card">
            <img class="card-img-top" src="${course.image}" alt="${course.title}">
            <div class="card-body text-center">
              <h5 class="card-title"><a href="${course.link}" class="links">${course.title}</a></h5>
              <p class="card-text">${course.description}</p>
            </div>
          </div>
        `;
        favoritesContainer.appendChild(courseCard);
      }
    });
  }

  // 👇 Function to update the favorites count
  function updateFavoritesCount() {
    const favoritesCount = document.getElementById("favorites-count");
    if (!favoritesCount) return;

    const currentFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const validFavorites = currentFavorites.filter((fav) => fav && fav.id);

    favoritesCount.innerText = validFavorites.length;

    favoritesCount.classList.add("count-animate");
    setTimeout(() => {
      favoritesCount.classList.remove("count-animate");
    }, 300);
  }

  // Initial load
  updateFavoritesCount();
  renderFavorites();
});

//Star Rating System
document.addEventListener("DOMContentLoaded", function () {
  // Select all cards
  const cards = document.querySelectorAll(".card");

  // Loop through each card
  cards.forEach((card, index) => {
    const stars = card.querySelectorAll(".fa-star"); // Get all stars for the current card
    const userRatingDisplay = card.querySelector("#user-rating"); // Rating display for the current card
    let userRating = 0; // Default rating is 0

    // Load previous rating from localStorage if available
    const cardId = card.getAttribute("data-card-id") || index;
    const storedRating = localStorage.getItem(`userRating-${cardId}`);
    if (storedRating) {
      userRating = parseInt(storedRating);
      updateRatingDisplay(card, userRating); // Update the rating UI for the card
    }

    // Add click event listeners to the stars for this specific card
    stars.forEach((star) => {
      star.addEventListener("click", function () {
        const rating = parseInt(star.getAttribute("data-rating"));

        if (userRating === rating) {
          // If the same star is clicked again, reset the rating for this card
          resetRating(card);
          userRating = 0;
        } else {
          // Otherwise, set the new rating for this card
          userRating = rating;
          localStorage.setItem(`userRating-${cardId}`, userRating);
          updateRatingDisplay(card, userRating);
        }
      });
    });
  });

  // Function to update the rating display (stars and user rating text)
  function updateRatingDisplay(card, rating) {
    const stars = card.querySelectorAll(".fa-star");
    const userRatingDisplay = card.querySelector("#user-rating");

    // Update the user rating text
    userRatingDisplay.innerText = `Your Rating: ${rating}`;

    // Update the stars display
    stars.forEach((star) => {
      const starRating = parseInt(star.getAttribute("data-rating"));
      if (starRating <= rating) {
        star.classList.add("fa-solid");
        star.classList.remove("fa-regular");
      } else {
        star.classList.add("fa-regular");
        star.classList.remove("fa-solid");
      }
    });
  }

  // Function to reset the rating for a specific card
  function resetRating(card) {
    const stars = card.querySelectorAll(".fa-star");
    const userRatingDisplay = card.querySelector("#user-rating");

    // Reset rating to 0
    const userRating = 0;
    userRatingDisplay.innerText = `Your Rating: ${userRating}`;

    // Deselect all stars
    stars.forEach((star) => {
      star.classList.add("fa-regular");
      star.classList.remove("fa-solid");
    });

    // Remove rating from localStorage
    const cardId = card.getAttribute("data-card-id"); // Get card ID to store in localStorage
    localStorage.removeItem(`userRating-${cardId}`);
  }
});

// Dark Mode Toggle
const darkToggle = document.querySelector(".toggle-icon");

if (darkToggle) {
  const isDark = localStorage.getItem("theme") === "dark";

  // Set the theme on page load
  document.body.setAttribute("data-bs-theme", isDark ? "dark" : "light");

  // Adjust the button appearance
  darkToggle.classList.toggle("on", isDark); // ON when dark mode is active
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

// Back to Top Button
const backToTopButton = document.getElementById("backToTop");
if (backToTopButton) {
  window.onscroll = function () {
    if (
      document.body.scrollTop > 20 ||
      document.documentElement.scrollTop > 20
    ) {
      backToTopButton.style.display = "block";
    } else {
      backToTopButton.style.display = "none";
    }
  };

  backToTopButton.onclick = function () {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE, and Opera
  };
}

// Quotes Array and Random Quote Display
const quotes = [
  '"Success usually comes to those who are too busy to be looking for it." – Henry David Thoreau',
  '"Don’t give up,the legs that give up will not see the Benz GLE tomorrow"-Bismark Cudjoe',
  '"Hardships often prepare ordinary people for an extraordinary destiny." – C.S. Lewis',
  '"You don’t have to be great to start, but you have to start to be great." – Zig Ziglar',
  '"Education is the most powerful weapon which you can use to change the world." - Nelson Mandela',
  '"The only limit to our realization of tomorrow will be our doubts of today." - Franklin D. Roosevelt',
  '"Success is not final, failure is not fatal: It is the courage to continue that counts." - Winston Churchill',
  '"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt',
  '"It does not matter how slowly you go as long as you do not stop." - Confucius',
  '"It’s not whether you get knocked down, it’s whether you get up." – Vince Lombardi',
  '"Your education is a dress rehearsal for a life that is yours to lead." - Nora Ephron',
  '"What we learn with pleasure we never forget." - Alfred Mercier',
  '"Study Today or Regret Tomorrow. Choose your pain." - Seyiram',
  ' "Success is the sum of small efforts, repeated day in and day out." – Robert Collier',
  '"The best way to predict your future is to create it." - Peter Drucker',
  '"Opportunities don\'t happen. You create them." – Chris Grosser',
  '"The only way to do great work is to love what you do." - Steve Jobs',
  '"Dream big and dare to fail." - Norman Vaughan',
  '"You may encounter many defeats, but you must not be defeated." – Maya Angelou',
  "It always seems impossible until it's done. – Nelson Mandela",
  'Keep away from those who try to belittle your ambitions. Small people always do that, but the really great make you feel that you, too, can become great." – Mark Twain',
  '"The secret of getting ahead is getting started." – Mark Twain',
  '"What lies behind us and what lies before us are tiny matters compared to what lies within us." – Ralph Waldo Emerson',
  '"The beautiful thing about learning is that no one can take it away from you." – B.B. King',
  "I have not failed. I've just found 10,000 ways that won't work. – Thomas Edison",
  "Believe you can and you're halfway there. – Theodore Roosevelt",
  "All our dreams can come true, if we have the courage to pursue them. – Walt Disney",
  "Don’t watch the clock; do what it does. Keep going.– Sam Levenson",
  "The only limit to our realization of tomorrow is our doubts of today.– Franklin D. Roosevelt",
  "Live as if you were to die tomorrow. Learn as if you were to live forever. – Mahatma Gandhi",
  '"Mistakes are what guide you through life so don\'t give up when you make a lot instead take a break to reset" - Tsidi Seth',
  '"A person who never made a mistake never tried anything new." – Albert Einstein',
  '"Doubt kills more dreams than failure ever will." – Suzy Kassem',
  '"It’s not whether you get knocked down, it’s whether you get up." – Vince Lombardi',
  '"The man who moves a mountain begins by carrying away small stones." – Confucius',
  '"I can\'t change the direction of the wind, but I can adjust my sails to always reach my destination." – Jimmy Dean',
  '"The greatest glory in living lies not in never falling, but in rising every time we fall." – Nelson Mandela',
  "Never give up on a dream just because of the time it will take to accomplish it. The time will pass anyway. – Earl Nightingale",
  '"Education, the key to success. this cliche often proves true at certain instances in life so holdfast, don\'t give up and forge on keeping your goal in sight. - Davis Owusu',
];

const quoteElement = document.getElementById("quote");

if (quoteElement) {
  function displayRandomQuote() {
    // Fade out before changing the quote
    quoteElement.classList.remove("fade-in");
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      quoteElement.innerHTML = quotes[randomIndex];

      // Fade in effect
      quoteElement.classList.add("fade-in");
    }, 500); // Wait 0.5s before changing text
  }

  // Display a random quote on page load
  displayRandomQuote();

  // Automatically update the quote every 10 seconds
  setInterval(displayRandomQuote, 10000);
}
// Array of messages to show in the pop-ups
let messages = [
  "Listen on the Go: Use the TTS feature to convert reading material into audio, allowing you to learn while commuting,",
  "Summarize in your own words: After completing a lesson, summarize key points out loud",
  "If you encounter something unclear, use the AI chat bot to ask specific questions",
  "When using audio content, pause frequently to reflect on what you have learned",
  "Set Mini-Goals: Break down your learning into small goals, like completing a section or mastering a particular concept",
  "Use Flashcards for Revision: Regularly test your knowledge by creating flashcards or quizzes.",
];

let popupContainer = document.getElementById("popupContainer");

function createPopup(message) {
  let popup = document.createElement("div");
  popup.classList.add("popup");
  popup.textContent = message;

  popupContainer.appendChild(popup);
  popup.addEventListener('animationend', () => {
    popup.remove();
  })
}

function showRandomPopup() {
  let randomIndex = Math.floor(Math.random() * messages.length);
  let message = messages[randomIndex];

  createPopup(message);
}

function startRandomPopups() {
  setInterval(showRandomPopup, Math.random() * (10000 - 5000) + 5000);
}

startRandomPopups();

const animatedElement = document.querySelector(".animate-on-scroll");

window.addEventListener("scroll", () => {
  const elementTop = animatedElement.getBoundingClientRect().top;
  const windowHeight = window.innerHeight;

  if (elementTop <= windowHeight) {
    animatedElement.classList.add("visible");
  }
});

// DOM Elements for Search History and Dynamic Search
const searchInput = document.getElementById("course-search");
const searchResults = document.getElementById("search-results");
const searchButton = document.getElementById("search-btn");
const clearHistoryButton = document.getElementById("clear-history-btn"); // Clear history button

// Function to update and display search history
function updateSearchHistory() {
  const searches = JSON.parse(localStorage.getItem("searchHistory")) || [];

  if (searches.length > 0) {
    searchResults.innerHTML = `<ul>${searches
      .map((search, index) => `<li data-index="${index}">${search}</li>`)
      .join("")}</ul>`;
    searchResults.style.display = "block";
  } else {
    searchResults.innerHTML = ""; // Clear if no history
    searchResults.style.display = "none";
  }
}

// Function to clear search history
function clearSearchHistory() {
  localStorage.removeItem("searchHistory");
  console.log("Search history cleared.");
  updateSearchHistory();
}

// Fetch and display dynamic search results from the API
//RredirectOnMatch = false is false by default, meaning it will not redirect unless specified this is so, so that the user can see the suggestions before clicking the search button
async function fetchSearchResults(query, redirectOnMatch = false) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/search-courses?query=${encodeURIComponent(
        query
      )}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch results from API.");
    }

    const results = await response.json();

    // If search button is clicked, check for an exact match and redirect
    if (redirectOnMatch) {
      const exactMatch = results.find(
        (result) => result.title.toLowerCase() === query.toLowerCase()
      );
      if (exactMatch) {
        window.location.href = exactMatch.link; // Redirect to the course link
        return;
      } else {
        console.log("No exact match found.");
      }
    }

    displaySearchResults(results);
  } catch (error) {
    console.error("Error fetching search results:", error);
  }
}

// Function to display search results dynamically (filtered results)
function displaySearchResults(results) {
  searchResults.innerHTML = ""; // Clear previous suggestions

  if (results.length === 0) {
    searchResults.innerHTML = "<li>No courses found.</li>";
    searchResults.style.display = "block";
    return;
  }

  // Display suggestions with clickable links
  results.forEach((result) => {
    const listItem = document.createElement("li");
    // Correct the object property from result.name to result.title
    listItem.innerHTML = `<a href="${result.link}" class="suggestion-link">${result.title}</a>`;
    searchResults.appendChild(listItem);
  });

  searchResults.style.display = "block"; // Show dropdown
}

// Show suggestions on focus
searchInput.addEventListener("focus", function () {
  updateSearchHistory();
  suggestionIndex = -1; // Reset suggestion index
});

// Hide suggestions on blur (clicking outside)
searchInput.addEventListener("blur", function () {
  setTimeout(() => {
    searchResults.style.display = "none";
  }, 200); // Delay to allow clicking on suggestions
});

// Capture user input and save to localStorage
searchButton.addEventListener("click", function () {
  const searchQuery = searchInput.value.trim();

  if (!searchQuery) {
    console.log("Search field is empty. Please enter a course name.");
    return;
  }

  // Save the search to localStorage
  let searches = JSON.parse(localStorage.getItem("searchHistory")) || [];

  // Avoid duplicate entries
  if (!searches.includes(searchQuery)) {
    searches.push(searchQuery);
    localStorage.setItem("searchHistory", JSON.stringify(searches));
  }

  // Fetch search results and try to redirect on exact match
  fetchSearchResults(searchQuery, true); // `true` means we want to redirect on exact match

  console.log("Search history updated:", searches);
  updateSearchHistory();
});

// Use suggestion when clicked
searchResults.addEventListener("click", function (e) {
  if (e.target.tagName === "LI") {
    searchInput.value = e.target.textContent; // Set input value
    searchResults.style.display = "none"; // Hide dropdown
    console.log(`Selected suggestion: ${e.target.textContent}`);
  }
});



// Fetch and display dynamic search results
searchInput.addEventListener("input", function (event) {
  const query = event.target.value.toLowerCase();

  if (query) {
    // Fetch filtered results from the backend API
    fetchSearchResults(query);
  } else {
    searchResults.style.display = "none"; // Hide dropdown if no query
  }
});

// Clear search history when button is clicked
clearHistoryButton.addEventListener("click", clearSearchHistory);

// Initial call to update search history on page load
window.addEventListener("load", updateSearchHistory); 

// Function to show modal with message
function showModal(message) {
  const modalBody = document.getElementById("alertModalBody");
  const modal = new bootstrap.Modal(document.getElementById("alertModal"));
  if (modalBody) {
    modalBody.innerText = message;
    modal.show();
  }
}

// Hide loading spinner
function hideLoading() {
  const loadingSpinner = document.getElementById("loadingSpinner");
  if (loadingSpinner) {
    loadingSpinner.style.display = "none"; // Hide the loading spinner
  }
}

// Main window load function to check authentication and handle session
window.onload = function () {
  const token = localStorage.getItem("authToken");
  if (!token) {
    showModal("You must be logged in to access this page.");
    showLoading();
    setTimeout(() => (window.location.href = "login.html"), 1500);
    return;
  }

  // Verify token with the backend, include 'Bearer' prefix
  fetch("http://localhost:5000/protected-route", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`, // Include 'Bearer ' prefix
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        console.log("Protected route access:", data.message);

        // Show toast if not already shown
        if (!localStorage.getItem("toastShown")) {
          displayToast();
          localStorage.setItem("toastShown", "true");
        }

        // Start session timeout and attach activity listeners
        startSessionTimeout();
        window.addEventListener("mousemove", resetSessionTimeout);
        window.addEventListener("keydown", resetSessionTimeout);
        window.addEventListener("click", resetSessionTimeout);
      } else {
        showModal("Invalid or expired session. Redirecting to login.");
        setTimeout(() => (window.location.href = "login.html"), 1500);
      }
    })
    .catch((error) => {
      console.error("Error verifying token:", error);
      showModal("Unable to verify your session. Redirecting to login.");
      setTimeout(() => (window.location.href = "login.html"), 1500);
    });
};

// Session timeout and warning setup
let sessionTimeout; // Stores the session timeout reference
let warningTimeout; // Stores the warning modal timeout reference

const SESSION_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const WARNING_DURATION = 1 * 60 * 1000; // Warn 1 minute before timeout

// Start session timeout tracking
function startSessionTimeout() {
  clearTimeout(sessionTimeout);
  clearTimeout(warningTimeout);

  sessionTimeout = setTimeout(() => {
    showModal("Your session has expired. You will be logged out.");
    setTimeout(logout, 1500); // Logout after showing the modal
  }, SESSION_DURATION);

  warningTimeout = setTimeout(() => {
    showModal(
      "Your session will expire soon. Click anywhere to stay logged in."
    );
  }, SESSION_DURATION - WARNING_DURATION);
}

// Reset session timeout on user activity
function resetSessionTimeout() {
  console.log("User activity detected, resetting session timer.");
  startSessionTimeout();
}

// Logout function
function logout() {
  showLoading();
  localStorage.removeItem("authToken");
  localStorage.removeItem("toastShown");
  showModal("You have been logged out.");
  setTimeout(() => (window.location.href = "login.html"), 1500);
}

// Function to display the Welcome toast
function displayToast() {
  const toastMessageElement = document.getElementById("debugToastMessage");
  const toastElement = document.getElementById("debugToast");

  if (toastMessageElement && toastElement) {
    // Pick a random message
    const toastMessages = [
      "Welcome to the platform!",
      "Hope you have a productive session!",
      "Good to see you back!",
      "Explore something new today!",
      "Keep learning and growing!",
    ];
    const randomMessage =
      toastMessages[Math.floor(Math.random() * toastMessages.length)];

    // Update the toast message
    toastMessageElement.textContent = randomMessage;

    // Show the toast
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  } else {
    console.error(
      "Toast elements not found. Ensure the HTML structure is correct."
    );
  }
}

// Show loading spinner
function showLoading() {
  const loadingSpinner = document.getElementById("loadingSpinner");
  if (loadingSpinner) {
    loadingSpinner.style.display = "flex";
    setTimeout(() => (loadingSpinner.style.display = "none"), 3000);
  }
}

// Open Chatbot in a New Window (Popup)
let chatWindow;

document.getElementById("chat-icon").addEventListener("click", function () {
  if (!chatWindow || chatWindow.closed) {
    chatWindow = window.open(
      "chatbot.html",
      "Chatbot",
      "width=400,height=600,resizable=yes"
    );

    if (!chatWindow) {
      alert("Please allow pop-ups for this site to use the chatbot.");
    }
  } else {
    chatWindow.focus(); // Bring the existing chat window to the front
  }
});

