const minesweeperSettingsInputs = {
    width: document.querySelector(".width-input"),
    height: document.querySelector(".height-input"),
    mineCount: document.querySelector(".mine-input"),
};

const settingsForm = document.querySelector(".minesweeper-settings");

const minesweeperDOMContainer = document.querySelector(".minesweeper");
let minesweeperContainer = null;

const backdrop = document.querySelector(".backdrop");
const modal = document.querySelector(".modal");
const modalTitle = document.querySelector(".modal-title");
const modalText = document.querySelector(".modal-text");
const modalCloseButton = document.querySelector(".close-button");

const statistics = document.querySelector(".stats");
const flagCountElement = document.querySelector(".flag-count");
const timer = document.querySelector(".timer");
let timerSeconds = 0;
let timerInterval;

function closeModal() {
    modalTitle.classList.remove("lost");
    modal.classList.add("off");
    backdrop.classList.add("off");
}

function showModal(title, text) {
    backdrop.classList.remove("off");
    modal.classList.remove("off");
    modalTitle.innerText = title;
    modalText.innerText = text;
}

function addSecond() {
    timerSeconds++;
    timer.innerText = Math.floor(timerSeconds / 600);
    timer.innerText +=
        Math.floor(timerSeconds / 60) - Math.floor(timerSeconds / 600) * 10;
    timer.innerText += ":";
    timer.innerText +=
        Math.floor(timerSeconds / 10) - Math.floor(timerSeconds / 60) * 6;
    timer.innerText += timerSeconds % 10;
}

modalCloseButton.addEventListener("click", closeModal);
backdrop.addEventListener("click", closeModal);

function settingsSubmitHandler(event) {
    event.preventDefault();
    const widthValue = +minesweeperSettingsInputs.width.value;
    const heightValue = +minesweeperSettingsInputs.height.value;
    const mineCountValue = +minesweeperSettingsInputs.mineCount.value;
    const areInputsValid = {
        width: widthValue > 0,
        height: heightValue > 0,
        mineCount:
            mineCountValue > 0 &&
            mineCountValue < (widthValue - 1) * (heightValue - 1),
    };

    if (!areInputsValid.width) {
        minesweeperSettingsInputs.width.classList.add("invalid");
    } else {
        minesweeperSettingsInputs.width.classList.remove("invalid");
    }
    if (!areInputsValid.height) {
        minesweeperSettingsInputs.height.classList.add("invalid");
    } else {
        minesweeperSettingsInputs.height.classList.remove("invalid");
    }
    if (!areInputsValid.mineCount) {
        minesweeperSettingsInputs.mineCount.classList.add("invalid");
    } else {
        minesweeperSettingsInputs.mineCount.classList.remove("invalid");
    }

    if (
        !areInputsValid.width ||
        !areInputsValid.height ||
        !areInputsValid.mineCount
    ) {
        return;
    }
    statistics.classList.remove("off");
    if (minesweeperContainer !== null) {
        flagCountElement.removeChild(
            document.querySelector(".flag-count-text")
        );
        minesweeperContainer.clearContainer();
        delete minesweeperContainer;
        timerSeconds = -1;
        addSecond();
        clearInterval(timerInterval);
    }
    timerInterval = setInterval(addSecond, 1000);
    minesweeperContainer = new MineSweeper();
    minesweeperDOMContainer.style.pointerEvents = "auto";
}

settingsForm.addEventListener("submit", settingsSubmitHandler);

class Box {
    constructor() {
        this.isBomb = false;
        this.isFlagged = false;
        this.isUncovered = false;
        this.bombsAround = 0;
        this.className = "open-box";
    }

    addNearbyBomb() {
        this.bombsAround++;
        this.className = "open-box" + this.bombsAround;
    }

    toggleFlag() {
        this.isFlagged = !this.isFlagged;
    }
}

