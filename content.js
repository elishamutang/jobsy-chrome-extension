// Check auth status
chrome.storage.local.get(["authToken"], (result) => {
  if (result.authToken) {
    console.log("Jobsy activated");

    // Inject styles.css into page
    const styles = document.createElement("link");
    styles.rel = "stylesheet";
    styles.href = chrome.runtime.getURL("styles.css");
    document.head.appendChild(styles);

    // Detect job listing
    const jobCard = document.querySelector(
      '[data-automation="jobDetailsPage"]',
    );

    if (jobCard) {
      // Job title
      const jobTitle = jobCard.querySelector(
        '[data-automation="job-detail-title"]',
      ).textContent;

      // Company
      const jobCompany = jobCard.querySelector(
        '[data-automation="advertiser-name"]',
      ).textContent;

      // Industry
      const jobIndustry = jobCard.querySelector(
        '[data-automation="job-detail-classifications"]',
      ).textContent;

      // Type
      let jobType = jobCard.querySelector(
        '[data-automation="job-detail-work-type"]',
      ).textContent;

      // Salary (if any)
      const jobSalary = jobCard.querySelector(
        '[data-automation="job-detail-salary"]',
      );

      // Add "Save to Jobsy" button in job details page next to the "Save button"
      const saveBtnParentElem = document.querySelector(
        '[data-testid="jdv-savedjob"]',
      ).parentElement.parentElement;

      const saveToJobsyBtn = document.createElement("button");
      saveToJobsyBtn.textContent = "Save to Jobsy";
      saveToJobsyBtn.classList.add("save-job");

      saveBtnParentElem.append(saveToJobsyBtn);

      // Filter for the following job types
      // - Full time
      // - Part time
      if (jobType.indexOf(" ") !== -1) {
        const jobTypeArr = jobType.split(" ");
        jobType = jobTypeArr.join("-");
      }

      // Listens for button click for "Save to Jobsy" button
      saveToJobsyBtn.addEventListener("click", (e) => {
        console.log(`Found job title: ${jobTitle}`);
        console.log(`Company: ${jobCompany}`);
        console.log(`Industry: ${jobIndustry}`);
        console.log(`Job type: ${jobType}`);

        if (jobSalary) {
          console.log(`Salary: ${jobSalary.textContent}`);
        }

        const jobData = {
          title: jobTitle,
          company: jobCompany,
          industry: jobIndustry,
          type: jobType,
          salary: jobSalary ? jobSalary.textContent : null,
          url: window.location.href,
        };

        // Save temporarily (overwrites previous)
        chrome.storage.local.set({ currentJob: jobData }, () => {
          console.log("Job data saved!");
        });

        // Programmatically open chrome extension popup
        chrome.runtime.sendMessage({ openPopup: true });
      });
    }
  } else {
    console.log("Please login via browser extension.");
  }
});
