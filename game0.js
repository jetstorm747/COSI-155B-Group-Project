
/*
Game 0
This is a ThreeJS program which implements a simple game
The user moves a cube around the board trying to knock balls into a cone

*/


	// First we declare the variables that hold the objects we need
	// in the animation code
var scene, renderer;  // all threejs programs need these
var camera, avatarCam, edgeCam;  // we have two cameras in the main scene
var avatar;
var monkeyAvatar;
var brs;   //big red sphere
// here are some mesh objects ...
var cycOBJ, cycOBJ2;
var newobj2;
var tigress1, tigress2, tigress3;

var phyobjs = [];

var monsters = [];
var fences = [];
var tmpmonster;
var monstersnames = ["monster2.obj"];
var monsterstextures = ["monstert1.jpg", "monstert7.jpg", "monstert6.jpg"];
var monsterscales = [0.05, 0.06,0.07, 0.05];

var objnames = ["DeadTree.obj","DeadTree.obj", "rock.obj", "house.obj"];
var objtextures = ["treetexture.jpg","treetexture.jpg","rocktexture.jpg", "houset.jpg"];
var objscales = [1,1,2,0.01];

var cone;
var npc;
var lotus;
var level1, level1Geo;

var endScene, endCamera, endText;
var startScene, startCamera;//Jacob
var loseScene, loseCamera;

var deadBox, scoreText;

var meaningless = 0;
meaningless += 1;

var createdGuardian = false;


var controls =
	     {fwd:false, bwd:false, left:false, right:false,
				speed:10, fly:false, reset:false, up:false,
		    camera:camera}

var gameState =
     {score:0, health:10, scene:'main', camera:'none' }


// Here is the main game control
init(); //
initControls();
animate();  // start the animation loop!


function createLoseScene(){
	loseScene = initScene();
	loseText = createSkyBox('youlose.png',10);
	//endText.rotateX(Math.PI);
	loseScene.add(loseText);
	var light1 = createPointLight();
	light1.position.set(0,200,20);
	loseScene.add(light1);
	loseCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
	loseCamera.position.set(0,50,1);
	loseCamera.lookAt(0,0,0);

}
function createEndScene(){
	endScene = initScene();
	endText = createSkyBox('youwon.png',10);
	//endText.rotateX(Math.PI);
	endScene.add(endText);
	var light1 = createPointLight();
	light1.position.set(0,200,20);
	endScene.add(light1);
	endCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
	endCamera.position.set(0,50,1);
	endCamera.lookAt(0,0,0);



}

