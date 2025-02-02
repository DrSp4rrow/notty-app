document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const errorMsg = document.getElementById("error-msg");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const text = await response.text();

        if (response.status === 400 || response.status === 401) {
            errorMsg.textContent = text;
        } else {
            window.location.href = "/";
        }
    });
});
