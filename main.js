import gsap from "gsap";
import * as THREE from 'three'
import {ScrollToPlugin} from "gsap/ScrollToPlugin";
import {ScrollTrigger} from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

function extractPageSection(url) {
    const urlObject = new URL(url);
    return urlObject.hash; // This will return "#mood"
}


export class Main {
    constructor(container) {
        this.container = container
        this.products = [...this.container.querySelectorAll('.home-merch-collection-item')];
        this.moods = [...this.container.querySelectorAll('.merch-collection-item')];
        this.musicItems = [...this.container.querySelectorAll('.home-music-cc-item')];
        this.init();
    }

    init() {
        this.initSplitting()
        this.addEventListeners()
        this.initSwiper()
        this.prelaunch()
    }

    prelaunch(){
        // Set the date we're counting down to
        const targetDate = new Date('October 18, 2024 00:00:00 EST').getTime();

        // Update the countdown every second
        let countdown = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            // Time calculations for days, hours, minutes and seconds
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Display the result in the corresponding elements
            document.getElementById("days").innerHTML = days < 10 ? '0' + days : days;
            document.getElementById("hours").innerHTML = hours < 10 ? '0' + hours : hours;
            document.getElementById("minutes").innerHTML = minutes < 10 ? '0' + minutes : minutes;
            document.getElementById("seconds").innerHTML = seconds < 10 ? '0' + seconds : seconds;

            // If the countdown is over, stop the timer and display a message
            if (distance < 0) {
                clearInterval(countdown);
                document.querySelector(".prelaunch").remove();
                document.body.classList.remove('no-scroll')
            }
        }, 1000);

        gsap.fromTo('.time-unit', {yPercent: 20, opacity: 0}, {yPercent: 0, opacity: 1, stagger: 0.35, duration: 2, ease: 'expo.out', delay: 1})
    }

    initSplitting() {
        //Initialize Splitting, split the text into characters and get the results
        const targets = [...this.container.querySelectorAll("[split-text]")];
        const results = Splitting({ target: targets, by: "chars" });

        //Get all the words and wrap each word in a span
        let words = this.container.querySelectorAll(".word");
        words.forEach((word) => {
            let wrapper = document.createElement("span");
            wrapper.classList.add("char-wrap");
            word.parentNode.insertBefore(wrapper, word);
            wrapper.appendChild(word);
        });

        //Get all the characters and move them off the screen
        this.chars = results.map((result) => result.chars);
        gsap.set(this.chars, { yPercent: 120});

        //Group the characters into pairs because we have one for title and one for category, we need this for accurate index
        //this.charGroups = this.groupItems(chars);
        this.showText()
    }

    showText(){
        const scrollWords = [...document.querySelectorAll('[split-text="scroll"]')]
        const scrollWords2 = [...document.querySelectorAll('[split-text="lines"]')]

        scrollWords.forEach(word=>{
            gsap.to(word.querySelectorAll('.char'), {
                yPercent: 0,
                stagger: 0.1,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: word,
                    invalidateOnRefresh: true,
                    start: 'top 98%',
                    duration:1,
                    ease: 'expo.out',
                }
            })
        })

        scrollWords2.forEach(word=>{
            gsap.to(word.querySelectorAll('.char'), {
                yPercent: 0,
                duration: 2,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: word,
                    invalidateOnRefresh: true,
                    start: 'top 98%',
                    duration:1,
                    scrub: true,
                    ease: 'expo.out',
                }
            })
        })

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

        this.moods.forEach(mood => {
            let tlProductHover = gsap.timeline({paused: true});
            tlProductHover.to(mood.querySelector('.home-mood-title'), {opacity:1, duration: 0.5} )

             mood.addEventListener('mouseenter', () => {
                tlProductHover.play();
            })
            mood.addEventListener('mouseleave', () => {
                tlProductHover.reverse();
            })
        })

        this.musicItems.forEach(musicItem => {
            let tlMusic = gsap.timeline({paused: true});
            tlMusic.to(musicItem.querySelector('.listen-wrapper'), {clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5})
                    .to(musicItem.querySelectorAll('.char'), {yPercent: 0, stagger: 0.05, ease: 'expo.out'}, "<")

             musicItem.addEventListener('mouseenter', () => {
                 tlMusic.timeScale(1)
                tlMusic.play();
            })
            musicItem.addEventListener('mouseleave', () => {
                tlMusic.timeScale(1.5)
                tlMusic.reverse();
            });
        })
    }


    initSwiper() {
        this.swiper = new Swiper(".swiper", {
            slidesPerView: 'auto',
            spaceBetween: 16,
            grabCursor: true,
            centeredSlides: true,
            loop: true,
            navigation: {
                nextEl: ".arrow-block.next",
                prevEl: ".arrow-block.prev",
            },
        });
    }
}