function createStartScene(){
	startScene = initScene();
	initTextMesh();

	startCamera = new THREE.PerspectiveCamera(  75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	startCamera.position.set(0,0,15);
	startCamera.lookAt(0,0,0);

	gameState.scene = 'start';




}

function initTextMesh(){
	var loader = new THREE.FontLoader();
	loader.load( '/fonts/helvetiker_regular.typeface.json',
							 createStartText);
	console.log("preparing to load the font");

}

//Jacob----------------------------------------------------------------------top
function createStartText(font) {
	var textGeometry1 =
		new THREE.TextGeometry ('PA03',
		{
			font: font,
			size: 4,
			height: 0,
			curveSegments: 12,
			bevelEnabled: false,
			bevelThickness: 0.01,
			bevelSize: 0.08,
			bevelSegments: 5
		}
	);

	var textGeometry2 =
		new THREE.TextGeometry ('>PRESS P TO START<',
		{
			font: font,
			size: 2,
			height: 0,
			curveSegments: 12,
			bevelEnabled: false,
			bevelThickness: 0.01,
			bevelSize: 0.08,
			bevelSegments: 5
		}
	);

	var textMaterial1 = new THREE.MeshBasicMaterial ( {color: 'yellow'});
	var textMesh1 = new THREE.Mesh( textGeometry1, textMaterial1);
	textMesh1.position.set(-7,0,0);
	startScene.add(textMesh1);


	var textMaterial2 = new THREE.MeshBasicMaterial ( {color: 'yellow'});
	var textMesh2 = new THREE.Mesh( textGeometry2, textMaterial2);
	textMesh2.position.set(-14,-4,0);
	startScene.add(textMesh2);

	console.log("addted textMesh to scene");
}

//Jacob----------------------------------------------------------------bottom


/**
  To initialize the scene, we initialize each of its components
*/
function init(){
    initPhysijs();
	scene = initScene();

	createStartScene();//Jacob
	createEndScene();
	createLoseScene();
	initRenderer();
	createMainScene();
	//create lotus
	var p = genRandLoc();
	createGroup("lotus.obj", "lotust.jpg",p[0], p[1],1.5);

}


function createMainScene(){
  // setup lighting
	var light1 = createPointLight();
	light1.position.set(0,200,20);
	scene.add(light1);
	var light0 = new THREE.AmbientLight( 0xffffff,0.25);
	scene.add(light0);

	// create main camera
	camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.set(0,50,0);
	camera.lookAt(0,0,0);


	// create the ground and the skybox
	var ground = createGround('deserttexture.jpg');
	scene.add(ground);
	var skybox = createSkyBox('cloudyt2.jpg',1);
	scene.add(skybox);

	// create the avatar
	avatarCam = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
	// avatar = createAvatar();

	// initmonkeyAvatarJSON();
	cycInitAvatar();
	initmonkeyAvatarOBJ();
	// initOBJmodel(cycOBJ, "DeadTree.obj", "treetexture.jpg",-10,40,1);
	// initOBJmodel(cycOBJ2, "rock.obj", "rocktexture.jpg", -20, -10,2);
	createOBJList(phyobjs, objnames, objtextures, objscales, 0);

	initMonsterList(3);
	// initMonsterList2();
	initFenceList(3);

	// createFence();

	avatarCam.position.set(0,4,0);
	avatarCam.lookAt(0,4,10);

	gameState.camera = avatarCam;

    edgeCam = new THREE.PerspectiveCamera( 120, window.innerWidth / window.innerHeight, 0.1, 1000 );
    edgeCam.position.set(20,20,10);
	gameState.camera = edgeCam;

	// addBalls();

	cone = createConeMesh(4,6);
	cone.position.set(10,3,7);
	scene.add(cone);

	// npc = createBoxMesh2(0x0000ff,1,2,4);
	// npc.position.set(30,5,-30);
	// npc.addEventListener('collision',function(other_object){
	// 	if (other_object==avatar){
	// 		gameState.health -= 1;
	// 		npc.position.set(randN(20)+15,5,randN(20)+15);
	// 		npc.__dirtyPosition = true;
	//
	//
	// 	}
	// });
	// scene.add(npc);

    // var wall = createWall(0xffaa00,50,3,1);
    // wall.position.set(10,0,10);
    // scene.add(wall);
	//console.dir(npc);
	//playGameMusic();
	// brs = createBouncyRedSphere();
	// brs.position.set(-40,40,40);
	// scene.add(brs);
	// console.log('just added brs');
	// console.dir(brs);

	// var platform = createRedBox();
	// platform.position.set(0,50,0);
	// platform.__dirtyPosition=true;
	// scene.add(platform);

	// deadBox = createDeadBox();
	// deadBox.position.set(-20, 5, 20);
	// deadBox.__directPosition = true;
	// scene.add(deadBox);

	initScoreTextMesh();
	// initScoreScoreTextMesh();


	//---------------------------------------JACOB(TOP)--------------------------------------------------------------------------
	initLevel1OBJ();
	//these walls are for preventing the player from walking under the terrain
	//center wall
	var wall1 = createWall('white',49,5,75);
	wall1.position.set(-6,0,14);
	scene.add(wall1);

	//SE box wall
	var wall2 = createWall('white',60,5,60);
	wall2.position.set(66.6,0,-32.5);
	scene.add(wall2);

	//NE box wall
	var wall3 = createWall('white',60,5,60);
	wall3.position.set(68,0,58);
	scene.add(wall3);

	//S long wall
	var wall4 = createWall('white',90,5,1);
	wall4.position.set(-4,0,93);
	scene.add(wall4);

	//N long wall
	var wall5 = createWall('white',90,5,1);
	wall5.position.set(-6,0,-52);
	scene.add(wall5);

	//W long wall
	var wall6 = createWall('white' ,1,5,150);
	wall6.position.set(-47.5,0,20);
	scene.add(wall6);

	//E long wall
	var wall7 = createWall('white' ,1,5,40);
	wall7.position.set(100.6,0,10);
	scene.add(wall7);

	//-------------------------------------JACOB(BOTTOM)------------------------------------------------------


}
function initFenceList(n) {
	// createOBJList(phyobjs, objnames, objtextures, objscales, 0);
	for (var i = 0; i < n; i++) {
		var p = genRandLoc();

		createObjMtlModel(null, fences,p[0], p[1]);


	}

}
function initMonsterList(n) {
	// createOBJList(phyobjs, objnames, objtextures, objscales, 0);
	for (var i = 0; i < n; i++) {
		if (lotus == null)
			console.log("lotus == null");

		var x = 0, z = 0;
		if (lotus == null) {
			var p = genRandLoc();
			x = p[0];
			z = p[1];

		}
		else {
			x = lotus.position.x + (Math.random() * 2 + 2)* (randN(1) > 0.5 ? -1 : 1);
			z = lotus.position.z  + (Math.random() * 2 + 2) * (randN(1) > 0.5 ? 1 : -1);
		}

		createMonstermodel(monsters, tmpmonster, monstersnames[Math.floor(monstersnames.length - 0.01)],
			monsterstextures[Math.floor(randN(monsterstextures.length - 0.01))],
			x,z,
			monsterscales[Math.floor(randN(monsterscales.length - 0.01))],
			1);
		console.log("type of tmpmonster is " + typeof (tmpmonster));

	}

}
function initMonsterList2() {
	console.log("monsters len is " + monsters.length);
	for (var i = 0; i < monsters.length; i++) {
		console.log("monster " + i + "position is " + monsters[i].position);
		monsters[i].position.set(Math.random() * 50,10, Math.random() * 50);
		monsters[i].__dirtyPosition = true;
	}
}
//
function createOBJList(list, names, textures, scales, gravity) {
	for (var i = 0; i < objnames.length; i++) {
		var mesh = null;
		var p = genRandLoc();

		mesh = createOBJmodel(mesh, names[i], textures[i],
			p[0], p[1], scales[i], gravity);
		list.push(mesh);
	}
}

function updateScoreText() {
	scene.remove(scoreText);
	initScoreTextMesh();
}
function initScoreTextMesh(){
	var loader = new THREE.FontLoader();
	loader.load( '/fonts/helvetiker_regular.typeface.json',
		createScoreText);
	console.log("preparing to load the font");

}
function createScoreText(font) {
	var textGeometry1 =
		new THREE.TextGeometry ('Score: ' + gameState.score,
			{
				font: font,
				size: 4,
				height: 0,
				curveSegments: 12,
				bevelEnabled: false,
				bevelThickness: 0.01,
				bevelSize: 0.08,
				bevelSegments: 5
			}
		);
	var textMaterial1 = new THREE.MeshBasicMaterial ( {color: 'yellow'});
	scoreText = new THREE.Mesh( textGeometry1, textMaterial1);


	scoreText.position.set(40, 30, 40);

	scene.add(scoreText);

}
function createDeadBox(){
	var geometry = new THREE.BoxGeometry( 5, 10, 2);

	var texture = new THREE.TextureLoader().load( '../images/skull.jpg');
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;

	texture.repeat.set( 3,3);
	var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );



	// var material = new THREE.MeshLambertMaterial( { color: 0x000000} );
	var pmaterial = new Physijs.createMaterial(material,0.9,0.95);
	mesh = new Physijs.BoxMesh( geometry, pmaterial, 0);
	//mesh = new Physijs.BoxMesh( geometry, material,0 );
	mesh.castShadow = true;
	mesh.addEventListener( 'collision',
		function( other_object, relative_velocity, relative_rotation, contact_normal ) {
			if (other_object==avatar){
				gameState.scene = 'youlose'

			}
		}
	)
	return mesh;
}

