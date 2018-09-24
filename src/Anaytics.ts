import UA from "universal-analytics";

export class Analytics {
    private readonly ua;

    constructor(id?: string){
        this.ua = new UA(id);
    }

    event(...args) {
        return this.ua.event.apply(this.ua, args).send();
    }

    exception(...args) {
        return this.ua.exception.apply(this.ua, args).send();
    }

    set(...args) {
        return this.ua.set.apply(this.ua, args);
    }

    timing(...args) {
        return this.ua.timing.apply(this.ua, args).send();
    }
}
