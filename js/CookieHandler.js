export default class CookieHandler {
    static #chosenCookieName = "minesweeperRecords";

    static #getCookie(wantedCookieName) {
        const splitCookies = document.cookie.split(";");
        for (const cookie of splitCookies) {
            const cookieName = cookie.substring(0, cookie.indexOf("="));
            const cookieValue = cookie.substring(cookie.indexOf("=") + 1);
            if (cookieName === wantedCookieName) {
                return JSON.parse(cookieValue);
            }
        }
    }

    static get(wantedAmount, sortFunc, wantedMode = undefined) {
        try {
            const cookieRecords = this.#getCookie(this.#chosenCookieName);
            let preparedCookieRecords = cookieRecords
                .filter((val) => {
                    if (wantedMode) {
                        return val.mode === wantedMode;
                    } else return true;
                })
                .sort(sortFunc);
            preparedCookieRecords = preparedCookieRecords.filter((_, ind) => {
                if (wantedAmount > -1) {
                    return ind < wantedAmount;
                } else return true;
            });
            return {
                status: "success",
                data: {
                    records: preparedCookieRecords,
                },
            };
        } catch (err) {
            return {
                status: "error",
                message: err.message,
            };
        }
    }

    static post(record) {
        try {
            let cookieRecords = this.#getCookie(this.#chosenCookieName) || [];
            cookieRecords.push(record);

            let leastWanted = null;
            let topTenOfRecord = cookieRecords.filter(
                ({ mode }) => mode === record.mode
            );

            if (topTenOfRecord.length > 10) {
                topTenOfRecord = topTenOfRecord.sort((a, b) => {
                    if (a.score <= b.score) {
                        return 1;
                    } else {
                        return -1;
                    }
                });
                leastWanted = topTenOfRecord.pop();
            }

            cookieRecords = cookieRecords.filter((val) => val != leastWanted);

            let splitCookies = document.cookie.split(";");
            let preparedCookies = "";

            if (splitCookies.length > 1) {
                preparedCookies = splitCookies
                    .filter((cookie) => {
                        cookie.substring(0, cookie.indexOf("=")) !==
                            this.#chosenCookieName;
                    })
                    .join();
            }

            document.cookie =
                preparedCookies +
                `${this.#chosenCookieName}=${JSON.stringify(cookieRecords)};`;

            return {
                status: "success",
                data: {
                    record,
                },
            };
        } catch (err) {
            return {
                status: "error",
                message: err.message,
            };
        }
    }
}
