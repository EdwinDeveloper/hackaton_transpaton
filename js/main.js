var database = firebase.database();
var institutesReference = database.ref("/institutos/");
var currentInstituteReference = database.ref("/institutos/instituto_10")
var egresosReference = firebase.database().ref('/egresos');
var referenciaFinanzasTeleton;
var totalEgresos = 0;
var currentEgresos = 0;

var institutesArray = [];
var totalPatients = 0;
var institutePatients = 0;

var ingresosEsperados = 0;
var ingresosNecesarios = 0;
var ingresosRecaudar = 0;

var finanzasActuales;

institutesReference.on("value", function(snapshot) {
    $.each(snapshot.val(), function(key, value) {
        institutesArray.push(value)
    });
    for (var value of institutesArray) {
        totalPatients += parseInt(value.capacidad);
    }
    console.log(totalPatients)
})

currentInstituteReference.on('value', function(snapshot) {
    console.log(parseInt(snapshot.val().capacidad));
    institutePatients = parseInt(snapshot.val().capacidad);
})

function getDataReference() {
    var referenciaDeDonacion = $('#donacion-referencia').val();
    firebase.database().ref('/references/' + referenciaDeDonacion).on('value', function(snapshot) {
        referenciaFinanzasTeleton = snapshot.val();
        console.log(referenciaFinanzasTeleton) //Instito asociado a la referencia//
        egresosReference.on("value", function(snapshot) {
            var egresos = snapshot.val();
            var egresosArray = [];
            $.each(egresos, function(key, value) {
                totalEgresos += 1;
                egresosArray.push(value)
            })
            let matchEgresos = egresosArray.filter(egreso => egreso.FL_PACIENTE == referenciaFinanzasTeleton);
            console.log(matchEgresos)
            $(".testimonies-row").empty();
            $("#our-major-cause").empty();
            $.each(matchEgresos,function(key,value){
                console.log(value)
                $(".testimonies-row").append(`
                    <div class="col-lg-6 mb-30">
                        <div class="campaign_box">
                            <div class="camppaign d-flex">
                                <div class="img-box">
                                    <img class="img-fluid" src="img/teleton.jpg" alt="">
                                </div>
                                <div>
                                    <h4><span class="text-uppercase">${value.NB_ALIAS}</span>, ${value.EDAD} AÑOS, <span class="text-uppercase">${value.NB_ENFERMEDAD}</span></h4>
                                    <h4>Testimonio:<br> ${value.DS_TESTIMONIO} </h4>
                                </div>
                            </div>
                            <div class="progress">
                                <div class="progress-bar" role="progressbar" aria-valuenow="76" aria-valuemin="0" aria-valuemax="100" style="width: 76%;">
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                `)

                $("#our-major-cause").append(`
                    <div class="card">
                        <div class="card-body">
                            <figure>
                                <img class="card-img-top img-fluid" src="img/imgconformato/img1.jpg" alt="Card image cap">
                            </figure>
                            <div class="progress">
                                <div class="progress-bar" role="progressbar" aria-valuenow="76" aria-valuemin="0" aria-valuemax="100" style="width: 76%;">
                                    <span>Edad: ${value.EDAD} AÑOS</span>
                                </div><br>
                            </div>
                            <div class="card_inner_body">
                                <div class="card-body-top">
                                    <span class="text-uppercase">${value.NB_ENFERMEDAD}</span>
                                </div>
                                <h4 class="card-title text-uppercase">${value.NB_ALIAS}</h4>
                                <p class="card-text">${value.DS_LOGROS}
                                </p>
                            </div>
                        </div>
                    </div>

                    `)
            })
            
            /*CL_ESTATUS: "E"
DS_LOGROS: "Integraci¢n escolar y social, disminuye asistencia para realizar AVD b sicas, es m s participativa."
DS_TESTIMONIO: " ?Damos las gracias por la ayuda brindada a Valentina??sic abuelita"
EDAD: "6"
FL_PACIENTE: "instituto_1"
NB_ALIAS: "VALE"
NB_ENFERMEDAD: "RETARDO DEL DESARROLLO"
__proto__: Object*/
            currentEgresos = matchEgresos.length;
            console.log(currentEgresos)
            console.log(totalEgresos)
            printPatientsChart();
            printEgresosChart()
        })
        firebase.database().ref('/institutos/' + referenciaFinanzasTeleton).on('value', function(snapshot) {
            //debugger
            console.log(snapshot.val());
            finanzasActuales = snapshot.val();
            ingresosEsperados = parseInt(finanzasActuales.ingEsperados);
            ingresosNecesarios = parseInt(finanzasActuales.recNecesarios);
            ingresosRecaudar = parseInt(finanzasActuales.recRecaudar);
            $(".monto-requerido").text(ingresosRecaudar)
            $(".porcentaje-pacientes-egresados").text(((currentEgresos * 100) / (totalEgresos)).toFixed(2))
            $(".current-patients-percent").text(((institutePatients * 100) / (totalPatients)).toFixed(2))
            printFinanzasChart();
            $(".institute-name").text(finanzasActuales.descripcion)
        });
    });
}

function printPatientsChart() {
    var chartData = [institutePatients, totalPatients - institutePatients];
    var slice1Label = ((institutePatients * 100) / (totalPatients)).toFixed(2) + "%"
    var slice2Label = ((totalPatients - institutePatients) * 100 / (totalPatients)).toFixed(2) + "%"

    var ctx = document.getElementById("patients-chart").getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [slice1Label, slice2Label],
            datasets: [{
                data: chartData,
                borderWidth: 1,
                backgroundColor: ["#ffff00", "#690874"]
            }]
        }
    });
}

function printEgresosChart(){
    var chartData = [currentEgresos.toFixed(2), (totalEgresos - currentEgresos).toFixed(2)];
    console.log(chartData)
    var slice1Label = ((currentEgresos * 100) / (totalEgresos)).toFixed(2) + "%"
    var slice2Label = ((totalEgresos - currentEgresos) * 100 / (totalEgresos)).toFixed(2) + "%"

    var ctx = document.getElementById("egresos-chart").getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [slice1Label, slice2Label],
            datasets: [{
                data: chartData,
                borderWidth: 1,
                backgroundColor: ["#ffff00", "#690874"]
            }]
        }
    });
}

function printFinanzasChart(){
    var chartData = [ingresosRecaudar.toFixed(2), (ingresosNecesarios - ingresosRecaudar).toFixed(2)];
    console.log(chartData)
    var slice1Label = ((ingresosRecaudar * 100) / (ingresosNecesarios)).toFixed(2) + "%"
    var slice2Label = ((ingresosNecesarios - ingresosRecaudar) * 100 / (ingresosNecesarios)).toFixed(2) + "%"

    var ctx = document.getElementById("finanzas-chart").getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [slice1Label, slice2Label],
            datasets: [{
                data: chartData,
                borderWidth: 1,
                backgroundColor: ["#ffff00", "#690874"]
            }]
        }
    });
}