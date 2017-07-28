var PDF_GEN_OPTION_ANSWERS_SHORT = 0;
var PDF_GEN_OPTION_SHOW_GRAPH = 1;
var PDF_GEN_OPTION_SHOW_ANSWERS = 2;
var PDF_GEN_OPTION_SEPERATE_PDF = 3;
var PDF_GEN_OPTION_USER_REPORT_COMPARE = 4;
var PDF_GEN_OPTION_SHOW_ANSWERS_SCORES = 5;
var PDF_GEN_OPTION_SHOW_BEST_ANSWERS = 6;

var PDF_GEN_OPTION_STATISTIC_QUIZ = 0;
var PDF_GEN_OPTION_STATISTIC_TO_COMPARE = 1;

var DB_QUIZ_RESULTS_ID = 0;
var DB_QUIZ_RESULTS_QUIZ_ID = 1;
var DB_QUIZ_RESULTS_USER_ID = 2;
var DB_QUIZ_RESULTS_START_DATE = 3;
var DB_QUIZ_RESULTS_END_DATE = 4;
var DB_QUIZ_RESULTS_PROGRESS_ID = 5;
var DB_QUIZ_RESULTS_ANSWERS = 6;
var DB_QUIZ_RESULTS_QUIZ_SCORE = 7;
var DB_QUIZ_RESULTS_PREVIOUS_ANSWERS = 8;
var DB_QUIZ_RESULTS_PREVIOUS_SCORES = 9;
var DB_QUIZ_RESULTS_QUIZ_NAME = 10;
var DB_QUIZ_RESULTS_USER_NAME = 11;
var DB_QUIZ_RESULTS_CORPORATE_ID = 12;
var DB_QUIZ_RESULTS_CORPORATE_NAME = 13;
var DB_QUIZ_RESULTS_GROUP_ID = 14;
var DB_QUIZ_RESULTS_GROUP_NAME = 15;
var DB_QUIZ_RESULTS_AGENCY_ID = 16;
var DB_QUIZ_RESULTS_AGENCY_NAME = 17;
var DB_QUIZ_RESULTS_PROGRESS_NAME = 18;
var table;
var update_data;
var quiz_table;
var progress_table;
var CreatePDF_Param_json_data;
var CreatePDF_Param_options_data;
var CreatePDF_Param_quiz_data;
var chartjs_config;
var offscreenCanvas;
var currentChart;

window.addEventListener("load", function () {
    var participation_report = document.getElementById("GenerateParticipationReport");
    if (participation_report) {
        participation_report.addEventListener("click", GenerateParticipationReport);
    }

    var users_reports = document.getElementById("GenerateUsersReports");
    if (users_reports) {
        users_reports.addEventListener("click", GenerateUsersReports);
    }

    var statistic_report = document.getElementById("GenerateStatisticReport");
    if (statistic_report) {
        statistic_report.addEventListener("click", GenerateUsersReports);
    }
});

$body = $("body");

$(document).on({
    ajaxStart: function () {
        $body.addClass("loading");
    },
    ajaxStop: function () {
        $body.removeClass("loading");
    }
});

function GenerateParticipationReport() {
    $('.load').removeClass("hidden-load");
    $('body').addClass("loading");
    $('body').scrollTop(0);
    var count = table.rows({selected: true}).count();
    if (count == 0) {
        alert("Vous devez sélectionner au minimum une donnée dans le tableau...");
        return;
    }

    var selected_data = table.rows('.selected').data();
    CreateReportPDF(selected_data);
}

function GenerateStatisticReport() {
    $('.load').removeClass("hidden-load");
    $('body').addClass("loading");
    $('body').scrollTop(0);
    var options_array = new Array();
    options_array[0] = document.getElementById("quiz_report_statistic").value;
    options_array[1] = document.getElementById("statistic_report_compare").value;
    CreateStatisticReportPDF(options_array);
}