function createRedBox(){
	var geometry = new THREE.BoxGeometry( 10, 2, 10);
	var material = new THREE.MeshLambertMaterial( { color: 0xff0000} );
	mesh = new Physijs.BoxMesh( geometry, material, 0);
//mesh = new Physijs.BoxMesh( geometry, material,0 );
	mesh.castShadow = true;
	return mesh;
}

function createBouncyRedSphere(){
    //var geometry = new THREE.SphereGeometry( 4, 20, 20);
    var geometry = new THREE.SphereGeometry( 5, 16, 16);
    var material = new THREE.MeshLambertMaterial( { color: 0xff0000} );
    var pmaterial = new Physijs.createMaterial(material,0.9,0.95);
    var mass = 10;
    var mesh = new Physijs.SphereMesh( geometry, pmaterial, mass );
    mesh.setDamping(0.1,0.1);
    mesh.castShadow = true;

    mesh.addEventListener( 'collision',
	    function( other_object, relative_velocity, relative_rotation, contact_normal ) {
		    if (other_object==avatar){
			    console.log("avatar hit the big red ball");
			    soundEffect('bad.wav');
			    gameState.health = gameState.health - 1;

		    }
	    }
    )

    return mesh;
}

function randN(n){
	return Math.random()*n;
}

function addBalls(){
	var numBalls = 20;


	for(i=0;i<numBalls;i++){
		var ball = createBall();
		ball.position.set(randN(20)+15,30,randN(20)+15);
		scene.add(ball);

		ball.addEventListener( 'collision',
			function( other_object, relative_velocity, relative_rotation, contact_normal ) {
				if (other_object==cone){
					gameState.health++;
					console.log("ball "+i+" hit the cone");
					soundEffect('good.wav');
					gameState.score += 1;  // add one to the score
					updateScoreText();
					if (gameState.score==numBalls) {
						gameState.scene='youwon';
					}

					//Jacob----------------------------------------------------------------------Top
					//when the user gets a score of 5, a plow appears as a sort of powerup
					if (gameState.score == 5) {
						createPLow();
					}
					//Jacob-----------------------------------------------------------------------bottom

        //scene.remove(ball);  // this isn't working ...
					// make the ball drop below the scene ..
					// threejs doesn't let us remove it from the schene...
					this.position.y = this.position.y - 100;
					this.__dirtyPosition = true;
				}
      else if (other_object == avatar){
        gameState.health ++;
      }
			}
		)
	}
}

function playGameMusic(){
	// create an AudioListener and add it to the camera
	var listener = new THREE.AudioListener();
	camera.add( listener );

	// create a global audio source
	var sound = new THREE.Audio( listener );

	// load a sound and set it as the Audio object's buffer
	var audioLoader = new THREE.AudioLoader();
	audioLoader.load( '/sounds/loop.mp3', function( buffer ) {
		sound.setBuffer( buffer );
		sound.setLoop( true );
		sound.setVolume( 0.05 );
		sound.play();
	});
}

function soundEffect(file){
	// create an AudioListener and add it to the camera
	var listener = new THREE.AudioListener();
	camera.add( listener );

	// create a global audio source
	var sound = new THREE.Audio( listener );

	// load a sound and set it as the Audio object's buffer
	var audioLoader = new THREE.AudioLoader();
	audioLoader.load( '/sounds/'+file, function( buffer ) {
		sound.setBuffer( buffer );
		sound.setLoop( false );
		sound.setVolume( 0.5 );
		sound.play();
	});
}