class MineSweeper {
    constructor() {
        this.width = Number(minesweeperSettingsInputs.width.value);
        this.height = Number(minesweeperSettingsInputs.height.value);
        this.mineCount = Number(minesweeperSettingsInputs.mineCount.value);

        this.firstClick = true;
        this.flagCount = 0;

        this.boxes = [];
        this.boxElements = [];
        this.uncovered = [];
        this.bombElements = [];

        this.generateBoxes();
        this.insertToDOM();
        this.addClickListeners();
    }

    generateBoxes() {
        for (let i = 0; i < this.height; i++) {
            const tmp = [];
            for (let o = 0; o < this.width; o++) {
                const box = new Box();
                tmp.push(box);
            }
            this.boxes.push(tmp);
        }
    }

    generateBombs(vIndex, hIndex) {
        let workBoxes = [];
        for (let i = 0; i < this.height; i++) {
            for (let o = 0; o < this.width; o++) {
                workBoxes.push([i, o]);
            }
        }

        workBoxes = workBoxes.filter(
            (workBox) => workBox[0] != vIndex || workBox[1] != hIndex
        );

        for (let i = 0; i < this.mineCount && workBoxes.length > 0; i++) {
            let randomIndexes =
                workBoxes[Math.floor(Math.random() * workBoxes.length)];
            console.log(randomIndexes);
            this.boxes[randomIndexes[0]][randomIndexes[1]].isBomb = true;
            this.bombElements.push(
                this.boxElements[randomIndexes[0]][randomIndexes[1]]
            );
            workBoxes = workBoxes.filter((workBox) => workBox != randomIndexes);
            if (randomIndexes[0] > 0) {
                this.boxes[randomIndexes[0] - 1][
                    randomIndexes[1]
                ].addNearbyBomb(randomIndexes[0] - 1, randomIndexes[1]);
            }
            if (randomIndexes[0] < this.height - 1) {
                this.boxes[randomIndexes[0] + 1][
                    randomIndexes[1]
                ].addNearbyBomb(randomIndexes[0] + 1, randomIndexes[1]);
            }
            if (randomIndexes[1] > 0) {
                this.boxes[randomIndexes[0]][
                    randomIndexes[1] - 1
                ].addNearbyBomb(randomIndexes[0], randomIndexes[1] - 1);
                if (randomIndexes[0] > 0) {
                    this.boxes[randomIndexes[0] - 1][
                        randomIndexes[1] - 1
                    ].addNearbyBomb(randomIndexes[0] - 1, randomIndexes[1] - 1);
                }
                if (randomIndexes[0] < this.height - 1) {
                    this.boxes[randomIndexes[0] + 1][
                        randomIndexes[1] - 1
                    ].addNearbyBomb(randomIndexes[0] + 1, randomIndexes[0] - 1);
                }
            }
            if (randomIndexes[1] < this.width - 1) {
                this.boxes[randomIndexes[0]][
                    randomIndexes[1] + 1
                ].addNearbyBomb();
                if (randomIndexes[0] > 0) {
                    this.boxes[randomIndexes[0] - 1][
                        randomIndexes[1] + 1
                    ].addNearbyBomb();
                }
                if (randomIndexes[0] < this.height - 1) {
                    this.boxes[randomIndexes[0] + 1][
                        randomIndexes[1] + 1
                    ].addNearbyBomb();
                }
            }
        }
    }

    addClickListeners() {
        for (let i = 0; i < this.height; i++) {
            for (let o = 0; o < this.width; o++) {
                const clickHandler = () => {
                    if (this.firstClick) {
                        this.firstClick = false;
                        this.generateBombs(i, o);
                        this.CFS(i, o);
                    } else if (this.boxes[i][o].isBomb) {
                        this.boxes[i][o].isUncovered = true;
                        this.boxElements[i][o].classList.add("clicked-mine");
                        this.loseGame(i, o);
                    } else {
                        this.CFS(i, o);
                    }
                };
                this.boxElements[i][o].addEventListener("click", clickHandler);
                this.boxElements[i][o].addEventListener(
                    "contextmenu",
                    (event) => {
                        const flagCountText =
                            document.querySelector(".flag-count-text");
                        event.preventDefault();
                        if (
                            this.flagCount < this.mineCount &&
                            !this.boxes[i][o].isFlagged
                        ) {
                            this.boxes[i][o].toggleFlag();
                            this.flagCount++;
                            if (this.flagCount === this.mineCount) {
                                this.tryWinGame();
                            }
                            flagCountText.innerText =
                                this.mineCount - this.flagCount;
                            this.boxElements[i][o].classList.toggle("flag-box");
                            this.boxElements[i][o].removeEventListener(
                                "click",
                                clickHandler
                            );
                        } else if (this.boxes[i][o].isFlagged) {
                            this.boxes[i][o].toggleFlag();
                            this.flagCount--;
                            flagCountText.innerText =
                                this.mineCount - this.flagCount;
                            this.boxElements[i][o].classList.toggle("flag-box");
                            this.boxElements[i][o].addEventListener(
                                "click",
                                clickHandler
                            );
                        }
                    }
                );
            }
        }
    }

