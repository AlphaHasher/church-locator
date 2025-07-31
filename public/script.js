async function findChurch() {
    const address = document.getElementById("address").value;
    const language = document.getElementById("language").value;

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
            if (!contacts || contacts.length === 0) return '';
            return contacts.map(contact => `
                <div class="contact-card">
                    <h3>${contact.name}</h3>
                    ${contact.phone ? `<p>📞 <a href="tel:${contact.phone}">${contact.phone}</a></p>` : ''}
                    ${contact.email ? `<p>✉️ <a href="mailto:${contact.email}">${contact.email}</a></p>` : ''}
                </div>
            `).join('');
        };

        const getMapButtonsHtml = (mapsLink, address) => {
            let googleLink = '';
            let appleLink = '';
            
            // If mapsLink exists and has data, use it
            if (mapsLink && mapsLink.length > 0) {
                const links = mapsLink[0];
                googleLink = links.googlelink || '';
                appleLink = links.applelink || '';
            }
            
            // If no links provided but we have an address, generate them
            if (address && (!googleLink || !appleLink)) {
                const encodedAddress = encodeURIComponent(address);
                
                if (!googleLink) {
                    googleLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                }
                
                if (!appleLink) {
                    appleLink = `https://maps.apple.com/?q=${encodedAddress}`;
                }
            }
            
            // If we still don't have any links, return empty
            if ((!googleLink || googleLink.trim() === '') && (!appleLink || appleLink.trim() === '')) {
                return '';
            }
            
            let buttonsHtml = `<div class="map-buttons">`;
            
            if (googleLink && googleLink.trim() !== '') {
                buttonsHtml += `<button class="map-btn google-btn" onclick="window.open('${googleLink}', '_blank')">📍 Google Maps</button>`;
            }
            
            if (appleLink && appleLink.trim() !== '') {
                buttonsHtml += `<button class="map-btn apple-btn" onclick="window.open('${appleLink}', '_blank')">🗺️ Apple Maps</button>`;
            }
            
            buttonsHtml += '</div>';
            return buttonsHtml;
        };

        resultContainer.innerHTML = `
            <h2>${data.church.name}</h2>
            ${getFieldHtml('Languages', data.church.languages.join(', '))}
            ${getFieldHtml('Address', data.church.address)}
            ${getFieldHtml('Website', data.church.website, true)}
            ${getMapButtonsHtml(data.church.mapsLink, data.church.address)}
            <div class="contact-cards">
                ${getContactCardsHtml(data.church.contacts)}
            </div>
        `;
    }
    resultContainer.style.display = "block";
}
