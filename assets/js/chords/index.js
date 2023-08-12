
//  Main elem section-related child elements
const section = [...document.querySelectorAll(".section")]
// const sectionImgDiv = [...document.querySelectorAll(".section-img")];
const sectionImg = [...document.querySelectorAll(".section-img .img")];
// const sectionTxt = [...document.querySelectorAll(".section-text")];
const sectionBtn = [...document.querySelectorAll(".section-btn")];
const sectionLeft = [...document.querySelectorAll(".section-left")];
const sectionRight = [...document.querySelectorAll(".section-right")];

const boxRow = document.querySelector("#more-input-row");
const boxStaff = document.querySelector("#box-staff");
const boxText = document.querySelector("#box-text");
let boxRowBreak;

const breakColHTML = '<div class="break-col" style="width: 100%;"></div>'

//////// FUNCTIONS ////////
// Format elements properly according to current view
function positionElem() {
    // When page is first loaded:
    window.addEventListener("DOMContentLoaded", () => {
        // Middle section areas and "More input" section
        if (window.innerWidth < 992) {
            boxStaff.insertAdjacentHTML("afterend", breakColHTML);
            boxText.insertAdjacentHTML("afterend", breakColHTML);            
        }
        
        if (window.innerWidth >= 863) {
            sectionRight.forEach((elem) => {
                elem.classList.add("order-sm-last");
                elem.classList.add("float-right");
            
            });

            sectionImg.forEach((elem) => {
                elem.classList.remove("mx-auto", "d-block");
                elem.classList.add("float-left");
            });

            sectionLeft.forEach((elem) => {
                elem.classList.add("order-sm-first");
            });
            
        } else {
            sectionImg.forEach((elem) => {
                elem.classList.remove("float-left");
                elem.classList.add("mx-auto", "d-block");
            });

            section.forEach((section) => {
                section.firstElementChild.insertAdjacentHTML("afterend", breakColHTML);
            });

            sectionBtn.forEach((btn) => {
                btn.classList.add("mx-auto", "d-block");
            });
        }
    })

    // In the case of desktop resizing, change header formatting accordingly
    window.addEventListener("resize", () => {
        if (window.innerWidth >= 992) {
            if (boxRow.querySelector(".break-col")) {
                boxRowBreak = [...boxRow.querySelectorAll(".break-col")];

                boxRowBreak.forEach((rowBreak) => {
                    boxRow.removeChild(rowBreak);
                });
            }
        } else {
            if (!boxRow.querySelector(".break-col")) {
                boxStaff.insertAdjacentHTML("afterend", breakColHTML);
                boxText.insertAdjacentHTML("afterend", breakColHTML);
            }
        }

        if (window.innerWidth >= 863) {      // Reorder Image and title
            sectionRight.forEach((elem) => {
                elem.classList.add("order-sm-last");
                elem.classList.add("float-right");
            });

            sectionImg.forEach((elem) => {
                elem.classList.remove("mx-auto", "d-block");
                elem.classList.add("float-left");
            });

            sectionLeft.forEach((elem) => {
                elem.classList.add("order-sm-first");
            });

            section.forEach((section) => {
                if (section.querySelector(".break-col")) {
                    // console.log("Exists");
                    section.removeChild(section.querySelector(".break-col"));
                }
            });

            sectionBtn.forEach((btn) => {
                btn.classList.remove("mx-auto", "d-block");
            });

        } else {
            sectionRight.forEach((elem) => {
                elem.classList.remove("order-sm-last");
                elem.classList.remove("float-right");
            });

            sectionImg.forEach((elem) => {
                elem.classList.add("mx-auto", "d-block");
                elem.classList.remove("float-left");
            });

            sectionLeft.forEach((elem) => {
                elem.classList.remove("order-sm-first");
            });
            
            section.forEach((section) => {
                if (!section.querySelector(".break-col")) {
                    section.firstElementChild.insertAdjacentHTML("afterend", breakColHTML);
                }
            });

            sectionBtn.forEach((btn) => {
                btn.classList.add("mx-auto", "d-block");
            });
        }
    });
}

// // Btn Redirection 
// function goToKeyboard() {
//     window
// }

function main() {

    positionElem();
}

main();