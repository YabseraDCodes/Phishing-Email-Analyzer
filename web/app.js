var form = document.getElementById("analysisForm");
var senderInput = document.getElementById("sender");
var subjectInput = document.getElementById("subject");
var bodyInput = document.getElementById("body");
var resultsPanel = document.getElementById("results");
var riskScore = document.getElementById("riskScore");
var riskLevel = document.getElementById("riskLevel");
var summary = document.getElementById("summary");
var findingsList = document.getElementById("findingsList");
var recommendationsList = document.getElementById("recommendationsList");
var urlsList = document.getElementById("urlsList");
var emailsList = document.getElementById("emailsList");
var emlFile = document.getElementById("emlFile");
var loadSample = document.getElementById("loadSample");
var clearForm = document.getElementById("clearForm");

function setList(target, items, renderItem) {
  target.innerHTML = "";

  if (!items.length) {
    var empty = document.createElement("li");
    empty.textContent = "Nothing notable detected.";
    target.appendChild(empty);
    return;
  }

  items.forEach(function (item) {
    target.appendChild(renderItem(item));
  });
}

function renderFinding(finding) {
  var li = document.createElement("li");
  var meta = document.createElement("div");
  meta.className = "finding-meta";

  var title = document.createElement("strong");
  title.textContent = finding.title;

  var badge = document.createElement("span");
  badge.className = "badge " + finding.severity;
  badge.textContent = finding.severity + " +" + finding.points;

  var detail = document.createElement("p");
  detail.textContent = finding.detail;
  detail.style.margin = "0";
  detail.style.color = "var(--muted)";

  meta.appendChild(title);
  meta.appendChild(badge);
  li.appendChild(meta);
  li.appendChild(detail);
  return li;
}

function renderTextItem(text) {
  var li = document.createElement("li");
  li.textContent = text;
  return li;
}

function parseEml(rawContent) {
  var senderMatch = rawContent.match(/^from:\s*(.+)$/im);
  var subjectMatch = rawContent.match(/^subject:\s*(.+)$/im);
  var bodyParts = rawContent.split(/\r?\n\r?\n/);

  return {
    sender: senderMatch ? senderMatch[1].trim() : "",
    subject: subjectMatch ? subjectMatch[1].trim() : "",
    body: bodyParts.length > 1 ? bodyParts.slice(1).join("\n\n").trim() : rawContent.trim()
  };
}

function updateResults(result) {
  resultsPanel.classList.remove("hidden");
  riskScore.textContent = result.score;
  riskLevel.textContent = result.level;
  summary.textContent = result.summary;

  setList(findingsList, result.findings, renderFinding);
  setList(recommendationsList, result.recommendations, renderTextItem);
  setList(urlsList, result.extracted.urls, renderTextItem);
  setList(emailsList, result.extracted.emailAddresses, renderTextItem);
}

function analyzeCurrentForm() {
  var result = window.PhishingAnalyzerCore.analyzeEmail({
    sender: senderInput.value,
    subject: subjectInput.value,
    body: bodyInput.value,
    source: "manual"
  });

  updateResults(result);
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  analyzeCurrentForm();
});

loadSample.addEventListener("click", function () {
  senderInput.value = "support@paypa1-security-alert.xyz";
  subjectInput.value = "Final warning: your account will be suspended in 2 hours";
  bodyInput.value = [
    "Dear customer,",
    "",
    "We noticed unusual activity on your account. Verify your login immediately to avoid suspension.",
    "Click here now: https://bit.ly/secure-paypal-review",
    "",
    "Please confirm your password and billing information to keep your account active.",
    "",
    "Regards,",
    "Security Team"
  ].join("\n");
  analyzeCurrentForm();
});

clearForm.addEventListener("click", function () {
  senderInput.value = "";
  subjectInput.value = "";
  bodyInput.value = "";
  resultsPanel.classList.add("hidden");
});

emlFile.addEventListener("change", function (event) {
  var file = event.target.files && event.target.files[0];
  if (!file) {
    return;
  }

  var reader = new FileReader();
  reader.onload = function () {
    var parsed = parseEml(String(reader.result || ""));
    senderInput.value = parsed.sender;
    subjectInput.value = parsed.subject;
    bodyInput.value = parsed.body;
    analyzeCurrentForm();
  };
  reader.readAsText(file);
});