new Main(document.querySelector('.main'))

class CanvasImageSequencePlayer {
    constructor(container, imageCount, baseUrl) {
        this.container = container;
        this.imageCount = imageCount;
        this.baseUrl = baseUrl;
        this.currentIndex = 0;
        this.images = [];
        this.isPlaying = false;
        this.interval = 30; // Interval between frames in milliseconds
        this.lastTime = 0;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);

        this.preloadImages().then(() => {
            //console.log('All images preloaded for container:', container);
            this.play(); // Start playing once images are preloaded
        }).catch((error) => {
           // console.error('Error preloading images for container:', container, error);
        });

        //window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();
    }

    async preloadImages() {
        const loadPromises = [];

        for (let i = 0; i <= this.imageCount; i++) {
            const img = new Image();
            img.src = `${this.baseUrl}/${String(i).padStart(4, '0')}.webp`;
            //console.log(`Loading image: ${img.src}`);
            loadPromises.push(new Promise((resolve, reject) => {
                img.onload = () => {
                   // console.log(`Image loaded: ${img.src}`);
                    resolve(img);
                };
                img.onerror = () => {
                    //console.error(`Error loading image: ${img.src}`);
                    reject(new Error(`Failed to load image: ${img.src}`));
                };
            }));
        }

        this.images = await Promise.all(loadPromises);
    }

    resizeCanvas() {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
       // console.log(`Canvas resized to: ${this.canvas.width}x${this.canvas.height}`);
    }

    play() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.lastTime = performance.now();
            this.update();
          //  console.log('Animation started for container:', this.container);
        }
    }

    stop() {
        this.isPlaying = false;
       // console.log('Animation stopped for container:', this.container);
    }

    update() {
        if (!this.isPlaying) return;

        requestAnimationFrame((timestamp) => {
            const elapsed = timestamp - this.lastTime;

            if (elapsed > this.interval) {
                this.currentIndex = (this.currentIndex + 1) % this.images.length;
                this.drawFrame();
                this.lastTime = timestamp;
            }

            this.update();
        });
    }

    drawFrame() {
        const img = this.images[this.currentIndex];
        const canvasAspect = this.canvas.width / this.canvas.height;
        const imgAspect = img.width / img.height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasAspect > imgAspect) {
            drawWidth = this.canvas.width;
            drawHeight = drawWidth / imgAspect;
            offsetX = 0;
            offsetY = (this.canvas.height - drawHeight) / 2;
        } else {
            drawHeight = this.canvas.height;
            drawWidth = drawHeight * imgAspect;
            offsetX = (this.canvas.width - drawWidth) / 2;
            offsetY = 0;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }
}

// Usage
document.addEventListener('DOMContentLoaded', () => {
    //const containers = document.querySelectorAll('.tiles-bg-content');
    /*
    containers.forEach((container) => {
        new CanvasImageSequencePlayer(
            container, // The container element
            120,       // Number of images (from 0000 to 0120)
            'https://cdn.jsdelivr.net/gh/theNkennaAmadi/audrey-webflow@master/public' // Base URL for images
        );
    });

     */
});