function GenerateUsersReports(e) {
    startLoadGif();
    var count = table.rows({selected: true}).count();
    if (count == 0) {
        alert("Vous devez sélectionner au minimum une donnée dans le tableau...");
        endLoadGif();
        return;
    }
    var selected_data = table.rows('.selected').data();
    var incomplete_count = 0;
    for (var i = 0; i < count; i++) {
        if (table.rows('.selected').data()[i][DB_QUIZ_RESULTS_PROGRESS_ID] != 3)
            incomplete_count++;
    }
    if (incomplete_count > 0) {
        var message;
        if (incomplete_count == 1)
            message = "1 quiz n'a pas été complété, celui-ci sera ignoré... Voulez-vous poursuivre ?";
        else
            message = incomplete_count + " quiz n'ont pas étés complétés, ceux-ci seront ignorés... Voulez-vous poursuivre ?";
        if (!confirm(message)) {
            endLoadGif();
            return;
        }
    }
    var selected_array = new Array();
    for (i = 0; i < count; i++) {
        if (table.rows('.selected').data()[i][DB_QUIZ_RESULTS_PROGRESS_ID] == 3) {
            selected_array.push(selected_data[i]);
        }
    }
    if (e.target.getAttribute('data-type') == 'type_a') {
        var options_array = new Array();
        options_array[PDF_GEN_OPTION_SHOW_GRAPH] = document.getElementById('show_graph').checked ? 1 : 0;
        options_array[PDF_GEN_OPTION_SHOW_ANSWERS] = document.getElementById('show_answers').checked ? 1 : 0;
        var report_compare_Select = document.getElementById("user_report_compare");
        options_array[PDF_GEN_OPTION_USER_REPORT_COMPARE] = report_compare_Select.options[report_compare_Select.selectedIndex].value;
        options_array[PDF_GEN_OPTION_SHOW_ANSWERS_SCORES] = document.getElementById('show_answers_score').checked ? 1 : 0;
        options_array[PDF_GEN_OPTION_SHOW_BEST_ANSWERS] = document.getElementById('show_best_answers').checked ? 1 : 0;
        if ((options_array[PDF_GEN_OPTION_SHOW_GRAPH] == 0) && (options_array[PDF_GEN_OPTION_SHOW_ANSWERS] == 0)) {
            alert("Les options de ne pas afficher le graphique de résultats et de ne pas afficher les questions/réponses ne peuvent pas être sélectionnées en même temps...");
            return;
        }
        CreatePDF_Param_json_data = JSON.stringify(selected_array);
        CreatePDF_Param_options_data = JSON.stringify(options_array)
        CreatePDF_Param_quiz_data = JSON.stringify(quiz_table);
        CreatePDF(CreatePDF_Param_json_data, CreatePDF_Param_options_data, CreatePDF_Param_quiz_data);
    }

    if (e.target.getAttribute('data-type') == 'type_b') {
        CreatePDF_Param_json_data = JSON.stringify(selected_array);
        CreatePDF_Param_options_data = '';
        CreatePDF_Param_quiz_data = JSON.stringify(quiz_table);
        CreatePDFCFC(CreatePDF_Param_json_data, CreatePDF_Param_options_data, CreatePDF_Param_quiz_data);
    }

    if (e.target.getAttribute('data-type') == 'statistics_type_a') {
        CreatePDF_Param_json_data = JSON.stringify(selected_array);
        //CreatePDF_Param_options_data = '';
        //CreatePDF_Param_quiz_data = JSON.stringify(quiz_table);
        CreateStatisticReportPDF(CreatePDF_Param_json_data);
    }
}

