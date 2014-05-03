var socket = io.connect('http://localhost');
var totalNogeoTweets = 0;
var limitTweetsTable = 100;
var scene;
    
jQuery(function($) {
    draw();
    
    var tweetsTextTable = $("#tweetstexttable").find('tbody');
    var percentTextTable = $("#percenttexttable").find('tbody');

    socket.on('tweets', function(data) {
        updateTotalTweetsWithoutGeo();
            // Check Limit
            if(totalNogeoTweets >= limitTweetsTable) {
                removeTableRow($("#tweetstexttable"));
            }
        // add it to the table
        tweetsTextTable.prepend("<tr><td>" + data.text + "</td></tr>");
        putPoint("" + data.coordinates[0] +','+ data.coordinates[1] +','+ data.classification);
    });

    socket.on('words', function(data) {
    	percentTextTable.prepend("<tr>" + "<td>" + data.word + "</td>" + "<td>" + data.percent + "</td>" + "</tr>");
    });
});


var draw = function () {

	var webglEl = document.getElementById('webgl');

	if (!Detector.webgl) {
		Detector.addGetWebGLMessage(webglEl);
		return;
	}

	var width  = window.innerWidth;
	var height = window.innerHeight;

	// Earth params
	var radius   = 0.5,
	segments = 32,
	rotation = 6;  

	scene = new THREE.Scene();

	var camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
	camera.position.z = 1.5;


	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(width, height);

	scene.add(new THREE.AmbientLight(0x333333));

	var light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(5,3,5);
	scene.add(light);

	var sphere = createSphere(radius, segments);
	sphere.rotation.y = rotation; 
	scene.add(sphere);



	var clouds = createClouds(radius, segments);
	clouds.rotation.y = rotation;
	scene.add(clouds);


	var stars = createStars(90, 64);
	scene.add(stars);
	var lat = 30.35568154;
	var longi= -81.59736019;
	var phi = (93 - lat) * Math.PI / 180;
	var theta = (16 - longi) * Math.PI / 180;

	var controls = new THREE.TrackballControls(camera);

	webglEl.appendChild(renderer.domElement);

	render();
	window.addEventListener('resize', onWindowResize, false);

	function render() {
		controls.update();

		requestAnimationFrame(render);
		renderer.render(scene, camera);
	}
}

var drawData = function() {

	var data ;
	data = new XMLHttpRequest();

	results = []
	data.open('get', 'beergeo4.txt', true); 
	data.onreadystatechange= boom;
	data.send(null);
	
	function boom() {
		if(data.readyState==4) {
			data2=data.responseText;
			var coords = data2.split("\n");
			for( var i = 0; i < coords.length; ++i ) {
				putPoint(coords[i]);
			}
		}
	}
}

	function putPoint(coord) {
		var tokens = coord.split(',');
		var lat = tokens[0];
		var longi = tokens[1];
		var phi = (90 - lat) * Math.PI / 180;
		var theta = (16 - longi) * Math.PI / 180;
		addPoint(phi, theta, tokens[2]);
	}


	function createSphere(radius, segments) {
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			new THREE.MeshPhongMaterial({
				map:         THREE.ImageUtils.loadTexture('images/2_no_clouds_4k.jpg'),
				bumpMap:     THREE.ImageUtils.loadTexture('images/elev_bump_4k.jpg'),
				bumpScale:   0.005,
				specularMap: THREE.ImageUtils.loadTexture('images/water_4k.png'),
				specular:    new THREE.Color('grey')								
			})
			);
	}

	function addPoint(phi, theta, color) {
		if (color =='wine'){
			clr = 0xFF0000;
		}else {clr = 0x79CDCD}
		point = new THREE.Mesh(
			new THREE.SphereGeometry(.002),
			new THREE.MeshBasicMaterial({
				color: clr,
				transparent: true,
			})
			);
		point.position.x = .501*Math.sin(phi) * Math.cos(theta);
		point.position.y = .501*Math.cos(phi);
		point.position.z = .501*Math.sin(phi) * Math.sin(theta);
		scene.add(point);
	}


	function createClouds(radius, segments) {
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius + 0.003, segments, segments),			
			new THREE.MeshPhongMaterial({
				map:         THREE.ImageUtils.loadTexture('images/fair_clouds_4k.png'),
				transparent: true
			})
			);		
	}

	function createStars(radius, segments) {

		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments), 
			new THREE.MeshBasicMaterial({
				map:  THREE.ImageUtils.loadTexture('images/galaxy_starfield.png'), 
				side: THREE.BackSide
			})
			);
	}

	function onWindowResize( event ) {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}

/**
 * Updating  tweets counter without geotag
 *
 */
function updateTotalTweetsWithoutGeo() {
    totalNogeoTweets = totalNogeoTweets + 1;
    $("span#totaltweetWithoutGeo").html(totalNogeoTweets);
}

/**
 * Remove last table row
 *
 * @param a Table
 */
function removeTableRow(jQtable){
    jQtable.each(function(){
        if($('tbody', this).length > 0){
            $('tbody tr:last', this).remove();
        }else {
            $('tr:last', this).remove();
        }
    });
}