window.addEventListener("load", function () {
    var user_report = document.getElementById("onUserReport");
    if (user_report) {
        user_report.addEventListener("click", generateUserReport);
    }
});

var generateUserReport = function (e) {

    var type = e.target.getAttribute("data-type");
    switch (type) {
        case "TYPE_A":
            generateReportTypeA();
            break;
        case "TYPE_B":
            generateReportTypeB();
            break;
        default:
            return false;
    }
};

function generateReportTypeA() {

    var form = document.getElementById('quizResultsSelf');
    var idQuiz = form['idQuiz'].value;
    $.ajax({
        url: "/" + account + "/fr/quizresults/getDataTypeA",
        type: 'post',
        async: true,
        headers: {"cache-control": "no-cache"},
        cache: false,
        data: idQuiz,
        dataType: "text",
        success: function (return_data) {

            if (return_data.message == "false") {
                alert("ERREUR: lecture de la base de données impossible...");
                return;
            }

            var return_data_array = JSON.parse(return_data).message;
            var data0 = return_data_array[0];
            var data1 = return_data_array[1];
            var data2 = return_data_array[2];
            OPTION_COMPARE_TO = 'none';
            OPTION_Radar_graph = true;
            PrePDFCreation(JSON.stringify(data0), JSON.stringify(data1), JSON.stringify(data2), JSON.stringify(data1));
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("ERREUR: lecture de la base de données impossible...");
        }
    });
}

function generateReportTypeB() {

    var form = document.getElementById('quizResultsSelf');
    var idQuiz = form['idQuiz'].value;
    $.ajax({
        url: "/" + account + "/fr/quizresults/getDataTypeB",
        type: 'post',
        async: true,
        headers: {"cache-control": "no-cache"},
        cache: false,
        data: idQuiz,
        dataType: "text",
        success: function (return_data) {
            if (return_data.message == "false") {
                alert("ERREUR: lecture de la base de données impossible...");
                return;
            }
            var return_data_array = JSON.parse(return_data).message;
            var data0 = return_data_array[0];
            var data1 = return_data_array[1];
            var data2 = return_data_array[2];
            var data3 = return_data_array[3];
            var data4 = return_data_array[4];
            var data5 = return_data_array[5];
            var data6 = return_data_array[6];
            var data7 = return_data_array[7];
            OPTION_Radar_graph = false;
            CreateUserReport(data0, data1, data2, data3, data4, data5, data6, data7, 25);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("ERREUR: lecture de la base de données impossible...");
        }
    });
}