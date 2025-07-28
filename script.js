function showSection(id) {
  const sections = document.querySelectorAll("section");
  sections.forEach((sec) => (sec.style.display = "none"));

  const target = document.getElementById(id);
  if (target) {
    target.style.display = "block";
  }
}

document.getElementById("clinicianForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const role = document.getElementById("role").value.trim();

  if (name && role) {
    sessionStorage.setItem("clinicianName", name);
    document.getElementById("clinicianGreeting").innerText = `Welcome Dr. ${name}, ${role}`;
    document.getElementById("greeting").style.display = "block";
  }
});

function scorePHQ() {
  const form = document.forms.phq9;
  let total = 0;

  for (let i = 1; i <= 9; i++) {
    const value = form["q" + i]?.value;
    if (value) total += parseInt(value);
  }

  let result = "";
  if (total >= 20) {
    result = `Score: ${total}. Severe depression. Consider referral or urgent intervention.`;
  } else if (total >= 10) {
    result = `Score: ${total}. Moderate depression. Consider CBT, behavioral activation.`;
  } else if (total >= 5) {
    result = `Score: ${total}. Mild symptoms. Monitor and provide psychoeducation.`;
  } else {
    result = `Score: ${total}. Minimal or no depression. No clinical action required.`;
  }

  document.getElementById("diagnosis-result").innerText = result;
}
function scoreGAD() {
  const form = document.forms.gad7;
  let total = 0;

  for (let i = 1; i <= 7; i++) {
    const value = form["q" + i]?.value;
    if (value) total += parseInt(value);
  }

  let result = "";
  if (total >= 15) {
    result = `Score: ${total}. Severe anxiety. Consider pharmacological + therapy options.`;
  } else if (total >= 10) {
    result = `Score: ${total}. Moderate anxiety. Recommend CBT, journaling, mindfulness.`;
  } else if (total >= 5) {
    result = `Score: ${total}. Mild anxiety. Psychoeducation and light coping techniques.`;
  } else {
    result = `Score: ${total}. Minimal anxiety. Routine support may suffice.`;
  }

  document.getElementById("gad-result").innerText = result;
}

function scorePCL() {
  const form = document.forms.pcl5;
  let total = 0;

  for (let i = 1; i <= 10; i++) {
    const value = form["q" + i]?.value;
    if (value) total += parseInt(value);
  }

  let result = "";
  if (total >= 33) {
    result = `Score: ${total}. Likely PTSD. Recommend trauma-focused therapy (e.g. EMDR, PE).`;
  } else if (total >= 21) {
    result = `Score: ${total}. Moderate symptoms. Monitor and explore trauma history in depth.`;
  } else {
    result = `Score: ${total}. Subthreshold symptoms. Psychoeducation and support may be sufficient.`;
  }

  alert(result); // you can redirect this to the treatment section if desired
}

function updateTreatmentSection(sourceLabel, resultText) {
  const treatmentOutput = document.getElementById("treatment-output");
  treatmentOutput.innerHTML = `
    <p><strong>Recommendation for Dr. ${sessionStorage.getItem("clinicianName")}</strong>:</p>
    <ul>
      <li>Based on ${sourceLabel}, consider the following options:</li>
      <li>${resultText}</li>
    </ul>
  `;
  showSection("treatment-guide");
}
updateTreatmentSection("PHQ-9", result); updateTreatmentSection("GAD-7", result); updateTreatmentSection("PCL-5", result);



saveClientProfile(document.getElementById("linkedClient").value);

