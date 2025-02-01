async function findChurch() {
    const address = document.getElementById("address").value;
    const language = document.getElementById("language").value;

    if (!address) {
        alert("Please enter an address or ZIP code.");
        return;
    }

    const response = await fetch("/find-church", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, language }),
    });

    const data = await response.json();
    const resultContainer = document.getElementById("result");

    if (data.error) {
        resultContainer.innerHTML = `<p>${data.error}</p>`;
    } else {
        const getFieldHtml = (label, value, isLink = false) => {
            if (!value) return '';
            return isLink
                ? `<p><strong>${label}:</strong> <a href="${value}" target="_blank">${value}</a></p>`
                : `<p><strong>${label}:</strong> ${value}</p>`;
        };

        const getContactCardsHtml = (contacts) => {
            console.log('Contacts:', contacts); // Debug log
            if (!contacts || contacts.length === 0) return '';
            return contacts.map(contact => `
                <div class="contact-card">
                    <h3>${contact.name}</h3>
                    ${contact.phone ? `<p>📞 <a href="tel:${contact.phone}">${contact.phone}</a></p>` : ''}
                    ${contact.email ? `<p>✉️ <a href="mailto:${contact.email}">${contact.email}</a></p>` : ''}
                </div>
            `).join('');
        };

        resultContainer.innerHTML = `
            <h2>${data.church.name}</h2>
            ${getFieldHtml('Languages', data.church.languages.join(', '))}
            ${getFieldHtml('Address', data.church.address)}
            ${getFieldHtml('Website', data.church.website, true)}
            <a id="map-btn" href="${data.mapUrl}" target="_blank">Open in Maps</a>
            <div class="contact-cards">
                ${getContactCardsHtml(data.church.contacts)}
            </div>
        `;
    }
    resultContainer.style.display = "block";
}
