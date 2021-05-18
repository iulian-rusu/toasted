function request(url, msg = "Success", method = "GET") {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            insertMessage(msg)
        }
    };

    xhttp.open(method, url, true);
    xhttp.send();
}

function insertMessage(msg) {
    document.getElementById("message").innerHTML = msg;
}

function addToBasket(id) {
    request(`/adauga-cos?id=${id}`, "Produs adaugat");
}