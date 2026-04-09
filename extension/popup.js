var senderInput = document.getElementById("sender");
var subjectInput = document.getElementById("subject");
var bodyInput = document.getElementById("body");
var analyzeButton = document.getElementById("analyzeButton");
var scanTabButton = document.getElementById("scanTabButton");
var resultPanel = document.getElementById("result");
var scoreLabel = document.getElementById("scoreLabel");
var levelLabel = document.getElementById("levelLabel");
var summary = document.getElementById("summary");
var findings = document.getElementById("findings");
var statusMessage = document.getElementById("status");

function setStatus(message) {
  statusMessage.textContent = message;
}

function renderResult(result) {
  resultPanel.classList.remove("hidden");
  scoreLabel.textContent = result.score + "/100";
  levelLabel.textContent = result.level;
  summary.textContent = result.summary;
  findings.innerHTML = "";
  setStatus("Analysis complete.");

  var topFindings = result.findings.slice(0, 4);
  if (!topFindings.length) {
    var fallback = document.createElement("li");
    fallback.textContent = "No strong phishing signals detected from this content.";
    findings.appendChild(fallback);
    return;
  }

  topFindings.forEach(function (finding) {
    var item = document.createElement("li");
    item.textContent = finding.title + ": " + finding.detail;
    findings.appendChild(item);
  });
}

function analyzePayload(source) {
  var result = window.PhishingAnalyzerCore.analyzeEmail({
    sender: senderInput.value,
    subject: subjectInput.value,
    body: bodyInput.value,
    source: source || "manual"
  });

  renderResult(result);
}

analyzeButton.addEventListener("click", function () {
  setStatus("Running manual analysis...");
  analyzePayload("manual");
});

scanTabButton.addEventListener("click", function () {
  setStatus("Scanning the active tab...");
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var activeTab = tabs && tabs[0];
    if (!activeTab || !activeTab.id) {
      setStatus("Could not access the active tab.");
      bodyInput.value = "Unable to access the active tab.";
      analyzePayload("manual");
      return;
    }

    chrome.tabs.sendMessage(activeTab.id, { type: "SCAN_PAGE" }, function (response) {
      if (chrome.runtime.lastError || !response) {
        setStatus("This tab could not be scanned automatically. Paste the email content instead.");
        bodyInput.value = "Could not scan this tab. Try copying the email content into the extension instead.";
        analyzePayload("manual");
        return;
      }

      senderInput.value = response.sender || "";
      subjectInput.value = response.subject || "";
      bodyInput.value = response.body || "";
      setStatus("Content extracted from " + (response.provider || "page") + ". Running analysis...");
      analyzePayload("page-scan");
    });
  });
});
