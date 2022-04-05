var professor = document.getElementById("professors");
var student = document.getElementById("students");
var admin = document.getElementById("admins");
var subject = document.getElementById("subjects");
var input = document.getElementById("searchInput");


var currMessage = "Search by professor's name...";

professor.onclick = function() {
    currMessage = "Search by professor's name...";
    input.placeholder = currMessage;
}

student.onclick = function() {
    currMessage = "Search by student's name...";
    input.placeholder = currMessage;
}

admin.onclick = function() {
    currMessage = "Search by admin's name...";
    input.placeholder = currMessage;
}

subject.onclick = function() {
    currMessage = "Search by subject's name...";
    input.placeholder = currMessage;
}

input.onfocus = function () {
    input.placeholder = '';
}

input.onblur = function() {
    input.placeholder = currMessage;
}