class BentPlaneGeometry extends THREE.PlaneGeometry {
    constructor(radius, ...args) {
        super(...args);
        let p = this.parameters;
        let hw = p.width * 0.5;
        let a = new THREE.Vector2(-hw, 0);
        let b = new THREE.Vector2(0, radius);
        let c = new THREE.Vector2(hw, 0);
        let ab = new THREE.Vector2().subVectors(a, b);
        let bc = new THREE.Vector2().subVectors(b, c);
        let ac = new THREE.Vector2().subVectors(a, c);
        let r = (ab.length() * bc.length() * ac.length()) / (2 * Math.abs(ab.cross(ac)));
        let center = new THREE.Vector2(0, radius - r);
        let baseV = new THREE.Vector2().subVectors(a, center);
        let baseAngle = baseV.angle() - Math.PI * 0.5;
        let arc = baseAngle * 2;
        let uv = this.attributes.uv;
        let pos = this.attributes.position;
        let mainV = new THREE.Vector2();
        for (let i = 0; i < uv.count; i++) {
            let uvRatio = 1 - uv.getX(i);
            let y = pos.getY(i);
            mainV.copy(c).rotateAround(center, arc * uvRatio);
            pos.setXYZ(i, mainV.x, y, -mainV.y);
        }
        // Adjust UV mapping to cover the surface without distortion
        this.computeBoundingBox();
        let boundingBox = this.boundingBox;
        let width = boundingBox.max.x - boundingBox.min.x;
        let height = boundingBox.max.y - boundingBox.min.y;
        for (let i = 0; i < uv.count; i++) {
            // Get the U and V coordinates and shift them to center the texture
            let u = uv.getX(i) - 0.5;  // Center U coordinates
            let v = uv.getY(i) - 0.5;  // Center V coordinates

            // Flip the U coordinate (horizontal flip)
            u = -u;

            // Optionally, flip the V coordinate as well (vertical flip)
            // v = -v;

            // Set the new UV values, ensuring they are still centered and scaled
            uv.setXY(i, (u * width) + 0.5, (v * height) + 0.5);
        }

        uv.needsUpdate = true;
        pos.needsUpdate = true;
    }
}

class MeshSineMaterial extends THREE.MeshBasicMaterial {
    constructor(parameters = {}) {
        super(parameters);
        this.setValues(parameters);
        this.time = { value: 0 };
    }
    onBeforeCompile(shader) {
        shader.uniforms.time = this.time;
        shader.vertexShader = `
      uniform float time;
      ${shader.vertexShader}
    `;
        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `vec3 transformed = vec3(position.x, position.y + sin(time + uv.x * PI * 4.0) / 4.0, position.z);`
        );
    }
}

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

let menuItems = [...document.querySelectorAll('.menu-title')];

let items = menuItems.map((item) => {
    const link = item.querySelector('a').href;
    const imgURL = item.querySelector('.menu-image').src;
    const videoURL = item.getAttribute('data-video-url');
    const poster = item.querySelector('.fallback-image').src;
    return { link, imgURL, videoURL, poster };
});


class Home{
    dragging = false;
    lastX = 0;
    dragOffset = 0;
    currentX = 0;
    deltaX = 0;
    dragMoved = false;
    scaleModifer;
    scrollPercent = 0;
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
    cards = [];

    constructor(container) {
        this.container = container;
        this.canvasContainer = this.container.querySelector('#canvas-container')

        this.init();
    }

    init(){
        this.initScene();
        this.initCamera();
        this.initRenderer();
        this.initRig();
        this.setUpEventFunctions();
        this.calculateScale();
        this.fadeInElements()
        this.initWindowEvents();
        this.createCarousel();
        this.animate();
    }

    initScene(){
        this.scene = new THREE.Scene()
    }

