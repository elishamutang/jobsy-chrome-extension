// Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (data.token) {
      chrome.storage.local.set({ authToken: data.token }, () => {
        document.getElementById("status").textContent = "Logged in!";
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("logout").style.display = "block";

        // Clear form fields
        document.getElementById("loginForm").reset();
      });
    }
  } catch (error) {
    document.getElementById("status").textContent = "Login failed";
  }
});

// Logout
document.getElementById("logout").addEventListener("click", async (e) => {
  const token = await chrome.storage.local.get("authToken");

  try {
    const response = await fetch("http://localhost:8000/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.authToken}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (data.success) {
      chrome.storage.local.remove("authToken");
      document.getElementById("loginForm").style.display = "flex";
      document.getElementById("logout").style.display = "none";
      document.getElementById("status").textContent = data.message;
      document.getElementById("loginForm").reset();
    }
  } catch (error) {
    document.getElementById("status").textContent = "Logout failed";
  }
});

// Check login status on load
chrome.storage.local.get(["authToken"], (result) => {
  if (result.authToken) {
    document.getElementById("logout").style.display = "block";
    document.getElementById("loginForm").style.display = "none";

    chrome.storage.local.get(["currentJob"], (result) => {
      if (result.currentJob) {
        console.log("Loaded job: ", result.currentJob);

        // Title
        document.getElementById("job-title").textContent =
          result.currentJob.title;

        // Company
        document.getElementById("job-company").textContent =
          result.currentJob.company;

        // Industry
        document.getElementById("job-industry").textContent =
          result.currentJob.industry;

        // Type
        document.getElementById("job-type").textContent =
          result.currentJob.type;

        // Location
        chrome.storage.local.get(["countries"], (result) => {
          const locationElem = document.getElementById("job-location");

          if (result.countries) {
            result.countries.sort((a, b) => a.name.localeCompare(b.name));

            result.countries.forEach((country) => {
              const option = document.createElement("option");
              option.value = country.name;
              option.textContent = country.name;

              locationElem.append(option);
            });
          }
        });

        // Preview
        document.getElementById("job-preview-form").style.display = "block";
      }
    });
  } else {
    document.getElementById("logout").style.display = "none";
    document.getElementById("loginForm").style.display = "flex";
  }
});
