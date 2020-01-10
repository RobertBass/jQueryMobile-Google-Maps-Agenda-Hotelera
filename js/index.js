var marcadores = [];
var marcador, marcadorHotel;
var mapa, map;
var latlngInicial = {};
var latlngHotel = {};
var directionsDisplay = new google.maps.DirectionsRenderer();
var directionsService = new google.maps.DirectionsService();


function cambiarPagina(page) {
    $.mobile.changePage("#" + page, {
        transition: "flip"
    });
}


// AGREGAR MARCADOR PARA SELECCIONAR UBICACION DEL HOTEL EN EL MAPA
function agregarMarcador(location) {
    var marcadorNuevo = new google.maps.Marker({
        position: location,
        draggable: true,
        map: mapa
    });

    google.maps.event.addListener(marcadorNuevo, 'click', function () {
        document.getElementById("lat").value = this.getPosition().lat();
        document.getElementById("lng").value = this.getPosition().lng();
    });

    google.maps.event.addListener(marcadorNuevo, 'click', function () {
        verRutas(marcadorNuevo.getPosition());
    });

    marcadores.push(marcadorNuevo);

}


// DIBUJAR LAS RUTAS ENTRE DOS PUNTOS EN EL MAPA
function verRutas(position) {

    directionsDisplay.setMap(mapa);
    directionsDisplay.setMap(map);

    var peticion = {
        origin: latlngInicial,
        destination: position,
        travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(peticion, function (respuesta, estado) {
        if (estado == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(respuesta);
            directionsDisplay.setOptions({
                suppressMarkers: true
            });

        } else {

            alert('Error en el servicio!!: ' + estado);
        }

    });

}


// OBTENER UBICACION ACTUAL DEL CLIENTE
function initMap() {

    navigator.geolocation.getCurrentPosition(function (position) {
        latlngInicial = {
            lng: position.coords.longitude,
            lat: position.coords.latitude
        };

        mostrarMapa(latlngInicial);

    }, function (error) {
        alert("Error: " + error);
    });
}

initMap();


function mostrarDatos(id) {

    var hotel;

    for (var i = 0; i < localStorage.length; i++) {
        var clave = localStorage.key(i);

        if (clave == id) {
            hotel = $.parseJSON(localStorage.getItem(clave));

            $("#ID2").val(hotel.id);
            $("#nombre2").val(hotel.nombre);
            $("#ciudad2").val(hotel.ciudad);
            $("#direccion2").val(hotel.direccion);
            $("#telefono2").val(hotel.telefono);
            $("#estrellas2").val(hotel.estrellas);
            $("#lat2").val(hotel.latitud);
            $("#lng2").val(hotel.longitud);

            var latitud = hotel.latitud;
            var longitud = hotel.longitud;
            var marker, marker2;

            function initMapHotel() {

                var ubHotel = { lat: latitud, lng: longitud };

                var map = new google.maps.Map(document.getElementById('mapa2'),
                    {
                        zoom: 20,
                        center: ubHotel
                    });

                marker = new google.maps.Marker({ position: ubHotel, map: map });
                marker2 = new google.maps.Marker({ position: latlngInicial, map: map });

            }

            initMapHotel();

            google.maps.event.addListener(marker, 'click', function () {
                verRutas(marker.getPosition());
            });

            cambiarPagina("page4");


        }
    }
}


// MOSTRAR MAPA EN LA APLICACION CON EL MARCADOR DE LA UBICACION ACTUAL Y CON EL EVENT LISTENER DE AGREGAR MARCADOR
function mostrarMapa(latlngInicial) {


    var opciones = {
        zoom: 20,
        center: new google.maps.LatLng(latlngInicial.lat, latlngInicial.lng),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };


    mapa = new google.maps.Map(document.getElementById("mapa"), opciones);

    marcador = new google.maps.Marker({
        position: new google.maps.LatLng(latlngInicial.lat, latlngInicial.lng),
        map: mapa,
        title: "Ubicacion Actual"
    });

    google.maps.event.addListener(mapa, 'click', function (event) {
        agregarMarcador(event.latLng);

    });


}


$(document).ready(function () {

    var ID;

    if (localStorage.length > 0) {
        ID = localStorage.length + 1;
    } else {
        ID = 1;
    }

    $("#ID").val(ID);


    // FUNCION PARA REGRESAR DESDE LA PAGINA DE REGISTRO SIN QUE HAYAN RUTAS TRAZADAS EN EL MAPA
    function ocultarRutas(estado) {
        if (estado !== google.maps.DirectionsStatus.OK) {
            directionsDisplay.setMap(null);
        }
    }


    // BUSCAR UBICACION EN EL MAPA
    function buscarDireccion() {
        var nombre = $("#nombre").val();
        var geocoder = new google.maps.Geocoder();

        $.mobile.loading("show", {
            text: "Buscando Hotel",
            textVisible: true,
            theme: "a",
            textonly: false
        });
        geocoder.geocode({
            'address': nombre
        }, function (resultados, estado) {
            if (estado == google.maps.GeocoderStatus.OK) {
                marcador = new google.maps.Marker({
                    map: mapa,
                    position: resultados[0].geometry.location
                });
                mapa.setCenter(resultados[0].geometry.location);
                marcadores.push(marcador);
                $.mobile.loading("hide");


                google.maps.event.addListener(marcador, 'click', function () {
                    document.getElementById("lat").value = this.getPosition().lat();
                    document.getElementById("lng").value = this.getPosition().lng();
                });

                google.maps.event.addListener(marcador, 'click', function () {
                    verRutas(marcador.getPosition());
                });

            } else {
                $.mobile.loading("hide");
                alert("Error en el Servicio!!!" + estado);
            }
        });
    }


    function setMarcadores(mapa) {
        for (var i = 0; i < marcadores.length; i++) {
            marcadores[i].setMap(mapa);
        }
    }


    // LIMPIAR MARCADORES
    function limpiarMarcadores() {
        setMarcadores(null);
    }


    $("#buscar").click(function () {
        buscarDireccion();

    });


    // BOTON REGRESAR A PAGINA PRINCIPAL
    $(".volver").click(function () {

        $("#nombre").val("");
        $("#ciudad").val("");
        $("#direccion").val("");
        $("#telefono").val("");
        $("#estrellas").val("");
        limpiarMarcadores();
        ocultarRutas();
        cambiarPagina("main");

    });


    $("#volver").click(function () {
        cambiarPagina("page3");
    });


    // IR A FORMULARIO DE REGISTRO DE HOTELES
    $("#registrar").click(function () {
        cambiarPagina("page2");
        mostrarMapa();

    });


    // LISTAR HOTELES REGISTRADOS
    $("#verHoteles").click(function () {
        listarHoteles();
        cambiarPagina("page3");

    });


    // LISTAR HOTELES
    function listarHoteles() {

        var lista = "";

        for (var i = 0; i < localStorage.length; i++) {
            var clave = localStorage.key(i);
            var hotel = $.parseJSON(localStorage.getItem(clave));

            lista += '<button onclick="mostrarDatos(\'' + hotel.id + '\')" class="ui-btn ui-icon-arroy-r ui-btn-icon-left ui-shadow-icon">' + hotel.nombre + '</button>';

            $("#lista").html(lista);

        }

    }


    // BOTON GUARDAR DATOS DE HOTELES
    $("#btnRegistrar").click(function (event) {

        event.preventDefault();

        if ($("#nombre").val().trim().length == 0 ||
            $("#ciudad").val().trim().length == 0 ||
            $("#direccion").val().trim().length == 0 ||
            $("#telefono").val().trim().length == 0 ||
            $("#estrellas").val().trim().length == 0 ||
            $("#lat").val().trim().length == 0 ||
            $("#lng").val().trim().length == 0) {

            alert("Por favor llene todos los campos o haga click en el marcador para obtener coordenadas del hotel");


        } else {

            guardarDatos();
            $("#nombre").val("");
            $("#ciudad").val("");
            $("#direccion").val("");
            $("#telefono").val("");
            $("#estrellas").val("");
            $("#lat").val("");
            $("#lng").val("");
            limpiarMarcadores();
            ocultarRutas();
            alert("Datos Almacenados Exitosamente!!!");
            ID++;

        }


    });


    // GUARDAR DATOS REGISTRADOS EN EL FORMULARIO DE REGISTRO
    function guardarDatos() {

        var id = $("#ID").val();
        var nombre = $("#nombre").val();
        var latitud = parseFloat($("#lat").val());
        var longitud = parseFloat($("#lng").val());
        var ciudad = $("#ciudad").val();
        var direccion = $("#direccion").val();
        var telefono = $("#telefono").val();
        var estrellas = $("#estrellas").val();

        var hoteles = {
            id: id,
            nombre: nombre,
            latitud: latitud,
            longitud: longitud,
            ciudad: ciudad,
            direccion: direccion,
            telefono: telefono,
            estrellas: estrellas
        }

        localStorage.setItem(id, JSON.stringify(hoteles));
        ID = localStorage.length + 1;
        $("#ID").val(ID);
    }


    $("#borrar").click(function () {
        clearLocalStorage();
    });

    // Funcion para limpiar Local Storage
    function clearLocalStorage() {
        localStorage.clear();
        alert("Datos eliminados exitosamente");
        ID = 1;
        $("#ID").val(ID);
        $("#lista").html("");

    }

});

