// it come from threejs examples https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_pointerlock.html
var camera, scene, renderer;//相机，场景，渲染器
var geometry, material, mesh;//几何要素，材质，实物
var controls;//操控器
var objects = [];//三维物体集
var raycaster;//光线投射，射线
var raycasterFBLR,directionFBLR=new THREE.Vector3();// 光线投射，前后左右进行碰撞检测 //临时方向向量directionFBLR
var blocker = document.getElementById( 'blocker' );//屏幕锁dom
var instructions = document.getElementById( 'instructions' );//操作简介

//对屏幕进行鼠标锁定
// http://www.html5rocks.com/en/tutorials/pointerlock/intro/
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
if ( havePointerLock ) {
    var element = document.body;
    var pointerlockchange = function ( event ) {
        if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
            controlsEnabled = true;
            controls.enabled = true;
            blocker.style.display = 'none';
        } else {
            controls.enabled = false;
            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';
            instructions.style.display = '';
        }
    };
    var pointerlockerror = function ( event ) {
        instructions.style.display = '';
    };
    // Hook pointer lock state change events
    document.addEventListener( 'pointerlockchange', pointerlockchange, false );
    document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
    document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
    document.addEventListener( 'pointerlockerror', pointerlockerror, false );
    document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
    document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
    instructions.addEventListener( 'click', function ( event ) {
        instructions.style.display = 'none';
        // Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        if ( /Firefox/i.test( navigator.userAgent ) ) {
            var fullscreenchange = function ( event ) {
                if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
                    document.removeEventListener( 'fullscreenchange', fullscreenchange );
                    document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
                    element.requestPointerLock();
                }
            };
            document.addEventListener( 'fullscreenchange', fullscreenchange, false );
            document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
            element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
            element.requestFullscreen();
        } else {
            element.requestPointerLock();
        }
    }, false );
} else {
    instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
}
//对屏幕进行鼠标锁定 end

