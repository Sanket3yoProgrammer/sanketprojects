import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import "./cursor.css";

const Cursor = () => {
    const cursorRef = useRef<HTMLDivElement | null>(null);
    const amount = 20;
    const sineDots = Math.floor(amount * 0.3);
    const width = 26;
    const idleTimeout = 150;
    let lastFrame = 0;
    let mousePosition = { x: 0, y: 0 };
    let dots: Dot[] = [];
    let timeoutID: number;
    let idle = false;

    class HoverButton {
        private hovered = false;
        private animatingHover = false;
        private forceOut = false;
        private timing = 0.65;
        private el: HTMLElement;
        private bg: HTMLElement;

        constructor(id: string) {
            this.el = document.getElementById(id) as HTMLElement;
            this.bg = this.el?.getElementsByClassName("bg")[0] as HTMLElement;

            this.onMouseEnter = this.onMouseEnter.bind(this);
            this.onMouseLeave = this.onMouseLeave.bind(this);

            this.el?.addEventListener("mouseenter", this.onMouseEnter);
            this.el?.addEventListener("mouseleave", this.onMouseLeave);
        }

        private onMouseEnter() {
            this.hoverInAnim();
        }

        private hoverInAnim() {
            if (!this.hovered) {
                this.hovered = true;
                this.animatingHover = true;
                this.forceOut = false;
                gsap.fromTo(
                    this.bg,
                    { x: "-112%" },
                    {
                        x: "-12%",
                        duration: this.timing,
                        ease: "power3.out",
                        onComplete: () => {
                            this.animatingHover = false;
                            if (this.forceOut) {
                                this.forceOut = false;
                                this.hoverOutAnim();
                            }
                        },
                    }
                );
            }
        }

        private onMouseLeave() {
            if (!this.animatingHover) {
                this.hoverOutAnim();
            } else {
                this.forceOut = true;
            }
        }

        private hoverOutAnim() {
            this.hovered = false;
            gsap.to(this.bg, { x: "100%", duration: this.timing, ease: "power3.out" });
        }
    }

    class Dot {
        public x: number = 0;
        public y: number = 0;
        private index: number;
        private anglespeed: number = 0.05;
        private scale: number;
        private range: number;
        private element: HTMLElement;
        private lockX!: number;
        private lockY!: number;
        private angleX!: number;
        private angleY!: number;

        constructor(index: number) {
            this.index = index;
            this.scale = 1 - 0.05 * index;
            this.range = width / 2 - (width / 2) * this.scale + 2;
            this.element = document.createElement("span");
            gsap.set(this.element, { scale: this.scale });

            if (cursorRef.current) {
                cursorRef.current.appendChild(this.element);
            }
        }

        public lock() {
            this.lockX = this.x;
            this.lockY = this.y;
            this.angleX = Math.PI * 2 * Math.random();
            this.angleY = Math.PI * 2 * Math.random();
        }

        public draw(delta: number) {
            if (!idle || this.index <= sineDots) {
                gsap.set(this.element, { x: this.x, y: this.y });
            } else {
                this.angleX += this.anglespeed;
                this.angleY += this.anglespeed;
                this.y = this.lockY + Math.sin(this.angleY) * this.range;
                this.x = this.lockX + Math.sin(this.angleX) * this.range;
                gsap.set(this.element, { x: this.x, y: this.y });
            }
        }
    }

    useEffect(() => {
        if (!cursorRef.current) return;

        const onMouseMove = (event: MouseEvent) => {
            mousePosition.x = event.clientX - 30;
            mousePosition.y = event.clientY - 30;

            resetIdleTimer();
        };

        const onTouchMove = (event: TouchEvent) => {
            mousePosition.x = event.touches[0].clientX - width / 2;
            mousePosition.y = event.touches[0].clientY - width / 2;
            resetIdleTimer();
        };

        const buildDots = () => {
            dots = [];
            for (let i = 0; i < amount; i++) {
                dots.push(new Dot(i));
            }
        };

        const goInactive = () => {
            idle = true;
            dots.forEach((dot) => dot.lock());
        };

        const startIdleTimer = () => {
            timeoutID = window.setTimeout(goInactive, idleTimeout);
            idle = false;
        };

        const resetIdleTimer = () => {
            clearTimeout(timeoutID);
            startIdleTimer();
        };

        const positionCursor = (delta: number) => {
            let x = mousePosition.x;
            let y = mousePosition.y;

            dots.forEach((dot, index, dots) => {
                let nextDot = dots[index + 1] || dots[0];
                dot.x = x;
                dot.y = y;
                dot.draw(delta);

                if (!idle || index <= sineDots) {
                    const dx = (nextDot.x - dot.x) * 0.35;
                    const dy = (nextDot.y - dot.y) * 0.35;
                    x += dx;
                    y += dy;
                }
            });
        };

        const render = (timestamp: number) => {
            const delta = timestamp - lastFrame;
            positionCursor(delta);
            lastFrame = timestamp;
            requestAnimationFrame(render);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("touchmove", onTouchMove);

        buildDots();
        requestAnimationFrame(render);
        startIdleTimer();

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("touchmove", onTouchMove);
            clearTimeout(timeoutID);
        };
    }, []);

    const handleMouseEnter = () => {
        // Change cursor style
    };

    const handleMouseLeave = () => {
        // Reset cursor style
    };

    return (
        <>
            <motion.div className="cursor" id="cursor" ref={cursorRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} />
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="800">
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15" result="goo" />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
                    </filter>
                </defs>
            </svg>
        </>
    );
}
export default Cursor;