    initCamera(){
        this.camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 10);
    }

    initRenderer(){
        THREE.ColorManagement.enabled = true;
        this.renderer = new THREE.WebGLRenderer({antialias: false});
        this.renderer.setSize(sizes.width, sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.setClearColor(0xffffff, 0);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.canvasContainer.appendChild(this.renderer.domElement);
    }

    initRig(){
        this.rig = new THREE.Group();
        this.rig.rotation.set(0, 0, 0.15)
        this.rig.position.set(0, 0, 0)
        this.scene.add(this.rig);
    }

    setUpEventFunctions(){
        this.onPointerDown = (e) => {
            this.dragging = true;
            setTimeout(() => {this.dragMoved = false}, 50);
            this.lastX = e.clientX || e.touches[0].clientX;
        };

        this.onPointerMove = (e)=> {
            if (this.dragging) {
                this.dragMoved = true; // Mark that dragging has moved
                this.currentX = e?.clientX || e.touches[0]?.clientX;
                this.deltaX = this.currentX - this.lastX;
                this.rig.rotation.y += this.deltaX * 0.01;
                this.lastX = this.currentX;
                this.dragOffset += this.deltaX / window.innerWidth;
            }
        }

        this.onPointerUp = (e) => {
            this.dragging = false;
            if(!this.dragMoved){
                this.handleCardClick(e);
            }
        };

        this.handleCardClick= (event)=> {
            // Update the pointer position
            if(event?.clientX || event.touches[0]?.clientX){
                this.pointer.x = ((event.clientX || event.touches[0].clientX) / window.innerWidth) * 2 - 1;
                this.pointer.y = -((event.clientY || event.touches[0].clientY) / window.innerHeight) * 2 + 1;

                // Update the raycaster with the new pointer position
                this.raycaster.setFromCamera(this.pointer, this.camera);

                // Get the list of objects the ray intersects
                const intersects = this.raycaster.intersectObjects(this.cards);

                // If there is one (or more) intersections
                if (intersects.length > 0) {
                    // Check the first object in the list of intersections
                    const card = intersects[0].object;


                    gsap.to(window, { duration: 1.5, scrollTo: extractPageSection(card.userData.link) });

                }
            }

        }

    }

    calculateScale = ()=> {
        const width = document.body.clientWidth
       // console.log(width)
        if (width >= 620) {
            this.scaleModifer = 1;
        } else if(width >= 460 && width <620) {
            this.scaleModifer = 0.004 * width - 1.35;
        }
        else {
            // Optionally handle cases where width < 420, assuming scale remains at 0.6
            this.scaleModifer = 0.004 * width - 1.04;
        }
        gsap.to(this.rig.scale, { x: this.scaleModifer, y: this.scaleModifer, z: this.scaleModifer, duration: 0.3 });
    }

    initWindowEvents(){
        this.onWindowResize=()=> {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }

        window.addEventListener("resize", this.onWindowResize);
        window.addEventListener("resize", this.calculateScale);

        this.renderer.domElement.addEventListener("pointermove", (e)=>{
            this.onPointerMove(e);
        });
        this.renderer.domElement.addEventListener("pointerup", (e)=>{
            this.onPointerUp(e);
        });
        this.renderer.domElement.addEventListener("touchmove",(e)=>{
            this.onPointerMove(e)
        });
        this.renderer.domElement.addEventListener("touchend", (e)=>{
            this.onPointerUp(e);
        });

        // Add a 'mouseup' event listener to the renderer's DOM element
        this.renderer.domElement.addEventListener('mouseup', (event) => {
           // this.handleCardClick(event);
        });



        window.addEventListener('touchstart', this.onPointerDown);
        window.addEventListener("pointerdown", this.onPointerDown);

        //window.addEventListener('scroll', this.onScroll);
        window.addEventListener('pointermove', (event)=>{
            this.onPointerMoveForRaycasting(event)
        });
    }

    fadeInElements(){
        gsap.to('.home-header, .home-footer', { opacity: 1, duration:1, delay:1 });
    }

    videoTexture(url, poster) {
        const video = document.createElement('video');
        video.src = url;
        video.crossOrigin = 'Anonymous';
        video.loop = true;
        video.muted = true;
        video.poster = poster;
        video.playsInline = true;
        video.play();

        const texture = new THREE.VideoTexture(video);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.readyState = !video.paused
        return new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    }

    createCard(link, imgURL, poster, isVideo, videoURL) {
        const imgTexture = new THREE.TextureLoader().load(poster);
        imgTexture.colorSpace = THREE.SRGBColorSpace;
        let videoTexture = null
        if(isVideo){
            videoTexture = this.videoTexture(videoURL, poster);
        }

        const material = isVideo && videoTexture.map.readyState? videoTexture : new THREE.MeshBasicMaterial({ map: imgTexture, side: THREE.DoubleSide });

        const geometry = new BentPlaneGeometry(0.1, 1, 1, 20, 20);


        const mesh = new THREE.Mesh(geometry, material);


        mesh.userData.link = link;
        mesh.userData.hovered = false;

        const onPointerOver = () => {
            mesh.userData.hovered = true;
            gsap.to(mesh.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.3 });
        };
        const onPointerOut = () => {
            mesh.userData.hovered = false;
            gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
        };

        mesh.addEventListener('pointerover', onPointerOver);
        mesh.addEventListener('pointerout', onPointerOut);


        return mesh;
    }

    createCarousel(){
        const radius = 1;


        items.map((item, index) => {
            const position = [
                Math.sin((index / items.length) * Math.PI * 2) * radius,
                0,
                Math.cos((index / items.length) * Math.PI * 2) * radius
            ];
            const rotation = [0, Math.PI + (index / items.length) * Math.PI * 2, 0];

            const card = this.createCard(item.link, item.imgURL, item.poster, Boolean(item.videoURL), item.videoURL);
            card.position.set(...position);
            card.rotation.set(...rotation);
            this.rig.add(card);
            this.cards.push(card);
        });
    }

    onScroll() {
        this.scrollPercent = document.documentElement.scrollTop / (document.documentElement.scrollHeight - window.innerHeight);
        this.rig.rotation.x = this.scrollPercent * Math.PI * 2;
    }


    onPointerMoveForRaycasting(event) {
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    getNormalizedRotation() {
        // Get the current rotation of the rig in the y-axis
        let currentRotation = this.rig.rotation.y;

        // Normalize the rotation
        let normalizedRotation = currentRotation % (2 * Math.PI);

        // If the normalized rotation is negative, add 2 * Math.PI to make it positive
        if (normalizedRotation < 0) {
            normalizedRotation += 2 * Math.PI;
        }

        // Divide the normalized rotation by 2 * Math.PI to get a value between 0 and 1
        this.progress = normalizedRotation / (2 * Math.PI);

       // console.log(this.progress)

        return this.progress;
    }

    animate() {
        let dragOffset = this.dragOffset;
        let animate = this.animate.bind(this);

        // Find the card closest to the camera
        let minDistance = Infinity;
        let closestCard = null;

        this.getNormalizedRotation()


        let progress = (1- this.progress);
        this.cards.forEach((card, i) => {
            // Apply the rig's transformation to the card's position
            let vector = card.position.clone();
            vector.applyMatrix4(this.rig.matrixWorld);

            // Calculate distance from the camera
            let distance = vector.distanceTo(this.camera.position);

            // Check if this card is closer to the camera
            if (distance < minDistance) {
                minDistance = distance;
                closestCard = card;
            }
        });

        // Scale the closest card
        if (this.previousClosestCard && this.previousClosestCard !== closestCard) {
            // Reset the previous closest card scale
            gsap.to(this.previousClosestCard.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
        }

        if (closestCard) {
            gsap.to(closestCard.scale, { x: 1.35, y: 1.35, z: 1.35, duration: 0.3 });
        }

        // Store the closest card for the next frame
        this.previousClosestCard = closestCard;

        //console.log(dragOffset)

        const itemsLength = items.length;
        const itemsPercent = itemsLength *100;

        // GSAP animation for menu titles
        const wrapY = gsap.utils.wrap(-100, (itemsLength - 1) * 100);
        gsap.to(".menu-title", {
            yPercent: (i) => wrapY((progress) * itemsPercent - i * 100),
            opacity: (i) => {
                let m = wrapY((progress) * itemsPercent - i * 100);
                if (m < 0 || m < 100) {
                    return m / 100 + 1 - 0.1;
                } else {
                    return 0;
                }
            },
            ease: 'none',
            duration: 0.1,
        });

        gsap.to(this.camera.position, {
            x: -this.pointer.x * 2,
            y: this.pointer.y + 0.5,
            z: 10,
            duration: 0.7,
            ease: 'power1.out', // This easing function is similar to the damping effect
            onUpdate: () => this.camera.updateProjectionMatrix() // Update the camera's matrix after each tick
        });

        // Update the raycaster with the new pointer position
        this.raycaster.setFromCamera(this.pointer, this.camera);

        // Get the list of objects the ray intersects
        const intersects = this.raycaster.intersectObjects(this.cards);

        // If there is one (or more) intersections
        if (intersects.length > 0) {
            // Check the first object in the list of intersections
            const card = intersects[0].object;

            // If the card is not already being hovered
            if (!card.userData.hovered) {
                card.userData.hovered = true;

                // Scale up the card
                //gsap.to(card.scale, { x: 1.35, y: 1.35, z: 1.35, duration: 0.3 });
                gsap.to(document.querySelector('canvas'), { cursor: 'pointer' })
            }
        }else {
            // If there are no intersections, reset all cards
            this.cards.forEach((card) => {
                if (card.userData.hovered) {
                    card.userData.hovered = false;

                    // Scale down the card
                    //gsap.to(card.scale, { x: 1, y: 1, z: 1, duration: 0.1 });
                    gsap.to(document.querySelector('canvas'), { cursor: 'grab' })
                }
            });
        }

        // Camera movement based on pointer
        // this.camera.position.x = -dragOffset * 20;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(animate);
    }



}

new Home(document.querySelector('.main'));