//初始化
init();
//动画运行
animate();
var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
function init() {
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );
    scene = new THREE.Scene();
    //scene.fog = new THREE.Fog( 0xffffff, 0, 750 );
    var light = new THREE.AmbientLight( 0xffffff ); //new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    //light.position.set( 0.5, 1, 0.75 );
    scene.add( light );
    controls = new THREE.PointerLockControls( camera );
    scene.add( controls.getObject() );
    var onKeyDown = function ( event ) {
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // w
                moveForward = true;
                break;
            case 37: // left
            case 65: // a
                moveLeft = true; break;
            case 40: // down
            case 83: // s
                moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                moveRight = true;
                break;
            case 32: // space
                if ( canJump === true ) velocity.y += 350;
                canJump = false;
                break;
        }
    };
    var onKeyUp = function ( event ) {
        switch( event.keyCode ) {
            case 38: // up
            case 87: // w
                moveForward = false;
                break;
            case 37: // left
            case 65: // a
                moveLeft = false;
                break;
            case 40: // down
            case 83: // s
                moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                moveRight = false;
                break;
        }
    };
    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );
    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
    raycasterFBLR=new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3(), 0, 10 );//碰撞检测，初始化为[0,0,0]到[0,0,0]，最大检测距离为5
    // floor
    geometry = new THREE.PlaneGeometry( 2000, 2000, 1, 1 );
    geometry.rotateX( - Math.PI / 2 );
    // for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {
    //     var vertex = geometry.vertices[ i ];
    //     vertex.x += Math.random() * 20 - 10;
    //     vertex.y += Math.random() * 2;
    //     vertex.z += Math.random() * 20 - 10;
    // }
    // for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {
    //     var face = geometry.faces[ i ];
    //     face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
    //     face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
    //     face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
    // }
    //material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
    var textureLoader = new THREE.TextureLoader();
    var groundTexture = textureLoader.load( 'assets/grasslight-small.jpg' );
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set( 80, 80 );
    groundTexture.anisotropy = 16;
    var material = new THREE.MeshPhongMaterial({
		map: groundTexture
		//side:THREE.DoubleSide
	});
    mesh = new THREE.Mesh( geometry, material );

    scene.add( mesh );
    
    var skyGeometry=new THREE.SphereGeometry( 1000, 32, 32,0,Math.PI * 2,0,Math.PI/1.8 );
    var skyTexture = textureLoader.load( 'assets/sky.jpg' );
    skyTexture.anisotropy = 16;
    var skyMaterial = new THREE.MeshPhongMaterial({//MeshBasicMaterial
		map: skyTexture,
		side:THREE.BackSide
	});
    skyMesh = new THREE.Mesh( skyGeometry, skyMaterial );
    scene.add(skyMesh);
    // // objects
    geometry = new THREE.BoxGeometry( 20, 20, 20 );
    for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {
        var face = geometry.faces[ i ];
        face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
        face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
        face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
    }
    for ( var i = 0; i < 500; i ++ ) {
        material = new THREE.MeshPhongMaterial( { specular: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );
        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
        mesh.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
        mesh.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;
        scene.add( mesh );
        material.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
        objects.push( mesh );
    }
    
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0xffffff );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    //
    window.addEventListener( 'resize', onWindowResize, false );
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function animate() {
    requestAnimationFrame( animate );
    if ( controlsEnabled ) {
        //正下方下方碰撞，地面、楼层等
        raycaster.ray.origin.copy( controls.getObject().position );
        raycaster.ray.origin.y -= 10;
        var intersections = raycaster.intersectObjects( objects );
        var isOnObject = intersections.length > 0;
        //前后左右碰撞检测
        raycasterFBLR.ray.origin.copy(controls.getObject().position);
        raycasterFBLR.ray.origin.y-=7;//我们也以脚所在位置为准,高度超过3以上进行通过
        controls.getDirection(directionFBLR);//为检测方向向量赋值
        directionFBLR.y=0;//不检测垂直方向
        directionFBLR.normalize();
        //前面是否有物体
        raycasterFBLR.ray.direction.copy(directionFBLR);
        intersections=raycasterFBLR.intersectObjects( objects );
        var frontNoObject=intersections.length < 1;
        //后面是否有物体
        raycasterFBLR.ray.direction.copy(directionFBLR.negate());
        intersections=raycasterFBLR.intersectObjects( objects );
        var backNoObject=intersections.length < 1;
        //右边面是否有物体
        var directionRightX=directionFBLR.z;
        var directionRightZ=-directionFBLR.x;
        directionFBLR.x=directionRightX;
        directionFBLR.z=directionRightZ;
        raycasterFBLR.ray.direction.copy(directionFBLR);
        intersections=raycasterFBLR.intersectObjects( objects );
        var rightNoObject=intersections.length < 1;
        //左面是否有物体
        raycasterFBLR.ray.direction.copy(directionFBLR.negate());
        intersections=raycasterFBLR.intersectObjects( objects );
        var leftNoObject=intersections.length < 1;
        
        var time = performance.now();
        //console.log(time/1000);
        var delta = ( time - prevTime ) / 1000;
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
        if ( moveForward && frontNoObject ) velocity.z -= 400.0 * delta;
        if ( moveBackward && backNoObject ) velocity.z += 400.0 * delta;
        if ( moveLeft && leftNoObject) velocity.x -= 400.0 * delta;
        if ( moveRight && rightNoObject) velocity.x += 400.0 * delta;
        if ( isOnObject === true ) {
            velocity.y = Math.max( 0, velocity.y );
            canJump = true;
        }
        controls.getObject().translateX( velocity.x * delta );
        controls.getObject().translateY( velocity.y * delta );
        controls.getObject().translateZ( velocity.z * delta );
        if ( controls.getObject().position.y < 10 ) {
            //console.log(controls.getObject().position.y);
            velocity.y = 0;
            controls.getObject().position.y = 10;
            canJump = true;
        }
        prevTime = time;
    }
    renderer.render( scene, camera );
}