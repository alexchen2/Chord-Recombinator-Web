/**
 * Base.js - takes care of any functionality regarding the navbar and footer templates,
 * especially involving their functionality in mobile/tablet view.
*/ 

const navToggle = document.querySelector(".navbar-toggle");
const navSubToggle = document.querySelector(".navbar-subbtn");
const navSubArrow = document.getElementById("dropdown-arrow");
const hamBtn = document.getElementById("hamburger-menu");
const navMenu = document.querySelector(".navbar-menu");
const navSubMenu = document.querySelector(".navbar-submenu");

let isMenuOpen = false;

function main() {

    // If on mobile, initially replaces dropdown submenu arrow with mobile +/- icons
    if (window.innerWidth < 1000) {
        navSubArrow.src = "../assets/vendor/img/btn/Plus-expand.png";
        navSubArrow.style.cursor = "pointer";
    }

    // In the case of desktop resizing, change header formatting accordingly
    window.addEventListener("resize", () => {
        if (window.innerWidth >= 1000) {      // Resize to desktop format and remove additional mobile formatting classes (.show-menu)
            navSubArrow.src = "../assets/vendor/img/btn/Nav-Arrow-White.png";
            navSubArrow.style.cursor = "default";

            if (navMenu.classList.contains("show-menu")) {
                navMenu.classList.remove("show-menu");
                navMenu.classList.remove("show-submenu");
                hamBtn.style.transform = "none";
                isMenuOpen = false;
            }

        } else if (navSubArrow.getAttribute('src') != "../assets/vendor/img/btn/Minus-expand.png") {
            navSubArrow.src = "../assets/vendor/img/btn/Plus-expand.png";
            navSubArrow.style.cursor = "pointer";
        }
    });

    // When clicking hamburger icon in mobile view, opens slide-down menu and plays icon animation
    navToggle.addEventListener("click", () => {
        if (window.innerWidth < 1000) {
            navMenu.classList.toggle("show-menu");
        }

        if (isMenuOpen) {
            hamBtn.style.transform = "none";
            isMenuOpen = false;

            navMenu.classList.remove("show-submenu");
            navSubArrow.src = "../assets/vendor/img/btn/Plus-expand.png";
        } else {
            hamBtn.style.transform = "rotate(-90deg)";
            isMenuOpen = true;
        }
    });

    navSubArrow.addEventListener("click", () => {
        if (window.innerWidth < 1000 && navMenu.classList.contains("show-menu")) {

            navMenu.classList.toggle("show-submenu");

            if (navSubArrow.getAttribute('src') == "../assets/vendor/img/btn/Minus-expand.png") {
                navSubArrow.src = "../assets/vendor/img/btn/Plus-expand.png";
            } else if (navSubArrow.getAttribute('src') == "../assets/vendor/img/btn/Plus-expand.png") {
                navSubArrow.src = "../assets/vendor/img/btn/Minus-expand.png";
            }
        }
    });
}

main();