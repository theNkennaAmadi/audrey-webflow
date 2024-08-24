import Swiper from 'swiper/bundle';
// import Swiper and modules styles
import 'swiper/css/bundle';
import gsap from "gsap";

export class Product {
    constructor(container) {
        this.container = container
        this.products = [...this.container.querySelectorAll('.merch-collection-item')];
        this.init();
    }

    init() {
        this.initSwiper();
        this.addEventListeners()
    }

    initSwiper() {
        const swiper = new Swiper(".product-thumb-wrapper", {
            freeMode: true,
            watchSlidesProgress: true,
        });
        const swiper2 = new Swiper(".product-wrapper", {
            direction: "horizontal",
            mousewheel: true,
            speed: 800,
            keyboard: {
                enabled: true,
            },
            thumbs: {
                swiper: swiper,
            },
            breakpoints: {
                // when window width is >= 320px
                480: {
                    direction: "horizontal",
                    pagination: {
                        el: ".swiper-pagination",
                    },
                }
            }
        });


    }
    addEventListeners(){
        this.products.forEach(product => {
            let tlProductHover = gsap.timeline({paused: true});
            //tlProductHover.to(product.querySelector('.merch-visual-item:nth-child(1)'), {opacity:0, duration: 0.3})
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

new Product(document.querySelector('.main'))