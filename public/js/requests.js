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
    request(`/add-basket?id=${id}`, "GET",  () => insertMessage('Produs adăugat'));
}

function deleteProduct(id) {
    const json = JSON.stringify({id: id});
    console.log(json);
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            window.location = "/admin";
        }
    };
    xhttp.open("DELETE", "/product", true);
    xhttp.setRequestHeader('Content-type','application/json; charset=utf-8');
    xhttp.send(json);
}