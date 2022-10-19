import CookieHandler from "./CookieHandler.js";

class Scoreboard {
    #descSort(a, b) {
        if (a.score <= b.score) {
            return 1;
        } else {
            return -1;
        }
    }

    #ascSort(a, b) {
        if (a.score >= b.score) {
            return 1;
        } else {
            return -1;
        }
    }

    constructor(amount, sort, DOMContainer, DOMInputs) {
        this.amount = amount;
        this.sort = sort === "DESC" ? this.#descSort : this.#ascSort;
        this.mode;

        this.records = CookieHandler.get(this.amount, this.sort).data.records;
        this.DOMContainer = DOMContainer;

        this.DOMInputs = DOMInputs;
        this.DOMInputs.forEach((input) => {
            if (input.name === "amount") {
                this.records.forEach((_, ind) => {
                    const tmpOption = document.createElement("option");
                    tmpOption.value = ind + 1;
                    tmpOption.innerText = ind + 1;
                    input.appendChild(tmpOption);
                });
                this.amount =
                    this.amount > this.records.length
                        ? this.records.length
                        : this.amount;
                input.value = this.amount;
            }
            if (input.name === "mode") {
                const putMods = [];
                this.records.forEach(({ mode }) => {
                    if (!putMods.find((val) => val === mode)) {
                        const tmpOption = document.createElement("option");
                        tmpOption.value = mode;
                        tmpOption.innerText = mode;
                        input.appendChild(tmpOption);
                        putMods.push(mode);
                    }
                });
                this.mode = putMods[0];
                input.value = putMods[0];
                this.records = CookieHandler.get(
                    this.amount,
                    this.sort,
                    this.mode
                ).data.records;
            }
            input.addEventListener("change", () => {
                this.changeProperty(input.name, input.value);
            });
        });

        this.createDOMRecords();
    }

    changeProperty(name, value) {
        if (name === "sort") {
            this.sort = value === "DESC" ? this.#descSort : this.#ascSort;
        } else if (name === "amount") {
            this.amount = +value;
        } else {
            this.mode = value;
            this.records = CookieHandler.get(
                -1,
                this.sort,
                this.mode
            ).data.records;
            this.clearDOMRecords();
            this.createDOMRecords();
            this.DOMInputs[2].innerHTML = "";
            this.records.forEach((_, ind) => {
                const tmpOption = document.createElement("option");
                tmpOption.value = ind + 1;
                tmpOption.innerText = ind + 1;
                this.DOMInputs[2].appendChild(tmpOption);
            });
            this.DOMInputs[2].value = this.records.length;
            this.changeProperty("amount", this.records.length);
        }
        if (name !== "mode") {
            this.records = CookieHandler.get(
                this.amount,
                this.sort,
                this.mode
            ).data.records;
            this.clearDOMRecords();
            this.createDOMRecords();
        }
    }

    clearDOMRecords() {
        this.DOMContainer.innerHTML = "";
    }

    createDOMRecords() {
        this.records.forEach((record) => {
            const tmpElement = document.createElement("li");
            tmpElement.classList.add("scoreboard-record");
            tmpElement.innerHTML = `<div class=\"username\">${record.username}</div>`;
            tmpElement.innerHTML += `<div class=\"box-count\">${record.boxCount}</div>`;
            tmpElement.innerHTML += `<div class=\"mine-count\">${record.mineCount}</div>`;
            tmpElement.innerHTML += `<div class=\"time\">${record.time}</div>`;
            tmpElement.innerHTML += `<div class=\"score\">${record.score}</div>`;
            this.DOMContainer.appendChild(tmpElement);
        });
    }
}

const scoreboardContainer = document.querySelector(".scoreboard");
const amountInput = document.querySelector(".amount-input");
const sortInput = document.querySelector(".sort-input");
const modeInput = document.querySelector(".mode-input");

new Scoreboard(10, "DESC", scoreboardContainer, [
    sortInput,
    modeInput,
    amountInput,
]);