/* We don't do much here, but we could do more!
*/
function initScene(){
	//scene = new THREE.Scene();
    var scene = new Physijs.Scene();
	return scene;
}

function initPhysijs(){
Physijs.scripts.worker = '/js/physijs_worker.js';
Physijs.scripts.ammo = '/js/ammo.js';
}
/*
	The renderer needs a size and the actual canvas we draw on
	needs to be added to the body of the webpage. We also specify
	that the renderer will be computing soft shadows
*/
function initRenderer(){
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight-50 );
	document.body.appendChild( renderer.domElement );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

function createPointLight(){
	var light;
	light = new THREE.PointLight( 0xffffff);
	light.castShadow = true;
	//Set up shadow properties for the light
	light.shadow.mapSize.width = 2048;  // default
	light.shadow.mapSize.height = 2048; // default
	light.shadow.camera.near = 0.5;       // default
	light.shadow.camera.far = 500      // default
	return light;
}

function createBoxMesh(color){
	var geometry = new THREE.BoxGeometry( 1, 1, 1);
	var material = new THREE.MeshLambertMaterial( { color: color} );
	mesh = new Physijs.BoxMesh( geometry, material );
//mesh = new Physijs.BoxMesh( geometry, material,0 );
	mesh.castShadow = true;
	return mesh;
}

function createBoxMesh2(color,w,h,d){
	var geometry = new THREE.BoxGeometry( w, h, d);
	var material = new THREE.MeshLambertMaterial( { color: color} );
	mesh = new Physijs.BoxMesh( geometry, material );
	//mesh = new Physijs.BoxMesh( geometry, material,0 );
	mesh.castShadow = true;
	return mesh;
}

function createWall(color,w,h,d){
var geometry = new THREE.BoxGeometry( w, h, d);
var material = new THREE.MeshLambertMaterial( { color: color} );
mesh = new Physijs.BoxMesh( geometry, material, 0 );
//mesh = new Physijs.BoxMesh( geometry, material,0 );
mesh.castShadow = true;
return mesh;
}

function createInvisibleWall(w,h,d){
		var geometry = new THREE.BoxGeometry( w, h, d);
		var materialOptions = {transparent: true, opacity: 0}
		var material = new THREE.MeshLambertMaterial(materialOptions);
		mesh = new Physijs.BoxMesh( geometry, material, 0 );
		return mesh;
}


function createGround(image){
	// creating a textured plane which receives shadows
	var geometry = new THREE.PlaneGeometry( 200, 200, 200);
	var texture = new THREE.TextureLoader().load( '../images/'+image );
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 15, 15 );
	var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
	var pmaterial = new Physijs.createMaterial(material,0.9,0.05);
	//var mesh = new THREE.Mesh( geometry, material );
	var mesh = new Physijs.BoxMesh( geometry, pmaterial, 0 );

	mesh.receiveShadow = true;

	mesh.rotateX(Math.PI/2);
	return mesh
	// we need to rotate the mesh 90 degrees to make it horizontal not vertical
}

function createSkyBox(image,k){
	// creating a textured plane which receives shadows
	var geometry = new THREE.SphereGeometry( 120, 120, 120 );
	var texture = new THREE.TextureLoader().load( '../images/'+image );
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( k, k );
	var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
	//var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
	//var mesh = new THREE.Mesh( geometry, material );
	var mesh = new THREE.Mesh( geometry, material, 0 );

	mesh.receiveShadow = false;


	return mesh
	// we need to rotate the mesh 90 degrees to make it horizontal not vertical


}

var suzyOBJ;



function createObjMtlModel(newobj2, fences, x, z) {
	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.setBaseUrl( '../models/' );
	mtlLoader.setPath( '../models/' );
	var url ="fence.mtl";
	mtlLoader.load( url, function( materials ) {

		materials.preload();

		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials( materials );
		objLoader.setPath( '../models/' );
		objLoader.load( 'fence.obj', function ( object ) {
			console.log("loading tigress");
			console.dir(object);
			newobj2 = object;
			// object.castShadow = true;

			//ver0
			newobj2.position.set(x,0,z);
			newobj2.scale.set(2.5,2.5,2.5);
			fences.push(newobj2);
			scene.add(newobj2);

			var wall = createInvisibleWall(5.5,6,1);
			wall.position.set(x,0,z);
			scene.add(wall);

			//ver1
			// var geometry = object.children[0].geometry;
			// var material = object.children[0].material;
			// newobj2 = new Physijs.BoxMesh(geometry,material);
			// newobj2.position.set(25,0,5);
			//
			// scene.add( newobj2 );

			//ver2
			// scene.add(object.children[0]);
			// scene.add(object.children[1]);
			// scene.add(object.children[2]);

			//ver3
			// object.position.set(25,0,5);
			// object.children[0].castShadow = true;
			// object.children[0].world = scene;
			// object.children[1].world = scene;
			// object.children[2].world = scene;
			// object.children[1].castShadow = true;
			// object.children[2].castShadow = true;
			// scene.add(object);

			// var tobj = object.children[0];
			// tobj.position.set(40, 0 ,3);
			// scene.add(tobj);
		});

		// lightTigress = createPointLight();
		// lightTigress.position.set(20,10,20);
		// scene.add(lightTigress);
	});

}

