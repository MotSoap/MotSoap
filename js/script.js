// Menu
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("customNav");
  const header = document.querySelector("header"); // ton bloc avec la vidéo

  window.addEventListener("scroll", () => {
    if (window.scrollY > header.offsetHeight) {
      nav.classList.add("show");
    } else {
      nav.classList.remove("show");
    }
  });
});

// Expertise
    const expertiseItems = document.querySelectorAll('.expertise-item');
    const expertiseSection = document.querySelector('.expertise');

    expertiseItems.forEach(item => {
    item.addEventListener('click', e => {
        e.stopPropagation(); // empêche le clic global
        if (item.classList.contains('active')) {
        item.classList.remove('active');
        expertiseItems.forEach(i => i.classList.remove('inactive'));
        } else {
        expertiseItems.forEach(i => {
            i.classList.remove('active');
            i.classList.add('inactive'); // atténue tous
        });
        item.classList.add('active');
        item.classList.remove('inactive'); // actif reste net
        }
    });
    });

    // Clic à l'extérieur pour tout désactiver
    document.addEventListener('click', e => {
    if (!expertiseSection.contains(e.target)) {
        expertiseItems.forEach(i => {
        i.classList.remove('active');
        i.classList.remove('inactive');
        });
    }
    });

  // Scroll fluide sur "Configurer"
  document.querySelectorAll('.expertise-content a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if(target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Clic sur les lignes (sauf inclus)
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

  // Calcul total + gestion inclus
  function updateTotal() {
    let total = 0;

    // Forfait intérieur
    const interieur = document.querySelector(".section:nth-of-type(1) .option-row.forfait");
    const interieurInclus = document.querySelectorAll(".section:nth-of-type(1) .option-row.included");
    if (interieur.classList.contains("selected")) {
      total += 40;
      interieurInclus.forEach(row => row.classList.add("selected"));
    } else {
      interieurInclus.forEach(row => row.classList.remove("selected"));
    }

    // Forfait extérieur
    const exterieur = document.querySelector(".section:nth-of-type(2) .option-row.forfait");
    const exterieurInclus = document.querySelectorAll(".section:nth-of-type(2) .option-row.included");
    if (exterieur.classList.contains("selected")) {
      total += 50;
      exterieurInclus.forEach(row => row.classList.add("selected"));
    } else {
      exterieurInclus.forEach(row => row.classList.remove("selected"));
    }

    // Autres options sélectionnées
    document.querySelectorAll('.option-row.selected').forEach(row => {
      if (!row.classList.contains('included') && !row.classList.contains('forfait')) {
        total += parseInt(row.getAttribute('data-price')) || 0;
      }
    });

    document.getElementById('total').innerText = total + " €";
  }

  // Validation simple email / téléphone
  function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function isValidPhone(v) { return v.replace(/\D/g,'').length >= 9; }

    // Envoi demande de devis
document.getElementById("btn-devis").addEventListener("click", () => {
  const errorEl = document.getElementById("error-message");
  errorEl.style.color = "red";
  errorEl.innerText = "";

  const total = parseInt(document.getElementById("total").innerText.replace(" €","")) || 0;
  if (total === 0) {
    errorEl.innerText = "⚠️ Merci de choisir au moins une prestation (forfait ou option).";
    return;
  }

  const nom = document.getElementById("nom").value.trim();
  const email = document.getElementById("email").value.trim();
  const tel = document.getElementById("tel").value.trim();

  if (!nom || !email || !tel) {
    errorEl.innerText = "⚠️ Merci de renseigner vos coordonnées (nom, email et téléphone).";
    return;
  }
  if (!isValidEmail(email)) {
    errorEl.innerText = "⚠️ Email invalide.";
    return;
  }
  if (!isValidPhone(tel)) {
    errorEl.innerText = "⚠️ Numéro de téléphone invalide.";
    return;
  }

  const selections = [...document.querySelectorAll(".option-row.selected .option-label")]
    .map(el => el.innerText)
    .join(", ");

  // ✅ création du formData
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
      errorEl.innerText = "✅ Votre demande a bien été envoyée. Nous vous recontactons rapidement.";
    } else {
      throw new Error(result.message || "Erreur inconnue");
    }
  })
  .catch(err => {
    errorEl.style.color = "red";
    errorEl.innerText = "❌ Erreur lors de l'envoi : " + err.message;
  });
});

  // Init
  updateTotal();

    // FAQ
  document.querySelectorAll('.faq-question').forEach(q=>{
    q.addEventListener('click',()=>{
      const parent=q.parentElement;
      parent.classList.toggle('active');
    });
  });
