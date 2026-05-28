const form = document.querySelector("#profile-form");
const card = document.querySelector("#card");
const output = document.querySelector("#markdown-output");
const statusLine = document.querySelector("#status");
const copyButton = document.querySelector("#copy");
const downloadButton = document.querySelector("#download");
const resetButton = document.querySelector("#reset");

const defaults = {
  name: "Emir Ertunc",
  title: "Frontend developer and software engineering student",
  focus: "Building practical web tools, learning clean architecture, and improving UI quality.",
  stack: "JavaScript, TypeScript, React, CSS, Node.js",
  location: "Turkey",
  github: "emir-ertunc",
  links: "Portfolio: https://example.com, LinkedIn: https://linkedin.com",
  theme: "mint",
};

function readProfile() {
  const formData = new FormData(form);
  return {
    name: String(formData.get("name") || "").trim(),
    title: String(formData.get("title") || "").trim(),
    focus: String(formData.get("focus") || "").trim(),
    stack: String(formData.get("stack") || "").trim(),
    location: String(formData.get("location") || "").trim(),
    github: String(formData.get("github") || "").trim(),
    links: String(formData.get("links") || "").trim(),
    theme: String(formData.get("theme") || "mint"),
  };
}

function splitList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}

function renderCard(profile) {
  const stackItems = splitList(profile.stack);
  const linkItems = splitList(profile.links);
  const githubUrl = profile.github ? `https://github.com/${profile.github}` : "";

  card.className = `profile-card theme-${profile.theme}`;
  card.innerHTML = `
    <div>
      <h2>${escapeHtml(profile.name || "Your name")}</h2>
      <p class="card-title">${escapeHtml(profile.title || "Short title")}</p>
    </div>
    <p>${escapeHtml(profile.focus || "Describe what you are building and learning.")}</p>
    <div class="meta-row">
      ${profile.location ? `<span class="pill">${escapeHtml(profile.location)}</span>` : ""}
      ${githubUrl ? `<span class="pill">${escapeHtml(githubUrl)}</span>` : ""}
    </div>
    <div class="tag-row">
      ${stackItems.map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join("")}
    </div>
    <div class="link-row">
      ${linkItems.map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join("")}
    </div>
  `;
}

function renderMarkdown(profile) {
  const stackItems = splitList(profile.stack).map((item) => `\`${item}\``).join(" ");
  const linkItems = splitList(profile.links)
    .map((item) => {
      const [label, ...rest] = item.split(":");
      const url = rest.join(":").trim();
      return url ? `[${label.trim()}](${url})` : item;
    })
    .join(" · ");
  const bullets = [
    profile.location ? `- Location: ${profile.location}` : "",
    profile.github ? `- GitHub: [@${profile.github}](https://github.com/${profile.github})` : "",
    stackItems ? `- Stack: ${stackItems}` : "",
    linkItems ? `- Links: ${linkItems}` : "",
  ].filter(Boolean);

  return [
    `# ${profile.name || "Your name"}`,
    "",
    `**${profile.title || "Short title"}**`,
    "",
    profile.focus || "Describe what you are building and learning.",
    "",
    bullets.join("\n"),
  ]
    .filter((line, index, lines) => line !== "" || lines[index - 1] !== "")
    .join("\n");
}

function updatePreview() {
  const profile = readProfile();
  renderCard(profile);
  output.value = renderMarkdown(profile);
}

function setStatus(message) {
  statusLine.textContent = message;
  window.clearTimeout(setStatus.timer);
  setStatus.timer = window.setTimeout(() => {
    statusLine.textContent = "";
  }, 2400);
}

function resetForm() {
  Object.entries(defaults).forEach(([key, value]) => {
    const field = form.elements[key];
    if (!field) return;
    if (field instanceof RadioNodeList) {
      field.value = value;
    } else {
      field.value = value;
    }
  });
  updatePreview();
  setStatus("Defaults restored.");
}

async function copyMarkdown() {
  try {
    await navigator.clipboard.writeText(output.value);
    setStatus("Markdown copied.");
  } catch {
    output.select();
    document.execCommand("copy");
    setStatus("Markdown copied with fallback.");
  }
}

function downloadMarkdown() {
  const blob = new Blob([output.value], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "profile-card.md";
  link.click();
  URL.revokeObjectURL(url);
  setStatus("Markdown downloaded.");
}

form.addEventListener("input", updatePreview);
copyButton.addEventListener("click", copyMarkdown);
downloadButton.addEventListener("click", downloadMarkdown);
resetButton.addEventListener("click", resetForm);

updatePreview();
