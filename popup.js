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

// Form submission
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("job-preview-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      // Get user auth token
      const token = await chrome.storage.local.get("authToken");

      // Construct FormData for submission
      const formData = new FormData(
        document.getElementById("job-preview-form"),
      );

      // Show loading, disable form
      const form = e.target;
      const overlay = document.getElementById("loading-overlay");
      const confirmBtn = document.getElementById("confirmBtn");

      form.classList.add("loading");
      overlay.classList.remove("loading-hidden");
      confirmBtn.textContent = "Saving...";

      try {
        const response = await fetch("http://localhost:8000/api/create", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.authToken}`,
            Accept: "application/json",
          },
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          chrome.storage.local.remove("currentJob");
          document.getElementById("job-preview-form").style.display = "none";
          document.getElementById("job-preview-form").reset();

          document.getElementById("status").textContent = data.message;
        }
      } catch (error) {
        console.log(error);
        document.getElementById("status").textContent =
          "Add failed - something went wrong.";
      } finally {
        form.classList.remove("loading");
        overlay.classList.add("loading-hidden");
        confirmBtn.textContent = "Confirm";
      }
    });
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
        document.getElementById("job-title-text").textContent =
          result.currentJob.title;
        document.getElementById("job-title").value = result.currentJob.title;

        // Company
        document.getElementById("job-company-text").textContent =
          result.currentJob.company;
        document.getElementById("job-company").value =
          result.currentJob.company;

        // Industry
        document.getElementById("job-industry-text").textContent =
          result.currentJob.industry;
        document.getElementById("job-industry").value =
          result.currentJob.industry;

        // Type
        document.getElementById("job-type-text").textContent =
          result.currentJob.type;
        document.getElementById("job-type").value = result.currentJob.type;

        // Location
        chrome.storage.local.get(["countries"], (result) => {
          const locationElem = document.getElementById("job-location");

          if (result.countries) {
            result.countries.sort((a, b) => a.name.localeCompare(b.name));

            result.countries.forEach((country) => {
              const option = document.createElement("option");
              option.value = country.id;
              option.textContent = country.name;

              locationElem.append(option);
            });
          }
        });

        // Advertised Salary
        document.getElementById("advertised-salary-text").textContent =
          result.currentJob.salary ?? "N/A";
        document.getElementById("advertised_salary").value =
          result.currentJob.salary;

        // URL
        document.getElementById("job_link").value = result.currentJob.url;

        // Preview
        document.getElementById("job-preview-form").style.display = "block";
      }
    });
  } else {
    document.getElementById("logout").style.display = "none";
    document.getElementById("loginForm").style.display = "flex";
  }
});
