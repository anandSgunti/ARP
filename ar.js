import { loadGLTF, loadVideo  } from "./libs/loader.js";
import { createChromaMaterial } from "./libs/chroma-video.js";
const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener("DOMContentLoaded", () => {
  const start = async () => {
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: "assets/targets/musicband.mind", // Tracking image
    });
    const { renderer, scene, camera } = mindarThree;

    // const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    // scene.add(light);

    // Load Person Texture (Background Image)
    const personTexture = new THREE.TextureLoader().load("./assets/videos/Person_1.png");
    const personMaterial = new THREE.MeshBasicMaterial({ map: personTexture, transparent: true });

    // Load Videos
    const headVideo = await loadVideo("assets/videos/Head.mp4");
    const handVideo = await loadVideo("assets/videos/hand.mp4");
    const footVideo = await loadVideo("assets/videos/foot.mp4");

    headVideo.muted = false;
    handVideo.muted = false;
    footVideo.muted = false;

    headVideo.playsInline = true;
    handVideo.playsInline = true;
    footVideo.playsInline = true;

    headVideo.pause();
    handVideo.pause();
    footVideo.pause();

    // Create Video Textures
    const headTexture = new THREE.VideoTexture(headVideo);
    const handTexture = new THREE.VideoTexture(handVideo);
    const footTexture = new THREE.VideoTexture(footVideo);

    // Create Person Plane (Main Background)
    const personGeometry = new THREE.PlaneGeometry(2, 3);
    const personPlane = new THREE.Mesh(personGeometry, personMaterial);
    personPlane.position.set(0, 0, 0);
    personPlane.scale.set(0.7, 0.7, 0.7);

    // Create Hotspot Icons (Clickable)
    const hotspotTexture = new THREE.TextureLoader().load("assets/videos/hotspot.png");
    const hotspotMaterial = new THREE.SpriteMaterial({ map: hotspotTexture, transparent: true });

    // Create Hotspot Planes (Initially Hidden)
    function createHotspotPlane(x, y, scale = 2) {
      const hotspotGeometry = new THREE.PlaneGeometry(0.3, 0.2);
      const hotspotMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
      const hotspotPlane = new THREE.Mesh(hotspotGeometry, hotspotMaterial);
      hotspotPlane.position.set(x, y, 0);
      hotspotPlane.scale.set(scale, scale, scale);
      hotspotPlane.visible = false; // Planes are visible for testing
      return hotspotPlane;
    }
    
    const headHotspotPlane = createHotspotPlane(0.2, 0.85);
    const handHotspotPlane = createHotspotPlane(-0.6, 0.55);
    const footHotspotPlane = createHotspotPlane(0.2, -0.95);

   

    // Create Video Planes (Initially Hidden)
    function createVideoPlane(videoTexture, x, y, scale = 2) {
      const videoMaterial = createChromaMaterial(videoTexture, 0x00ff00);
      const videoGeometry = new THREE.PlaneGeometry(1, 2160/3840);
      const videoPlane = new THREE.Mesh(videoGeometry, videoMaterial);
      videoPlane.position.set(x, y, 0);
      videoPlane.scale.set(scale, scale, scale);
      videoPlane.visible = false; // Initially hidden
      return videoPlane;
    }

    const headVideoPlane = createVideoPlane(headTexture, 0.82, 0.62 ); // Video appears to the right of the hotspot
    const handVideoPlane = createVideoPlane(handTexture, -0.5, 0.3); // Video appears to the left of the hotspot
    const footVideoPlane = createVideoPlane(footTexture,1.2, -0.5); // Video appears to the right of the hotspot

    // Assign video references for interaction
    headHotspotPlane.userData = { video: headVideo, plane: headVideoPlane };
    handHotspotPlane.userData = { video: handVideo, plane: handVideoPlane };
    footHotspotPlane.userData = { video: footVideo, plane: footVideoPlane };

    // Create Anchor and Attach Everything
    const anchor = mindarThree.addAnchor(0); 
    anchor.group.add(personPlane);
    anchor.group.add(headHotspotPlane);
    anchor.group.add(handHotspotPlane);
    anchor.group.add(footHotspotPlane);
    anchor.group.add(headVideoPlane);
    anchor.group.add(handVideoPlane);
    anchor.group.add(footVideoPlane);

    // Handle Click Events for Hotspots
    document.body.addEventListener("click", (e) => {
      const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -1 * ((e.clientY / window.innerHeight) * 2 - 1);
      const mouse = new THREE.Vector2(mouseX, mouseY);

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const { video, plane } = clickedObject.userData || {};

        if (video && plane) {
          if (video.paused) {
            video.play();
            plane.visible = true; // Show video when playing
          } else {
            video.pause();
            plane.visible = true; // Hide video when paused
          }
        }
      }
    });

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  };

  start();
});
