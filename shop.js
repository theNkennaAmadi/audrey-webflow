import gsap from "gsap";

export class Shop {
    constructor(container) {
        this.container = container
        this.products = [...this.container.querySelectorAll('.merch-collection-item')];
        this.init();
    }

    init() {
        this.addEventListeners();
    }

    addEventListeners(){
        this.products.forEach(product => {
            let tlProductHover = gsap.timeline({paused: true});
            tlProductHover.to(product.querySelector('.merch-visual-item:nth-child(1)'), {opacity:0, duration: 0.3})
            tlProductHover.to(product.querySelector('.merch-visual-item:nth-child(2)'), {opacity:1, duration: 0.3}, "<0.05")


            product.addEventListener('mouseenter', () => {
                tlProductHover.play();
            })
            product.addEventListener('mouseleave', () => {
                tlProductHover.reverse();
            })
        })
    }
}

new Shop(document.querySelector('.main'))