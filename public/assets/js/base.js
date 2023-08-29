/**
 * Base.js - takes care of any functionality regarding the navbar and footer templates,
 * especially involving their functionality in mobile/tablet view.
*/ 

const navToggle = document.querySelector(".navbar-toggle");
const navSubToggle = document.querySelector(".navbar-subbtn");
const navSubArrow = document.querySelectorAll(".dropdown-arrow");
const hamBtn = document.getElementById("hamburger-menu");
const navMenu = document.querySelector(".navbar-menu");
const navSubMenu = document.querySelectorAll(".navbar-dropdown");
const chordSubMenu = document.getElementById("chord-menu");
const moreSubMenu = document.getElementById("more-menu");

let isMenuOpen = false;
let prevMobMenuHeight = 0;

function main() {

    // If on mobile, initially replaces dropdown submenu arrow with mobile +/- icons
    if (window.innerWidth < 1000) {
        navSubArrow.forEach((arrow) => {
            arrow.src = "../assets/vendor/img/btn/Plus-expand.png";
            arrow.style.cursor = "pointer";
        })

    }

    // In the case of desktop resizing, change header formatting accordingly
    window.addEventListener("resize", () => {
        navSubArrow.forEach((arrow) => {
            if (window.innerWidth >= 1000) {      // Resize to desktop format and remove additional mobile formatting classes (.show-menu)
                arrow.src = "../assets/vendor/img/btn/Nav-Arrow-White.png";
                arrow.style.cursor = "default";
    
                if (navMenu.style.height != "0px") {
                    navMenu.style.height = "0px";

                    navSubMenu.forEach((subMenu) => {
                        subMenu.classList.remove("show-submenu");
                    })

                    hamBtn.style.transform = "none";
                    isMenuOpen = false;
                }
    
            } else if (arrow.getAttribute('src') != "../assets/vendor/img/btn/Minus-expand.png") {
                arrow.src = "../assets/vendor/img/btn/Plus-expand.png";
                arrow.style.cursor = "pointer";
            }
        })
    });

    // When clicking hamburger icon in mobile view, opens slide-down menu and plays icon animation
    navToggle.addEventListener("click", () => {
        if (window.innerWidth < 1000) {
            console.log(navMenu.style.height)
            if (navMenu.style.height != "0px" && navMenu.style.height != "") {
                navMenu.style.height = "0";
            } else {
                navMenu.style.height = "173px";
            }

            // navMenu.classList.toggle("show-menu");
        }

        if (isMenuOpen) {
            hamBtn.style.transform = "none";
            isMenuOpen = false;

            navSubMenu.forEach((subMenu) => {
                subMenu.classList.remove("show-submenu");
            })

            navSubArrow.forEach((arrow) => {
                arrow.src = "../assets/vendor/img/btn/Plus-expand.png";
            })


        } else {
            hamBtn.style.transform = "rotate(-90deg)";
            isMenuOpen = true;
        }
    });

    navSubArrow.forEach((arrow) => {
        arrow.addEventListener("click", () => {
            if (window.innerWidth < 1000 && navMenu.style.height != "0px") { // === navMenu.scrollHeight + "px") {
                let subMenu = arrow.parentElement.parentElement;

                if (subMenu.classList.contains("show-submenu")) {
                    subMenu.classList.remove("show-submenu"); 
                } else {
                    subMenu.classList.add("show-submenu"); 
                }

                let chordSubOpen = chordSubMenu.classList.contains("show-submenu");
                let moreSubOpen = moreSubMenu.classList.contains("show-submenu");
                let calcHeight = 173;

                if (chordSubOpen) {
                    calcHeight += 74 + 43;
                } 

                if (moreSubOpen) {
                    calcHeight += 46;
                }

                navMenu.style.height = calcHeight + "px";

                // switch (subMenu.id) {
                    // case "chord-menu":
                    //     // alert("test")
                    //     chordSubMenu.classList.toggle("show-submenu");
                    //     break;
                    // case "more-menu":
                    //     moreSubMenu.classList.toggle("show-submenu");
                    //     break;
                // }
    
                if (arrow.getAttribute('src') == "../assets/vendor/img/btn/Minus-expand.png") {
                    arrow.src = "../assets/vendor/img/btn/Plus-expand.png";
                } else if (arrow.getAttribute('src') == "../assets/vendor/img/btn/Plus-expand.png") {
                    arrow.src = "../assets/vendor/img/btn/Minus-expand.png";
                }
            }
        });
    })

}

main();