function createGroup( objname, texturename, x, z, scale) {
	var loader = new THREE.CycOBJLoader();
	loader.load("../models/" + objname,
		function ( obj) {
			console.log("loading obj file");
			console.dir(obj);
			//scene.add(obj);
			obj.castShadow = true;
			obj.position.set(x, 0,z);
			obj.__dirtyPosition = true;
			lotus = obj;

			// you have to look inside the suzyOBJ
			// which was imported and find the geometry and material
			// so that you can pull them out and use them to create
			// the Physics object ...

			var texture = new THREE.TextureLoader().load( '../images/'+ texturename );
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set( 1, 1 );
			var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
			var pmaterial = new Physijs.createMaterial(material,0.9,0.5);

			for (var i = 0; i < lotus.children.length; i++) {
				var child = lotus.children[i];
				console.log("child processing");
				var geometry = child.geometry;
				lotus.children[i] = new THREE.Mesh(geometry,material);
				lotus.children[i].scale.set(scale,scale,scale);
				lotus.children[i].position.set(x,0,z);
				// lotus.children[i]
				lotus.children[i].castShadow = true;
			}

			// geometry.scale = new THREE.Vector3(5,5,5);



			scene.add(lotus);
			console.log("just added newOBJ");
			//suzyOBJ = new Physijs.BoxMesh(obj);

			//
		},
		function(xhr){
			console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );},

		function(err){
			console.log("error in loading: "+err);}
	)


}

//give a obj, assign the obj to it, with physical body
function createMonstermodel(monsterlist, newobj, objname, texturename, x, z, scale, gravity) {
	var loader = new THREE.CycOBJLoader();
	loader.load("../models/" + objname,
		function ( obj) {
			console.log("loading obj file");
			console.dir(obj);
			//scene.add(obj);
			obj.castShadow = true;
			newobj = obj;

			var texture = new THREE.TextureLoader().load( '../images/'+ texturename );
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set( 1, 1 );
			var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
			var pmaterial = new Physijs.createMaterial(material,0.9,0);
			var geometry = newobj.children[0].geometry;
			// geometry.scale = new THREE.Vector3(5,5,5);
			//
			// var box = new THREE.Box3(new THREE.Vector3(-90.44633483886719,0, -16.83677101135254),
			// 	new THREE.Vector3(90.4465103149414, 122.6279296875, 35.24094772338867));
			// geometry.boundingBox = box;

			newobj = new Physijs.BoxMesh(geometry,pmaterial);
			newobj.scale.set(scale, scale, scale);
			newobj.position.set(x, 1,z);
			newobj.__dirtyPosition = true;
			// newobj.setDamping(0.1,0.1);
			newobj.castShadow = true;

			newobj.addEventListener( 'collision',
				function( other_object, relative_velocity, relative_rotation, contact_normal ) {
					if (other_object==avatar){

						gameState.scene = 'youlose';

					}
					else if (fences.indexOf(other_object) > -1) {
						gameState.scene = 'youwon';
					}
				}
			)


			scene.add(newobj);
			console.log("just added monsterOBJ");
			monsterlist.push(newobj);

		},
		function(xhr){
			console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );},

		function(err){
			console.log("error in loading: "+err);}
	)
}

//give a obj, assign the obj to it, with physical body
function createOBJmodel(newobj, objname, texturename, x, z, scale, gravity) {
	var loader = new THREE.CycOBJLoader();
	loader.load("../models/" + objname,
		function ( obj) {
			console.log("loading obj file");
			console.dir(obj);
			//scene.add(obj);
			obj.castShadow = true;
			newobj = obj;

			// you have to look inside the suzyOBJ
			// which was imported and find the geometry and material
			// so that you can pull them out and use them to create
			// the Physics object ...

			var texture = new THREE.TextureLoader().load( '../images/'+ texturename );
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set( 1, 1 );
			var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
			var pmaterial = new Physijs.createMaterial(material,0.9,0.5);


			var geometry = newobj.children[0].geometry;
			// geometry.scale = new THREE.Vector3(5,5,5);

			newobj = new Physijs.BoxMesh(geometry,pmaterial, gravity);
			newobj.scale.set(scale, scale, scale);
			newobj.position.set(x,0,z);
			newobj.castShadow = true;
			scene.add(newobj);
			console.log("just added newOBJ");
			//suzyOBJ = new Physijs.BoxMesh(obj);

			//
		},
		function(xhr){
			console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );},

		function(err){
			console.log("error in loading: "+err);}
	)
}

