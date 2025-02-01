async function findChurch() {
    const address = document.getElementById("address").value;
    if (!address) {
        alert("Please enter an address or ZIP code.");
        return;
    }

    const response = await fetch("/find-church", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
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

        resultContainer.innerHTML = `
            <h2>${data.church.name}</h2>
            ${getFieldHtml('Address', data.church.address)}
            ${getFieldHtml('Contact', data.church.contact)}            ${getFieldHtml('Website', data.church.website, true)}
            <a id="map-btn" href="${data.mapUrl}" target="_blank">Open in Maps</a>
        `;
    }
    resultContainer.style.display = "block";
}