function ApplyFilters() {
    var quiz_select = document.getElementById("filter_quiz_id");
    var corporate_select = document.getElementById("filter_corporate_id");
    //var group_select = document.getElementById("filter_group_id");
    var agency_select = document.getElementById("filter_agency_id");
    var completed_select = document.getElementById("filter_quiz_progress");
    if (quiz_select.options[quiz_select.selectedIndex].value == "all") {
        table.column(table.column('QUIZ_ID:name').index()).search("").draw();
    } else {
        table.column(table.column('QUIZ_ID:name').index()).search('^\\b' + quiz_select.options[quiz_select.selectedIndex].value + '\\b$', true, false).draw();
    }

    if (corporate_select.options[corporate_select.selectedIndex].value == "all") {
        table.column(table.column('CORPORATE_ID:name').index()).search("").draw();
    } else {
        table.column(table.column('CORPORATE_ID:name').index()).search('^\\b' + corporate_select.options[corporate_select.selectedIndex].value + '\\b$', true, false).draw();
    }

    /*if (group_select.options[group_select.selectedIndex].value == "all") {
        table.column(table.column('GROUP_ID:name').index()).search("").draw();
    } else {
        table.column(table.column('GROUP_ID:name').index()).search('^\\b' + group_select.options[group_select.selectedIndex].value + '\\b$', true, false).draw();
    }*/

    if (agency_select.options[agency_select.selectedIndex].value == "all") {
        table.column(table.column('AGENCY_ID:name').index()).search("").draw();
    } else {
        table.column(table.column('AGENCY_ID:name').index()).search('^\\b' + agency_select.options[agency_select.selectedIndex].value + '\\b$', true, false).draw();
    }

    if (completed_select.options[completed_select.selectedIndex].value == "all") {
        table.column(table.column('PROGRESS_ID:name').index()).search("").draw();
    } else {
        table.column(table.column('PROGRESS_ID:name').index()).search('^\\b' + completed_select.options[completed_select.selectedIndex].value + '\\b$', true, false).draw();
    }
}

/*$('#submitBtn').click(function () {
 alert($('#form').serialize());
 $.ajax({
 url: "nova_api_add.php",
 type: 'post',
 async: true,
 headers: {"cache-control": "no-cache"},
 cache: false,
 data: {data: JSON.stringify($('#form').serializeArray())},
 dataType: "text",
 success: function (return_data) {
 if (return_data == "QUERY_ERROR" || return_data == "DB_OPEN_ERROR") {
 alert("ERREUR: base de données innaccessible...");
 return;
 } else if (return_data == "ID_ALREADY_EXISTS") {
 alert("Le ID Démo existe déjà dans la base de données, merci de choisir un nouveau nom...");
 document.getElementsByName('id_demo').focus();
 return;
 }
 },
 error: function (XMLHttpRequest, textStatus, errorThrown) {
 alert("ERROR !");
 }
 });
 });*/

function GetAllQuizInfoFromServer(type) {

    $.ajax({
        url: "/" + account + "/fr/report/reportData",
        type: 'get',
        async: true,
        headers: {"cache-control": "no-cache"},
        cache: false,
        data: {data: type},
        dataType: "text",
        success: function (return_data) {

            if (return_data == "false") {
                Alert("ERREUR: lecture de la base de données impossible...");
                endLoadGif();
                return;
            }

            return_data_array = JSON.parse(return_data).message;
            update_data = return_data_array[0];
            quiz_table = return_data_array[1];
            progress_table = return_data_array[2];
            LoadDataTable();
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("ERREUR: lecture de la base de données impossible...");
        }
    });

}

function compareSecondColumn(a, b) {

    if (a[1] === b[1]) {
        return 0;
    } else {
        return (a[1] < b[1]) ? -1 : 1;
    }
}

Array.prototype.contains = function (v) {
    for (var i = 0; i < this.length; i++) {
        if (this[i][1] === v)
            return true;
    }
    return false;
};

Array.prototype.unique_quiz_id = function () {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
        if (!arr.contains(this[i][DB_QUIZ_RESULTS_QUIZ_NAME])) {
            var new_input = new Array();
            new_input[0] = this[i][DB_QUIZ_RESULTS_QUIZ_ID];
            new_input[1] = this[i][DB_QUIZ_RESULTS_QUIZ_NAME];
            arr.push(new_input);
        }
    }
    return arr.sort(compareSecondColumn);
}

Array.prototype.unique_group_id = function () {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
        if (!arr.contains(this[i][DB_QUIZ_RESULTS_GROUP_NAME])) {
            var new_input = new Array();
            new_input[0] = this[i][DB_QUIZ_RESULTS_GROUP_ID];
            new_input[1] = this[i][DB_QUIZ_RESULTS_GROUP_NAME];
            arr.push(new_input);
        }
    }
    return arr.sort(compareSecondColumn);
}

