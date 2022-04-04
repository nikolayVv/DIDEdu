var mybutton = document.getElementById("myBtn");

const sections = document.querySelectorAll(".section");
const navLi = document.querySelectorAll(".nav-link");
const tutorialLi = document.querySelectorAll(".tut")
// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {
    scrollFunction();
    changeCurrNavButton()
};

function changeCurrNavButton() {
    var current = "";
    console.log(navLi)
    console.log(tutorialLi)
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

tutorialLi.forEach((tutorial) => {
   tutorial.addEventListener("click", () => {
       tutorialLi.forEach((tutDelete) => {
           tutDelete.classList.remove('active');
       });
       tutorial.classList.add('active');
   });
});

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
}

function topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
