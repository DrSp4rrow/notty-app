document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("movie-search");
    const resultsList = document.getElementById("search-results");

    searchInput.addEventListener("input", async () => {
        const query = searchInput.value;
        if (query.length < 3) {
            resultsList.innerHTML = "";
            return;
        }

        const response = await fetch(`/search?query=${query}`);
        const data = await response.json();

        resultsList.innerHTML = "";
        data.results.forEach(movie => {
            const li = document.createElement("li");
            li.textContent = movie.title;
            li.addEventListener("click", () => selectMovie(movie));
            resultsList.appendChild(li);
        });
    });

    function selectMovie(movie) {
        document.getElementById("movie-search").value = movie.title;
        document.getElementById("movie-year").value = movie.year;
        document.getElementById("movie-rating").value = movie.rating;
        document.getElementById("movie-genres").value = movie.genres.join(", ");
        document.getElementById("movie-overview").value = movie.overview;
        document.getElementById("movie-poster").src = movie.poster;
        document.getElementById("movie-backdrop").src = movie.backdrop;
        resultsList.innerHTML = "";
    }
});


document.getElementById("upload-button").addEventListener("click", async () => {
    const fileInput = document.getElementById("mkv-file");
    if (!fileInput.files.length) {
        alert("Por favor, selecciona un archivo MKV.");
        return;
    }

    const formData = new FormData();
    formData.append("mkv", fileInput.files[0]);

    document.getElementById("upload-status").textContent = "Subiendo archivo...";
    document.getElementById("progress-bar").style.width = "0%";

    const response = await fetch("/upload", {
        method: "POST",
        body: formData
    });

    const data = await response.json();

    if (data.success) {
        document.getElementById("upload-status").textContent = "Archivo procesado correctamente.";
        document.getElementById("file-path").textContent = "Ruta del archivo: " + data.filePath;
        document.getElementById("progress-bar").style.width = "100%";
    } else {
        document.getElementById("upload-status").textContent = "Error al procesar el archivo.";
        document.getElementById("progress-bar").style.background = "red";
    }
});