function initmonkeyAvatarOBJ(){
	var loader = new THREE.OBJLoader();
	loader.load("../models/suzyA.obj",
				function ( obj) {
					console.log("loading obj file");
					console.dir(obj);
					//scene.add(obj);
					obj.castShadow = true;
					suzyOBJ = obj;
					theOBJ = obj;
					// you have to look inside the suzyOBJ
					// which was imported and find the geometry and material
					// so that you can pull them out and use them to create
					// the Physics object ...
					var geometry = suzyOBJ.children[0].geometry;
					var material = suzyOBJ.children[0].material;
					suzyOBJ = new Physijs.BoxMesh(geometry,material);
					var p = genRandLoc();
					suzyOBJ.position.set(p[0],20,p[1]);
					scene.add(suzyOBJ);
					console.log("just added suzyOBJ");
					//suzyOBJ = new Physijs.BoxMesh(obj);

					//
				},
				function(xhr){
					console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );},

				function(err){
					console.log("error in loading: "+err);}
			)
}

function cycInitAvatar() {
	var loader = new THREE.OBJLoader();
	loader.load("../models/bugdroid.obj",
		function ( obj ) {
			console.log("loading cycvatar");

			obj.castShadow = true;
			var geometry = obj.children[0].geometry;



			var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );



			//geometry.scale.set(0.5,0.5,0.5);
			avatar = new Physijs.BoxMesh( geometry, material );
			avatar.scale.set(0.5,0.5,0.5);
			avatar.__dirtyPosition = true;
			avatar.position.set(51,10,-37);
			avatar.rotateY(-Math.PI/2);
			avatar.__dirtyRotation=true;

			avatar.add(avatarCam);

			avatar.translateY(20);
			avatarCam.translateY(6);
			avatarCam.translateZ(20);

			// newobj.position.set(51, ,z);
			// newobj.__dirtyPosition = true;


			scene.add(avatar);

			gameState.camera = avatarCam;





		},
		function(xhr){
			console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );},
		function(err){console.log("error in loading: "+err);}
	)
}
function initmonkeyAvatarJSON(){
	var loader = new THREE.JSONLoader();

	loader.load("../models/suzanne.json",
				function ( geometry, materials ) {
					console.log("loading monkeyAvatar");
					var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
					//geometry.scale.set(0.5,0.5,0.5);
					avatar = new Physijs.BoxMesh( geometry, material );


					avatar.add(avatarCam);

					avatar.translateY(20);
					avatarCam.translateY(-4);
					avatarCam.translateZ(3);
					scene.add(avatar);

					gameState.camera = avatarCam;





				},
				function(xhr){
					console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );},
				function(err){console.log("error in loading: "+err);}
			)

}

function createConeMesh(r,h){
	var geometry = new THREE.ConeGeometry( r, h, 32);
	var texture = new THREE.TextureLoader().load( '../images/tile.jpg' );
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 1, 1 );
	var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
	var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
	var mesh = new Physijs.ConeMesh( geometry, pmaterial, 0 );
	mesh.castShadow = true;
	return mesh;
}


function createBall(){
	//var geometry = new THREE.SphereGeometry( 4, 20, 20);
	var geometry = new THREE.SphereGeometry( 1, 16, 16);
	var material = new THREE.MeshLambertMaterial( { color: 0xffff00} );
	var pmaterial = new Physijs.createMaterial(material,0.9,0.95);
    var mesh = new Physijs.BoxMesh( geometry, pmaterial );
	mesh.setDamping(0.1,0.1);
	mesh.castShadow = true;
	return mesh;
}

//Jacob------------------------------------------------------------------top
function createPLow(){
	//this function creates a plow that the avatar can use to eaily push balls
	//var geometry = new THREE.SphereGeometry( 4, 20, 20);
	var geometry = new THREE.BoxGeometry( 15, 1, 4);
	var material = new THREE.MeshLambertMaterial( { color: 'red'} );
	var pmaterial = new Physijs.createMaterial(material,2,0);
	var mesh = new Physijs.BoxMesh( geometry, pmaterial );
	mesh.setDamping(0.1,0.1);
	mesh.castShadow = true;

	mesh.position.set(20,1,17)
	scene.add(mesh);
	console.log("added plow");

}

//Jacob--------------------------------------------------------------------bottom

var clock;

function initControls(){
// here is where we create the eventListeners to respond to operations

  //create a clock for the time-based animation ...
	clock = new THREE.Clock();
	clock.start();

	window.addEventListener( 'keydown', keydown);
	window.addEventListener( 'keyup',   keyup );
}