document.getElementById("logForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const log = {
    clinician: sessionStorage.getItem("clinicianName"),
    client: document.getElementById("linkedClient").value,
    date: document.getElementById("sessionDate").value,
    assessment: document.getElementById("assessmentType").value,
    notes: document.getElementById("notes").value,
  };

  const logs = JSON.parse(localStorage.getItem("sessionLogs")) || [];
  logs.push(log);
  localStorage.setItem("sessionLogs", JSON.stringify(logs));

  alert("Session log saved!");
  displayLogs();
  showSection("session-log");
});
function displayLogs() {
  const logs = JSON.parse(localStorage.getItem("sessionLogs")) || [];
  const output = document.getElementById("session-log-output");

  if (!output) return;

  output.innerHTML = logs.length === 0
    ? "<p>No session logs found.</p>"
    : logs
        .map((log, i) => `
          <div class="log-entry">
            <strong>${i + 1}. ${log.date} — ${log.client}</strong><br>
            <em>${log.assessment}</em>: ${log.notes}
          </div>
        `).join("");
}
function exportLogs() {
  const logs = JSON.parse(localStorage.getItem("sessionLogs")) || [];
  if (logs.length === 0) {
    alert("No logs available to export.");
    return;
  }

  const jsonData = JSON.stringify(logs, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "ipro-neuroguide-session-logs.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function triggerImport() {
  const fileInput = document.getElementById("importFile");
  fileInput.click();

  fileInput.onchange = () => {
    importLogs(fileInput.files[0]);
    fileInput.value = ""; // reset for reuse
  };
}

function importLogs(file) {
  if (!file) {
    alert("No file selected.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const importedData = JSON.parse(event.target.result);
      if (!Array.isArray(importedData)) {
        alert("Invalid file format.");
        return;
      }

      const existingLogs = JSON.parse(localStorage.getItem("sessionLogs")) || [];
      const mergedLogs = existingLogs.concat(importedData);
      localStorage.setItem("sessionLogs", JSON.stringify(mergedLogs));

      alert("Session logs imported successfully!");
      displayLogs();
    } catch (err) {
      alert("Error reading file. Ensure it’s a valid Ipro NeuroGuide export.");
    }
  };
  reader.readAsText(file);
}
function saveClientProfile(name) {
  const clients = JSON.parse(localStorage.getItem("clientProfiles")) || [];
  if (!clients.includes(name)) {
    clients.push(name);
    localStorage.setItem("clientProfiles", JSON.stringify(clients));
  }
}

function loadClientProfiles() {
  const clients = JSON.parse(localStorage.getItem("clientProfiles")) || [];
  const dropdown = document.getElementById("linkedClient");
  const list = document.getElementById("clientList");

  // Clear dropdown
  dropdown.innerHTML = "<option value='' disabled selected>Select Client</option>";
  clients.forEach((client) => {
    const option = document.createElement("option");
    option.value = client;
    option.textContent = client;
    dropdown.appendChild(option);
  });

  // Show saved clients in list
  list.innerHTML = clients.length === 0
    ? "<li>No clients saved yet.</li>"
    : clients.map((name) => `<li>${name}</li>`).join("");
}
window.onload = () => {
  loadClientProfiles();
  displayLogs();
};
const chartSelect = document.getElementById("chartClient");
chartSelect.innerHTML = "<option value='' disabled selected>Select Client</option>";
clients.forEach((name) => {
  const option = document.createElement("option");
  option.value = name;
  option.textContent = name;
  chartSelect.appendChild(option);
});
document.getElementById("chartClient").addEventListener("change", function () {
  const selected = this.value;
  renderSymptomChart(selected);
});

function renderSymptomChart(clientName) {
  const logs = JSON.parse(localStorage.getItem("sessionLogs")) || [];

  const clientLogs = logs.filter(log => log.client === clientName && log.assessment === "PHQ-9");
  if (clientLogs.length === 0) {
    alert("No PHQ-9 data available for this client.");
    return;
  }

  const dates = clientLogs.map(log => log.date);
  const scores = clientLogs.map(log => {
    const match = log.notes.match(/Score: (\d+)/);
    return match ? parseInt(match[1]) : null;
  });

  const ctx = document.getElementById("symptomChart").getContext("2d");
  if (window.symptomChart) {
    window.symptomChart.destroy();
  }

  window.symptomChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [{
        label: `PHQ-9 Scores for ${clientName}`,
        data: scores,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.3,
        fill: true,
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 27
        }
      }
    }
  });
}

function toggleChartControls() {
  const controls = document.getElementById("chart-controls");
  controls.style.display = controls.style.display === "none" ? "block" : "none";
}