Array.prototype.unique_corporate_id = function () {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
        if (!arr.contains(this[i][DB_QUIZ_RESULTS_CORPORATE_NAME])) {
            var new_input = new Array();
            new_input[0] = this[i][DB_QUIZ_RESULTS_CORPORATE_ID];
            new_input[1] = this[i][DB_QUIZ_RESULTS_CORPORATE_NAME];
            arr.push(new_input);
        }
    }
    return arr.sort(compareSecondColumn);
}

Array.prototype.unique_agency_id = function () {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
        if (!arr.contains(this[i][DB_QUIZ_RESULTS_AGENCY_NAME])) {
            var new_input = new Array();
            new_input[0] = this[i][DB_QUIZ_RESULTS_AGENCY_ID];
            new_input[1] = this[i][DB_QUIZ_RESULTS_AGENCY_NAME];
            arr.push(new_input);
        }
    }
    return arr.sort(compareSecondColumn);
}

function LoadDataTable() {
    table = $('#example').removeAttr('width').DataTable(
            {
                aLengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Tous"]],
                data: update_data,
                autoWidth: false,
                columnDefs: [
                    {width: 100, targets: 0}
                ],
                fixedColumns: true,
                select:
                        {
                            style: 'multi'
                        },
                dom: 'Bflrtip',
                buttons: [
                    {
                        text: 'Sélectionner tout',
                        className: 'black tout',
                        action: function () {
                            table.rows().deselect();
                            table.rows({search: 'applied'}).select();
                        }
                    },
                    {
                        text: 'Sélectionner aucun',
                        className: 'black aucun',
                        action: function () {
                            table.rows().deselect();
                        }
                    },
                ],
                //******* ATTENTION !!!: si on change les valeurs de "name", changer les noms utilisés dans la fonction ApplyFilters()...
                columns: [
                    {name: "ID", data: DB_QUIZ_RESULTS_ID, title: "ID unique", visible: false},
                    {name: "USER_ID", data: DB_QUIZ_RESULTS_USER_ID, title: "ID Usager", visible: false},
                    {name: "USER_NAME", data: DB_QUIZ_RESULTS_USER_NAME, title: "Usager", className: "dt-center", width: "100"},
                    {name: "CORPORATE_ID", data: DB_QUIZ_RESULTS_CORPORATE_ID, title: "ID Compagnie", visible: false},
                    {name: "CORPORATE_NAME", data: DB_QUIZ_RESULTS_CORPORATE_NAME, title: "Compagnie", className: "dt-center", width: "100"},
                    {name: "GROUP_ID", data: DB_QUIZ_RESULTS_GROUP_ID, title: "ID Groupe", visible: false},
                    {name: "GROUP_NAME", data: DB_QUIZ_RESULTS_GROUP_NAME, title: "Groupe", visible: false},
                    {name: "AGENCY_ID", data: DB_QUIZ_RESULTS_AGENCY_ID, title: "ID Agence", visible: false},
                    {name: "AGENCY_NAME", data: DB_QUIZ_RESULTS_AGENCY_NAME, title: "Agence", className: "dt-center", width: "100"},
                    {name: "QUIZ_ID", data: DB_QUIZ_RESULTS_QUIZ_ID, title: "ID Quiz", visible: false},
                    {name: "QUIZ_NAME", data: DB_QUIZ_RESULTS_QUIZ_NAME, title: "Quiz", className: "dt-center", width: "100"},
                    {name: "START_DATE", data: DB_QUIZ_RESULTS_START_DATE, title: "Date début", className: "dt-center", width: "100"},
                    {name: "END_DATE", data: DB_QUIZ_RESULTS_END_DATE, title: "Date fin", className: "dt-center", width: "100"},
                    {name: "PROGRESS_ID", data: DB_QUIZ_RESULTS_PROGRESS_ID, title: "ID Progr&egrave;s", visible: false},
                    {name: "PROGRESS_NAME", data: DB_QUIZ_RESULTS_PROGRESS_NAME, title: "Progr&egrave;s", className: "dt-center", width: "100"},
                    {name: "ANSWERS", data: DB_QUIZ_RESULTS_ANSWERS, title: "Réponses", visible: false},
                    {name: "QUIZ_SCORE", data: DB_QUIZ_RESULTS_QUIZ_SCORE, title: "Pointage Quiz", visible: false},
                    {name: "PREVIOUS_ANSWERS", data: DB_QUIZ_RESULTS_PREVIOUS_ANSWERS, title: "Anciennes Réponses", visible: false},
                    {name: "PREVIOUS_SCORES", data: DB_QUIZ_RESULTS_PREVIOUS_SCORES, title: "Pointage Quiz", visible: false}
                ],
                language: {
                    sProcessing: "Traitement en cours...",
                    sSearch: "",
                    sLengthMenu: "Afficher _MENU_ éléments",
                    sInfo: "Affichage de l'élément _START_ à _END_ sur _TOTAL_ éléments",
                    sInfoEmpty: "Affichage de l'élément 0 à 0 sur 0 élément",
                    sInfoFiltered: "(filtré de _MAX_ éléments au total)",
                    sInfoPostFix: "",
                    sLoadingRecords: "Chargement en cours...",
                    sZeroRecords: "Aucun élément à afficher",
                    sEmptyTable: "Aucune donnée disponible dans le tableau",
                    oPaginate: {
                        sFirst: "Premier",
                        sPrevious: "Précédent",
                        sNext: "Suivant",
                        sLast: "Dernier"
                    },
                    oAria: {
                        sSortAscending: ": activer pour trier la colonne par ordre croissant",
                        sSortDescending: ": activer pour trier la colonne par ordre décroissant"
                    },
                    select: {
                        rows: {
                            _: "%d lignes sélectionnées",
                            0: "Cliquez pour sélectionner une ligne",
                            1: "1 ligne sélectionnée"
                        }
                    }
                },
            });
    $('input[type="search"]').attr('placeholder', 'Rechercher');
    var quiz_id_unique = update_data.unique_quiz_id();
    var corporate_id_unique = update_data.unique_corporate_id();
    var group_id_unique = update_data.unique_group_id();
    var agency_id_unique = update_data.unique_agency_id();
    for (var i = 0; i < quiz_id_unique.length; i++) {
        var quiz_id_select = document.getElementById("filter_quiz_id");
        var option = document.createElement("option");
        option.text = quiz_id_unique[i][1];
        option.value = quiz_id_unique[i][0];
        quiz_id_select.add(option);
    }
    for (var j = 0; j < corporate_id_unique.length; j++) {
        var corporate_id_select = document.getElementById("filter_corporate_id");
        var option = document.createElement("option");
        option.text = corporate_id_unique[j][1];
        option.value = corporate_id_unique[j][0];
        corporate_id_select.add(option);
    }
    /*for (var k = 0; k < group_id_unique.length; k++) {
     var group_id_select = document.getElementById("filter_group_id");
     var option = document.createElement("option");
     option.text = group_id_unique[k][1];
     option.value = group_id_unique[k][0];
     group_id_select.add(option);
     }*/
    for (var m = 0; m < agency_id_unique.length; m++) {
        var agency_id_select = document.getElementById("filter_agency_id");
        var option = document.createElement("option");
        option.text = agency_id_unique[m][1];
        option.value = agency_id_unique[m][0];
        agency_id_select.add(option);
    }
    for (var n = 0; n < progress_table.length; n++) {
        var progress_id_select = document.getElementById("filter_quiz_progress");
        var option = document.createElement("option");
        option.text = progress_table[n][1];
        option.value = progress_table[n][0];
        progress_id_select.add(option);
    }
    $("#filter_quiz_id").val("all");
    $("#filter_corporate_id").val("all");
    $("#filter_group_id").val("all");
    $("#filter_agency_id").val("all");
    $("#filter_quiz_progress").val("all");
    $('div.load').addClass('hidden-load');
    $('select.select-filter').change(function () {
        ApplyFilters();
    });
}