function keydown(event){
	console.log("Keydown: '"+event.key+"'");
	//console.dir(event);
	// first we handle the "play again" key in the "youwon" scene
	if ((gameState.scene == 'youwon' && event.key=='r') ||
		(gameState.scene == 'youlose' && event.key == 'r')) {
		gameState.scene = 'main';
		gameState.score = 0;
		gameState.health = 10;
		updateScoreText();
		// next reposition the big red sphere (brs)
		brs.position.set(-40,40,40);
		brs.__dirtyPosition = true;
		brs.setLinearVelocity(0,1,0);
		addBalls();
		return;

	}
	if (gameState.scene == 'start' && ( event.key == 'p' || event.key == 'P')) {
		gameState.scene = 'main';

	}
	if (gameState.scene == 'main' && (event.key == 'r')) {
        gameState.scene = 'main';
	}



	// this is the regular scene
	console.log("Keydown before switch: '"+event.key+"'");
	switch (event.key){

		// change the way the avatar is moving
		case "w": controls.fwd = true;  break;
		case "s": controls.bwd = true; break;
		case "a": controls.left = true; break;
		case "d": controls.right = true; break;
		case "g": controls.strafeRight= true; break;
		case "l": controls.strafeLeft= true; break;
		case "x": controls.up = true; break;
		case "f": controls.down = true; break;
		case "m": controls.speed = 30; break;


		case "k":
			avatar.position.set(0,60,0);
			avatar.__dirtyPosition = true;
			console.dir(avatar);
			break;


  case " ": controls.fly = true;
      console.log("space!!");
      break;
  case "h": controls.reset = true; break;


		// switch cameras
		case "1": gameState.camera = camera; break;
		case "2": gameState.camera = avatarCam; break;
  case "3": gameState.camera = edgeCam; break;

		// move the camera around, relative to the avatar
		case "ArrowLeft": avatarCam.translateY(1);break;
		case "ArrowRight": avatarCam.translateY(-1);break;
		case "ArrowUp": avatarCam.translateZ(-1);break;
		case "ArrowDown": avatarCam.translateZ(1);break;
		case "Q": console.log("qqqq");avatarCam.translateX(-1);break;
		case "E": avatarCam.translateX(1);break;
		case "r": console.log("case r");avatar.rotation.set(0,0,0); avatar.__dirtyRotation=true;
			console.dir(avatar.rotation); break;

	}

}

function keyup(event){
	//console.log("Keydown:"+event.key);
	//console.dir(event);
	switch (event.key){
		case "w": controls.fwd   = false;  break;
		case "s": controls.bwd   = false; break;
		case "a": controls.left  = false; break;
		case "d": controls.right = false; break;
		case "g": controls.strafeRight= false; break;
		case "l": controls.strafeLeft= false; break;
		//case "r": controls.up    = false; break;
		case "f": controls.down  = false; break;
		case "m": controls.speed = 10; break;
        case " ": controls.fly = false; break;
        case "h": controls.reset = false; break;
				case "x": controls.up=false;break;
	}
}

function updateMonsters() {
	for (var i = 0; i < monsters.length; i++) {
		monsters[i].rotation.set(0,0,0);
		monsters[i].__dirtyRotation=true;
		monsters[i].lookAt(avatar.position);
		var velocity = 0;
		if (monsters[i].position.distanceTo(avatar.position) < 15){
			velocity = 3;

		}
		for (var j = 0; j < fences.length; j++) {
			if (monsters[i].position.distanceTo(fences[j].position) < 5){
				monsters[i].position.y = -50;
				monsters[i].__dirtyPosition = true;
				monsters.splice(i,1);
				gameState.score += 1;
				updateScoreText();
			}
		}
		monsters[i].setLinearVelocity(monsters[i].getWorldDirection().multiplyScalar(velocity));
		// if (level1Geo != null) {
		// 	var boo = level1Geo.containsPoint(monsters[i].position);
		// 	console.log("check boundingbox contains ? " + boo);
		// }
	}
}

function updateNPC(){
	npc.lookAt(avatar.position);
  //npc.__dirtyPosition = true;
	var velocity = -0.5;
	if (npc.position.distanceTo(avatar.position) < 20){
		velocity = 0.5;
	}
	npc.setLinearVelocity(npc.getWorldDirection().multiplyScalar(velocity));
}

var seed = 1;
function random() {
	var x = Math.sin(seed++) * 10000;
	return x - Math.floor(x);
}
//a,b is two diagonal points
function genRandLoc() {
	a = [-45, -49];
	b = [98,90];
	nofly = [
		[[-31,-24], [19,52]],
		[[36.6,28],[98,90]],
		[[38,-49],[98, -4]]
	];

	var xrangeMin = a[0];
	var xrangeMax = b[0];

	var zrangeMin = a[1];
	var zrangeMax = b[1];

	var xRand = 0;
	var zRand = 0;
	while (true) {
		xRand = xrangeMin + (xrangeMax - xrangeMin) * Math.random();
		zRand = zrangeMin + (zrangeMax - zrangeMin) * Math.random();
		var p = [xRand, zRand];
		if (!checkInRange(p,nofly[0]) && !checkInRange(p,nofly[1]) && !checkInRange(p,nofly[2]))
			break;
	}
	console.log("random location is " + xRand + ", " + zRand);
	return [xRand, zRand];


}

function checkInRange(p, rect) {
	var a = rect[0];
	var b = rect[1];

	var xrangeMin = a[0];
	var xrangeMax = b[0];

	var zrangeMin = a[1];
	var zrangeMax = b[1];

	var x = p[0];
	var z = p[1];

	if (x <= xrangeMax && x >= xrangeMin &&
		z <= zrangeMax && z >= zrangeMin) {
		return true;
	}
	else return false;
}


