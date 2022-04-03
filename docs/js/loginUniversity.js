function check(that, type) {
    if (that.value.trim() !== "") {
        if (type === "list") {
            document.getElementById("list").style.display = "block";
        } else if (type === "button") {
            document.getElementById("submit").disabled = false;
        }
    } else {
        if (type === "list") {
            document.getElementById("list").style.display = "none";
        } else if (type === "button") {
            document.getElementById("submit").disabled = true;
        }    }
}