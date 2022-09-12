const minesweeperSettingsInputs = {
    width: document.querySelector(".width-input"),
    height: document.querySelector(".height-input"),
    mineCount: document.querySelector(".mine-input"),
};

const settingsForm = document.querySelector(".minesweeper-settings");

const minesweeperDOMContainer = document.querySelector(".minesweeper");
let minesweeperContainer = null;

function settingsSubmitHandler(event) {
    event.preventDefault();
    if (minesweeperContainer !== null) {
        minesweeperContainer.clearContainer();
        delete minesweeperContainer;
    }
    minesweeperContainer = new MineSweeper();
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

        this.boxes = [];
        this.boxElements = [];
        this.uncovered = [];

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
        for (
            let i = 0;
            i < this.height * this.width && i < this.mineCount;
            i++
        ) {
            let randomVIndex = Math.floor(Math.random() * this.height);
            let randomHIndex = Math.floor(Math.random() * this.width);
            while (
                this.boxes[randomVIndex][randomHIndex].isBomb &&
                (randomVIndex !== vIndex || randomHIndex !== hIndex)
            ) {
                randomVIndex = Math.floor(Math.random() * this.height);
                randomHIndex = Math.floor(Math.random() * this.width);
            }
            this.boxes[randomVIndex][randomHIndex].isBomb = true;
            if (randomVIndex > 0) {
                this.boxes[randomVIndex - 1][randomHIndex].addNearbyBomb(
                    randomVIndex - 1,
                    randomHIndex
                );
            }
            if (randomVIndex < this.height - 1) {
                this.boxes[randomVIndex + 1][randomHIndex].addNearbyBomb(
                    randomVIndex + 1,
                    randomHIndex
                );
            }
            if (randomHIndex > 0) {
                this.boxes[randomVIndex][randomHIndex - 1].addNearbyBomb(
                    randomVIndex,
                    randomHIndex - 1
                );
                if (randomVIndex > 0) {
                    this.boxes[randomVIndex - 1][
                        randomHIndex - 1
                    ].addNearbyBomb(randomVIndex - 1, randomHIndex - 1);
                }
                if (randomVIndex < this.height - 1) {
                    this.boxes[randomVIndex + 1][
                        randomHIndex - 1
                    ].addNearbyBomb(randomVIndex + 1, randomVIndex - 1);
                }
            }
            if (randomHIndex < this.width - 1) {
                this.boxes[randomVIndex][randomHIndex + 1].addNearbyBomb();
                if (randomVIndex > 0) {
                    this.boxes[randomVIndex - 1][
                        randomHIndex + 1
                    ].addNearbyBomb();
                }
                if (randomVIndex < this.height - 1) {
                    this.boxes[randomVIndex + 1][
                        randomHIndex + 1
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
                        this.CumFS(i, o);
                    } else if (this.boxes[i][o].isBomb) {
                        this.boxes[i][o].isUncovered = true;
                        this.boxElements[i][o].classList.add("mine");
                        this.endGame();
                    } else {
                        this.CumFS(i, o);
                    }
                };
                this.boxElements[i][o].addEventListener("click", clickHandler);
                this.boxElements[i][o].addEventListener(
                    "contextmenu",
                    (event) => {
                        event.preventDefault();
                        this.boxes[i][o].toggleFlag();
                        this.boxElements[i][o].classList.toggle("flag-box");
                        if (this.boxes[i][o].isFlagged) {
                            this.boxElements[i][o].removeEventListener(
                                "click",
                                clickHandler
                            );
                        } else {
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
        let gridColumns = "";
        for (let i = 0; i < this.boxes[0].length; i++) {
            gridColumns += "20px ";
        }
        minesweeperDOMContainer.style.gridTemplateColumns = gridColumns;
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
    }

    openBox(vIndex, hIndex) {
        this.boxes[vIndex][hIndex].isUncovered = true;
        this.boxElements[vIndex][hIndex].style.pointerEvents = "none";
        this.boxElements[vIndex][hIndex].classList.add(
            this.boxes[vIndex][hIndex].className
        );
    }

    CumFS(vIndex, hIndex) {
        if (
            this.boxes[vIndex][hIndex].bombsAround > 0 &&
            !this.boxes[vIndex][hIndex].isUncovered
        ) {
            this.openBox(vIndex, hIndex);
        } else if (!this.boxes[vIndex][hIndex].isUncovered) {
            this.openBox(vIndex, hIndex);
            if (vIndex > 0) {
                if (hIndex > 0) {
                    this.CumFS(vIndex - 1, hIndex - 1);
                }
                if (hIndex < this.width - 1) {
                    this.CumFS(vIndex - 1, hIndex + 1);
                }
                this.CumFS(vIndex - 1, hIndex);
            }
            if (vIndex < this.height - 1) {
                if (hIndex > 0) {
                    this.CumFS(vIndex + 1, hIndex - 1);
                }
                if (hIndex < this.width - 1) {
                    this.CumFS(vIndex + 1, hIndex + 1);
                }
                this.CumFS(vIndex + 1, hIndex);
            }
            if (hIndex > 0) {
                this.CumFS(vIndex, hIndex - 1);
            }
            if (hIndex < this.width - 1) {
                this.CumFS(vIndex, hIndex + 1);
            }
        }
    }

    clearContainer() {
        minesweeperDOMContainer.innerHTML = "";
    }

    endGame() {
        console.log("you lost you bastard");
    }
}
