// Sélection des options
document.querySelectorAll('.option-row').forEach(row => {
  if (!row.classList.contains('included')) {
    row.addEventListener('click', e => {
      if (!e.target.classList.contains('info')) {
        row.classList.toggle('selected');
        updateTotal();
      }
    });
  }
});

// Tooltips
document.querySelectorAll('.info').forEach(info => {
  info.addEventListener('mouseenter', () => {
    const tooltipText = info.getAttribute('data-tooltip');
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip-fix';
    tooltip.innerText = tooltipText;
    document.body.appendChild(tooltip);
    const rect = info.getBoundingClientRect();
    const tipRect = tooltip.getBoundingClientRect();
    let left = rect.left + rect.width/2 - tipRect.width/2;
    if (left < 10) left = 10;
    if (left + tipRect.width > window.innerWidth - 10) left = window.innerWidth - tipRect.width - 10;
    tooltip.style.top = rect.top - tipRect.height - 8 + window.scrollY + "px";
    tooltip.style.left = left + "px";
    info._tooltip = tooltip;
  });
  info.addEventListener('mouseleave', () => {
    if (info._tooltip) info._tooltip.remove();
    info._tooltip = null;
  });
});

// Calcul total
function updateTotal() {
  let total = 0;
  const interieur = document.querySelector(".section:nth-of-type(1) .option-row.forfait");
  const interieurInclus = document.querySelectorAll(".section:nth-of-type(1) .option-row.included");
  if (interieur.classList.contains("selected")) {
    total += 40;
    interieurInclus.forEach(r => r.classList.add("selected"));
  } else {
    interieurInclus.forEach(r => r.classList.remove("selected"));
  }

  const exterieur = document.querySelector(".section:nth-of-type(2) .option-row.forfait");
  const exterieurInclus = document.querySelectorAll(".section:nth-of-type(2) .option-row.included");
  if (exterieur.classList.contains("selected")) {
    total += 50;
    exterieurInclus.forEach(r => r.classList.add("selected"));
  } else {
    exterieurInclus.forEach(r => r.classList.remove("selected"));
  }

  document.querySelectorAll('.option-row.selected').forEach(row => {
    if (!row.classList.contains('included') && !row.classList.contains('forfait')) {
      total += parseInt(row.getAttribute('data-price')) || 0;
    }
  });

  document.getElementById('total').innerText = total + " €";
}

// Validation
function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function isValidPhone(v) { return v.replace(/\D/g,'').length >= 9; }

// Envoi
document.getElementById("btn-devis").addEventListener("click", () => {
  const errorEl = document.getElementById("error-message");
  errorEl.style.color = "red";
  errorEl.innerText = "";

  const total = parseInt(document.getElementById("total").innerText.replace(" €","")) || 0;
  if (total === 0) return errorEl.innerText = "⚠️ Merci de choisir au moins une prestation.";

  const nom = document.getElementById("nom").value.trim();
  const email = document.getElementById("email").value.trim();
  const tel = document.getElementById("tel").value.trim();

  if (!nom || !email || !tel) return errorEl.innerText = "⚠️ Merci de renseigner vos coordonnées.";
  if (!isValidEmail(email)) return errorEl.innerText = "⚠️ Email invalide.";
  if (!isValidPhone(tel)) return errorEl.innerText = "⚠️ Téléphone invalide.";

  const selections = [...document.querySelectorAll(".option-row.selected .option-label")]
    .map(el => el.innerText)
    .join(", ");

  const formData = new FormData();
  formData.append("nom", nom);
  formData.append("email", email);
  formData.append("tel", tel);
  formData.append("devis", selections);
  formData.append("total", total);

  fetch("https://script.google.com/macros/s/AKfycbxQbH_Zji4vo2-Ito6shzC7GRYIkqS_kIQlwZ06nOPsY1lzjf-bj8BvUwggO3dS6pVS7g/exec", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(result => {
    if (result.status === "success") {
      errorEl.style.color = "green";
      errorEl.innerText = "✅ Demande envoyée avec succès !";
    } else throw new Error(result.message);
  })
  .catch(err => {
    errorEl.innerText = "❌ Erreur : " + err.message;
  });
});

updateTotal();
