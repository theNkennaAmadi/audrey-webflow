
import gsap from "gsap";
import * as THREE from 'three'
import {ScrollToPlugin} from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

function extractPageSection(url) {
    const urlObject = new URL(url);
    return urlObject.hash; // This will return "#mood"
}

export class Main {
    constructor(container) {
        this.container = container
        this.products = [...this.container.querySelectorAll('.merch-collection-item')];
        this.moods = [...this.container.querySelectorAll('.merch-collection-item')];
        this.musicItems = [...this.container.querySelectorAll('.home-music-cc-item')];
        this.init();
    }

    init() {
        this.initSplitting()
        this.addEventListeners()
        this.initSwiper()

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
                console.log(product)
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
        this.renderer = new THREE.WebGLRenderer({antialias: true});
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

        const geometry = new BentPlaneGeometry(0.1, 1, 0.75, 20, 20);


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

        // GSAP animation for menu titles
        const wrapY = gsap.utils.wrap(-100, (5 - 1) * 100);
        gsap.to(".menu-title", {
            yPercent: (i) => wrapY((progress) * 500 - i * 100),
            opacity: (i) => {
                let m = wrapY((progress) * 500 - i * 100);
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


