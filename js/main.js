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
            currentEgresos = matchEgresos.length;
            console.log(currentEgresos)
            console.log(totalEgresos)
            printPatientsChart();
            printEgresosChart()
        })
        firebase.database().ref('/institutos/' + referenciaFinanzasTeleton).on('value', function(snapshot) {
            console.log(snapshot.val());
            var finanzasActuales = snapshot.val();
            ingresosEsperados = parseInt(finanzasActuales.ingEsperados);
            ingresosNecesarios = parseInt(finanzasActuales.recNecesarios);
            ingresosRecaudar = parseInt(finanzasActuales.recRecaudar);
            printFinanzasChart();
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