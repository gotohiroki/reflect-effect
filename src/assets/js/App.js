import "../scss/app.scss";

import gsap from 'gsap';
import {Canvas} from "./webgl/canvas";

class App {
    constructor() {
        const observer = this.createObserver();
        this.canvas = new Canvas(document.body, observer);
    }
    createObserver() {
        const state = {
            readyCanvas: false,
        };
        const callback = () => {
            gsap.to('.loading', { opacity: 0, duration: 1, ease: 'power2.in' });
        };
        return new Proxy(state, {
            set(obj, prop, newval, receiver) {
                if (newval) {
                    callback();
                }
                return Reflect.set(obj, prop, newval, receiver);
            },
        });
    }
    dispose() {
        this.canvas.dispose();
    }
}
const app = new App();
window.addEventListener('beforeunload', () => {
    app.dispose();
});
