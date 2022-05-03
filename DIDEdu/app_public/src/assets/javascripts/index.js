let mybutton;
let sections;
let navLi;
let tutorialLi;
// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {
    sections = document.querySelectorAll(".section");
    navLi = document.querySelectorAll(".nav-link");
    tutorialLi = document.querySelectorAll(".tut");
    mybutton = document.getElementById("myBtn");
    scrollFunction();
    changeCurrNavButton()
};

function changeCurrNavButton() {
    var current = "";
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 60) {
            current = section.getAttribute("id");
        }
    });

    navLi.forEach((li) => {
        li.classList.remove("active");
        if (li.classList.contains(current)) {
            li.classList.add("active");
        }
    });
}

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
}
