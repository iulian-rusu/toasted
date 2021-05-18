function request(url, method = "GET", onsuccess) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            onsuccess();
        }
    };

    xhttp.open(method, url, true);
    xhttp.send();
}

function insertMessage(msg) {
    document.getElementById("message").innerHTML = msg;
}

function addToBasket(id) {
    request(`/adauga-cos?id=${id}`, "GET",  () => insertMessage('Produs adăugat'));
}