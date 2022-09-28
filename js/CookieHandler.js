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

    static get(wantedAmount, sortFunc) {
        try {
            console.log(sortFunc);
            const cookieRecords = this.#getCookie(this.#chosenCookieName);
            console.log(cookieRecords);
            const preparedCookieRecords = cookieRecords
                .filter((_, ind) => ind < wantedAmount)
                .sort(sortFunc);
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
            const cookieRecords = this.#getCookie(this.#chosenCookieName) || [];
            cookieRecords.push(record);
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