//---------------------------------------------------JACOB(TOP)-----------------------------------------------------------------
//this function creates the terrain mesh from the blender object
function initLevel1OBJ(){
	var loader = new THREE.OBJLoader();
	loader.load("../models/level1redone.obj",
		function ( obj) {
			console.log("loading obj file");
			console.dir(obj);
			//scene.add(obj);
			obj.castShadow = true;
			level1 = obj;
			theOBJ = obj;

			var geometry = level1.children[0].geometry;
			//var material = level1.children[0].material;

			var texture = new THREE.TextureLoader().load( '../images/rocks.jpg' );
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set( 1, 1 );
			var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );


			// var pmaterial = new Physijs.createMaterial(material,0.9,0);


			// level1= new Physijs.BoxMesh(geometry,pmaterial, 0);

			level1 = new THREE.Mesh(geometry, material);
			level1.position.set(20,-13,20);

			//scale up the mesh
			var s = 10.5;
			level1.scale.y=s;
			level1.scale.x=s;
			level1.scale.z=s;

			scene.add(level1);
			console.log("just added level1");


		},
		function(xhr){
			console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );},

		function(err){
			console.log("error in loading: "+err);}
	)
}

//-----------------------------------------------JACOB(BOTTOM)---------------------------------------------------------------------


function updateAvatar(){
	"change the avatar's linear or angular velocity based on controls state (set by WSAD key presses)"

	var forward = avatar.getWorldDirection();

  var vertical_velocity = avatar.getLinearVelocity().y;
	var new_velocity;
	if (controls.fwd){
		new_velocity = forward.multiplyScalar(controls.speed);
	} else if (controls.bwd){
		new_velocity = forward.multiplyScalar(-controls.speed);
	} else if (controls.strafeLeft){
    var axis = new THREE.Vector3( 0, 1, 0 );
    var angle = Math.PI / 2;
		var sideways = forward;
    sideways.applyAxisAngle( axis, angle );
    new_velocity = sideways.multiplyScalar(controls.speed);
	}else if (controls.strafeRight){
      var axis = new THREE.Vector3( 0, 1, 0 );
      var angle = Math.PI / 2;
			var sideways = forward;
      sideways.applyAxisAngle( axis, angle );
			new_velocity = sideways.multiplyScalar(-controls.speed);
	} else {
		new_velocity = avatar.getLinearVelocity();
		new_velocity.x=new_velocity.z=0;
	}
	new_velocity.y = vertical_velocity; //preserve vertical velocity
	avatar.setLinearVelocity(new_velocity);

	if (controls.fly){
        avatar.setLinearVelocity(new THREE.Vector3(0,controls.speed,0));
	}

	if (controls.left){
		avatar.setAngularVelocity(new THREE.Vector3(0,controls.speed*0.15,0));
	} else if (controls.right){
		avatar.setAngularVelocity(new THREE.Vector3(0,-controls.speed*0.15,0));
	}

	if (controls.reset){
        avatar.__dirtyPosition = true;
        avatar.position.set(51,10,-37);
	}
	if (lotus != null && avatar.position.distanceTo(lotus.position) < 3 && gameState.score >= 4) {
		gameState.scene = 'youwon';
	}
}

function updateSuzyOBJ(){
	var t = clock.getElapsedTime();
	suzyOBJ.material.emissive.r = Math.abs(Math.sin(t));
	suzyOBJ.material.color.b=0
}

function updateFences() {
	for (var i = 0; i < monsters.length; i++) {
		for (var j = 0; j < fences.length; j++) {
			if (monsters[i].position.distanceTo(fences[j]) < 3) {
				monsters[i].position.y = -50;
				monsters[i].__dirtyPosition = true;
				monsters.splice(i,1);
			}
		}

	}
		if (newobj2 == null) return;
	deltaX = newobj2.position.x - avatar.position.x;
	deltaY = newobj2.position.y - avatar.position.y;
	deltaZ = newobj2.position.z - avatar.position.z;

	var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);



		if (distance <= 3) {
			gameState.health -= 1;
			// newobj2.position.y = -10;
			scene.remove(newobj2);
			newobj2 = null;
		}

}

function animate() {

	requestAnimationFrame( animate );


	if (gameState.health == 0) gameState.scene = 'youlose';
	switch(gameState.scene) {

		//Jacob--------------------------------------------------------------top
		case "start":
		renderer.render( startScene, startCamera);
		//console.log("Rendering start screen");
		break;
		//Jacob--------------------------------------------------------------bottom

		case "youwon":
			//endText.rotateY(0.005);
			renderer.render( endScene, endCamera );
			break;

		case "main":
			if (!createdGuardian && lotus != null) {
				initMonsterList(3);
				createdGuardian = true;
			}
			updateAvatar();
			// updateNPC();
			updateMonsters();
			// updateFences();
			// updateScoreBox();

			updateSuzyOBJ();
			// if (brs.position.y < 0){
			// 	// when the big red sphere (brs) falls off the platform, end the game
			// 	gameState.scene = 'youwon';
			// }
            edgeCam.lookAt(avatar.position);
			// scoreScoreText.lookAt(avatar.position);
			scoreText.lookAt(avatar.position);

            scene.simulate();
			if (gameState.camera!= 'none'){
				renderer.render( scene, gameState.camera );
			}
			break;
		case "youlose":
			renderer.render( loseScene, loseCamera );
			break;
		default:
		  console.log("don't know the scene "+gameState.scene);

	}

		//draw heads up display ..
	var info = document.getElementById("info");
	info.innerHTML='<div style="font-size:24pt">Score: '
		+ gameState.score
		+ " health="+gameState.health
		+ '</div>';
	}
