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
    if (data.error) {
        document.getElementById("result").innerHTML = `<p>${data.error}</p>`;
    } else {
        document.getElementById("result").innerHTML = `
            <h2>Nearest Church: ${data.church.name}</h2>
            <a href="${data.mapUrl}" target="_blank">Open in Maps</a>
        `;
    }
}
