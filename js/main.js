//$("#div_item_list").append('<div class="col-md-3"><div class="item_list"></div></div>');
$.get("./content/index.json",function(result){
    if(result.item_list){
        var items=result.item_list;
        for(var i=0;i<items.length;i++){
            $("#div_item_list").append('<div class="col-md-3" data-tag="'+items[i].tag.toLowerCase()+'"><div class="item_list"><a href="'+items[i].url+'">'+
            '<div class="item_list_title">'+items[i].title+'</div>'+
            '<div class="item_list_description"><h3>'+items[i].title+'</h3>'+items[i].description+'</div></a>'+
            '<div class="item_list_tag"><a href="#'+items[i].tag+'"><i class="fa fa-tag" aria-hidden="true"></i> Tag : '+items[i].tag+'</a> ; <a href="#All"><i class="fa fa-tag" aria-hidden="true"></i> Tag : All</a></div>'+
            '</div></div>');
        }
    }
    AddFilter();
    FormSearch();
});
var camera, scene, controls, renderer,boxmesh;//相机，场景，操作控制，渲染器
var headerDom=document.getElementById("web_header");
InitThreeJS();

//初始化
function InitThreeJS() {
    //camera
    camera = new THREE.PerspectiveCamera(45, headerDom.clientWidth / headerDom.clientHeight, 1, 1000);
    camera.position.z = 150;

    //scene
    scene = new THREE.Scene();
    //scene.fog = new THREE.FogExp2(0xffffff, 0.002);
    //scene.fog = new THREE.Fog(0xffffff, 500,700);

    // lights
    var light = new THREE.DirectionalLight(0xffff00,0.8);
    light.position.set(-300, 0, 0);
    scene.add(light);
    light = new THREE.DirectionalLight(0xff00ff,0.8);
    light.position.set(300, 0, 0);
    scene.add(light);
    //light = new THREE.AmbientLight(0xffffff,0.5);
    //scene.add(light);

    var geometry = new THREE.BoxGeometry( 8, 8, 8 );
    //var material = new THREE.MeshPhongMaterial( { wireframe: true } );
    var material = new THREE.MeshPhongMaterial({ color: 0xffffff});
    boxmesh=new THREE.Mesh(geometry,material);
    scene.add(boxmesh);
    // controls = new THREE.MapControls(terrainMesh);

    //renderer
    renderer = new THREE.WebGLRenderer({ antialias: false,alpha:true});
    renderer.setClearColor(0x000000,0);//scene.fog.color
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(headerDom.clientWidth, headerDom.clientHeight);
    $(renderer.domElement).css({
        "position":"absolute",
        "z-index":2,
        "top":0,
    });
    document.body.appendChild(renderer.domElement);

    window.addEventListener( 'resize', onWindowResize, false );
    animate();

}
function onWindowResize(){
    camera.aspect = headerDom.clientWidth / headerDom.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( headerDom.clientWidth, headerDom.clientHeight );
}
//渲染
function Render() {
    renderer.render(scene, camera);
}

//动画
function animate() {
    requestAnimationFrame(animate);
    boxmesh.rotation.x += 0.005;
	boxmesh.rotation.y += 0.01;
    boxmesh.position.x+=0.5;
    boxmesh.position.y=(headerDom.clientHeight/4)*Math.sin(boxmesh.position.x*0.06);
    if(boxmesh.position.x>headerDom.clientWidth/4){
        boxmesh.position.x=-headerDom.clientWidth/4;
    }
    Render();
}
//类型过滤
function AddFilter(){
    $('#menu_instance a,.item_list_tag a').click(function(){
        var selectType=$(this).attr("href").replace("#","").toLowerCase();
        if(selectType=='all'){
            $('[data-tag]').show();// show all
            return;
        }
        $('[data-tag]').hide();// hide all
        var selectMatch='[data-tag="'+selectType+'"]';// example: [data-tag="javascript"]
        $(selectMatch).show();
    })
}

function FormSearch(){
    $('#txt_search').bind('input propertychange',function (){ 
        var txt_searchKey=$('#txt_search').val().toLowerCase();
        if(txt_searchKey==""){
            $('[data-tag]').show();
        }else{
            $('[data-tag]').each(function(){
                $this=$(this);
                if($this.text().toLowerCase().indexOf(txt_searchKey)>-1){
                    $this.show()
                }else{
                    $this.hide();
                }
            });
        }
    });
}