    insertToDOM() {
        minesweeperDOMContainer.style.gridTemplateColumns = `repeat(${this.boxes[0].length}, 40px)`;
        for (let i = 0; i < this.height; i++) {
            const tmp = [];
            for (let o = 0; o < this.width; o++) {
                const boxElement = document.createElement("div");
                boxElement.classList.add("mine-box");
                tmp.push(boxElement);
                minesweeperDOMContainer.appendChild(boxElement);
            }
            this.boxElements.push(tmp);
        }
        const element = document.createElement("h3");
        element.innerText = this.mineCount;
        element.classList.add("flag-count-text");
        flagCountElement.appendChild(element);
    }

    openBox(vIndex, hIndex) {
        this.boxes[vIndex][hIndex].isUncovered = true;
        this.boxElements[vIndex][hIndex].style.pointerEvents = "none";
        this.boxElements[vIndex][hIndex].classList.add(
            this.boxes[vIndex][hIndex].className
        );
    }

    CFS(vIndex, hIndex) {
        if (
            this.boxes[vIndex][hIndex].bombsAround > 0 &&
            !this.boxes[vIndex][hIndex].isUncovered &&
            !this.boxes[vIndex][hIndex].isFlagged
        ) {
            this.openBox(vIndex, hIndex);
        } else if (
            !this.boxes[vIndex][hIndex].isUncovered &&
            !this.boxes[vIndex][hIndex].isFlagged
        ) {
            this.openBox(vIndex, hIndex);
            if (vIndex > 0) {
                if (hIndex > 0) {
                    this.CFS(vIndex - 1, hIndex - 1);
                }
                if (hIndex < this.width - 1) {
                    this.CFS(vIndex - 1, hIndex + 1);
                }
                this.CFS(vIndex - 1, hIndex);
            }
            if (vIndex < this.height - 1) {
                if (hIndex > 0) {
                    this.CFS(vIndex + 1, hIndex - 1);
                }
                if (hIndex < this.width - 1) {
                    this.CFS(vIndex + 1, hIndex + 1);
                }
                this.CFS(vIndex + 1, hIndex);
            }
            if (hIndex > 0) {
                this.CFS(vIndex, hIndex - 1);
            }
            if (hIndex < this.width - 1) {
                this.CFS(vIndex, hIndex + 1);
            }
        }
    }

    clearContainer() {
        minesweeperDOMContainer.innerHTML = "";
    }

    loseGame() {
        clearInterval(timerInterval);
        for (const bombElement of this.bombElements) {
            bombElement.classList.add("mine");
        }
        showModal(
            "You lost.",
            `You've stomped into a mine having put down ${this.flagCount} flag/s.`
        );
        minesweeperDOMContainer.style.pointerEvents = "none";
    }

    tryWinGame() {
        for (const boxArray of this.boxes) {
            for (const box of boxArray) {
                if (
                    !(
                        (!box.isBomb && !box.isFlagged) ||
                        (box.isBomb && box.isFlagged)
                    )
                ) {
                    return;
                }
            }
        }
        clearInterval(timerInterval);
        showModal("You won!", "You've flagged all of the hazardous mines! 😎");
        minesweeperDOMContainer.style.pointerEvents = "none";
    }
}
