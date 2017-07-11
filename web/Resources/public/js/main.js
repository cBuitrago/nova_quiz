var PDF_GEN_OPTION_ANSWERS_SHORT = 0;
var PDF_GEN_OPTION_SHOW_GRAPH = 1;
var PDF_GEN_OPTION_SHOW_ANSWERS = 2;
var PDF_GEN_OPTION_SEPERATE_PDF = 3;
var PDF_GEN_OPTION_USER_REPORT_COMPARE = 4;
var PDF_GEN_OPTION_SHOW_ANSWERS_SCORES = 5;
var PDF_GEN_OPTION_SHOW_BEST_ANSWERS = 6;

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

var tableData;
var tableUsers;
var tableUserAgency;

window.addEventListener("load", function () {
    sizeImg();

    $("input.editInput").keyup(function () {
        $(this).addClass('changed');
    });
    $(".cancelAll").click(function () {
        location.reload();
    });
    $(window).resize(function () {
        sizeImg();
    });

});

function sizeImg() {
    var wHeight = $(window).height();
    $('.bg-image').css('min-height', (wHeight - 137) + "px");
}

function startLoadGif() {
    $('.load').removeClass("hidden-load");
    $('body').addClass("loading");
    $('body').scrollTop(0);
}

function endLoadGif() {
    $('.load').addClass("hidden-load");
    $('body').removeClass("loading");
}

var error404 = "error 404";
var error409 = "error 409";
var unknownError = "Ouch";

/** UTILITY **/
function validateInput(inpt, a) {
    if (inpt.type == 'checkbox' || inpt.type == 'hidden') {
        return true;
    }
    if (a === undefined) {
        var a = inpt.name.toLowerCase();
    }
    if (a.search('text') != -1) {
        if (inpt.value != '') {
            return true;
        } else {
            return false;
        }
    }
    if (a.search('phone') != -1) {
        var pattern = /^(\+1)? ?\(?[0-9]{3}\)? ?-?[0-9]{3} ?-?[0-9]{2} ?-?[0-9]{2}$/;
    }
    if (a.search('password') != -1) {
        var pattern = /^.{4,16}$/;
    }
    if (a.search('name') != -1 || a.search('city') != -1 || a.search('province') != -1 || a.search('country') != -1 || a.search('company') != -1 || a.search('description') != -1) {
        var pattern = /^[a-zA-Z0-9ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ_-\s]{2,256}$/;
    }
    if (a.search('email') != -1) {
        var pattern = /^.{2,30}@.{2,30}\.[a-zA-Z]{2,6}$/;
    }
    if (a.search('code') != -1) {
        var pattern = /^[a-zA-Z0-9\s\- ]{2,64}$/;
    }
    if (a.search('expires') != -1 || a.search('date') != -1) {
        var pattern = /(^20(1[5-9]{1}|[2-9]{1}[0-9]{1})-(0[1-9]{1}|1[0-2]{1})-([0-2]{1}[0-9]{1}|3[0-1]{1})$|^[a-zA-Z]{3,10} ([0-2]{1}[0-9]{1}|3[0-1]{1}), 20(1[0-9]{1}|[2-9]{1}[0-9]{1}), [0-9]{1,2}:[0-9]{1,2} (pm|am)$)/;
    }
    if (a.search('address') != -1) {
        var pattern = /^.{0,256}$/;
    }
    if (a.search('file') != -1) {
        var pattern = /^[a-zA-Z0-9\\:\/]{0,256}.zip$/;
    }
    if (a.search('number') != -1) {
        var pattern = /^[0-9]{0,256}$/;
    }
    if (inpt.value.match(pattern)) {
        return true;
    }

    inpt.focus();
    return false;
}

function GetAllUsersFromServer() {
    $.ajax({
        url: baseUrl + "/php/user_get_all_ajax.php",
        type: 'post',
        async: true,
        headers: {"cache-control": "no-cache"},
        cache: false,
        dataType: "text",
        success: function (return_data) {
            if (return_data == "FALSE") {
                alert("ERREUR: base de données innaccessible...");
                return;
            } else {
                tableData = JSON.parse(return_data);
                LoadDataTable();
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("ERROR !");
        }
    });
}

function GetAllUsersAgencyFromServer() {
    var id = document.getElementById('id');
    $.ajax({
        url: baseUrl + "/php/user_get_agency_ajax.php",
        type: 'post',
        async: true,
        headers: {"cache-control": "no-cache"},
        cache: false,
        data: id.value,
        dataType: "text",
        success: function (return_data) {
            if (return_data == "FALSE") {
                alert("ERREUR: base de donn\351es innaccessible...");
                return;
            } else {
                var helper = JSON.parse(return_data);
                tableData = helper.users;
                LoadDataTableAgency();
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("ERROR !");
        }
    });
}

/** DATATABLE **/
function LoadDataTable() {
    tableUsers = $('#usersTable').DataTable(
            {
                aLengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Tous"]],
                data: tableData,
                autoWidth: false,
                columnDefs: [
                    {width: 100, targets: 0}
                ],
                fixedColumns: true,
                select:
                        {
                            style: 'single'
                        },
                dom: 'Bflrtip',
                buttons: [
                    {
                        text: 'S&eacute;lectionner tout',
                        className: 'black',
                        action: function () {
                            table.rows().deselect();
                            table.rows({search: 'applied'}).select();
                        }
                    },
                    {
                        text: 'S&eacute;lectionner aucun',
                        className: 'black',
                        action: function () {
                            table.rows().deselect();
                        }
                    },
                ],
                //******* ATTENTION !!!: si on change les valeurs de "name", changer les noms utilisés dans la fonction ApplyFilters()...
                columns: [
                    {name: "USER_ID", data: 0, title: "ID", visible: false},
                    {name: "USER_NOM", data: 1, title: "NOM DE FAMILLE", className: "dt-center", width: "100"},
                    {name: "USER_PRENOM", data: 2, title: "PRENOM", className: "dt-center", width: "100"},
                    {name: "USERNAME", data: 3, title: "NOM D'USAGER", visible: false},
                    {name: "AGENCY", data: 4, title: "AGENCE", className: "dt-center", width: "100"},
                    {name: "GROUP", data: 5, title: "GROUPE", className: "dt-center", width: "100"},
                    {name: "CORPO", data: 6, title: "CORPO", visible: false}
                ],
                language: {
                    sProcessing: "Traitement en cours...",
                    sSearch: "",
                    sLengthMenu: "Afficher _MENU_ &eacute;l&eacute;ments",
                    sInfo: "Affichage de l'&eacute;l&eacute;ment _START_ &agrave; _END_ sur _TOTAL_ &eacute;l&eacute;ments",
                    sInfoEmpty: "Affichage de l'&eacute;l&eacute;ment 0 &agrave; 0 sur 0 &eacute;l&eacute;ment",
                    sInfoFiltered: "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
                    sInfoPostFix: "",
                    sLoadingRecords: "Chargement en cours...",
                    sZeroRecords: "Aucun &eacute;l&eacute;ment &agrave; afficher",
                    sEmptyTable: "Aucune donn&eacute;e disponible dans le tableau",
                    oPaginate: {
                        sFirst: "Premier",
                        sPrevious: "< Pr&eacute;c&eacute;dent",
                        sNext: "Suivant >",
                        sLast: "Dernier"
                    },
                    oAria: {
                        sSortAscending: ": activer pour trier la colonne par ordre croissant",
                        sSortDescending: ": activer pour trier la colonne par ordre d&eacute;croissant"
                    },
                    select: {
                        rows: {
                            _: "%d lignes s&eacute;lectionn&eacute;es",
                            0: "Cliquez pour s&eacute;lectionner une ligne",
                            1: "1 ligne s&eacute;lectionn&eacute;e"
                        }
                    }
                },
            });
    $('input[type="search"]').attr('placeholder', 'Rechercher');
    tableUsers
            .on('select', function (e, dt, type, indexes) {
                var dataSelected = tableUsers.rows({selected: true}).data().toArray()
                var newUrl = baseUrl + '/' + account + '/user/' + dataSelected[0][0] + '/edit';
                window.location.assign(newUrl);
            });
}

function LoadDataTableAgency() {
    tableUserAgency = $('#dataTableAgency').DataTable(
            {
                aLengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Tous"]],
                data: tableData,
                select:
                        {
                            style: 'single'
                        },
                dom: 'Bflrtip',
                //******* ATTENTION !!!: si on change les valeurs de "name", changer les noms utilisés dans la fonction ApplyFilters()...
                columns: [
                    {name: "USER_ID", data: 0, title: "ID", visible: false},
                    {name: "USER_NOM", data: 2, title: "NOM DE FAMILLE", className: "dt-center"},
                    {name: "USER_PRENOM", data: 3, title: "PRENOM", className: "dt-center"},
                    {name: "USERNAME", data: 1, title: "NOM D'USAGER", className: "dt-center"},
                    {name: "CREATED", data: 4, title: "CREE", visible: false},
                    {name: "MODIFIED", data: 5, title: "MODIFIE", visible: false}
                ],
                language: {
                    sProcessing: "Traitement en cours...",
                    sSearch: "",
                    sLengthMenu: "Afficher _MENU_ &eacute;l&eacute;ments",
                    sInfo: "Affichage de l'&eacute;l&eacute;ment _START_ &agrave; _END_ sur _TOTAL_ &eacute;l&eacute;ments",
                    sInfoEmpty: "Affichage de l'&eacute;l&eacute;ment 0 &agrave; 0 sur 0 &eacute;l&eacute;ment",
                    sInfoFiltered: "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
                    sInfoPostFix: "",
                    sLoadingRecords: "Chargement en cours...",
                    sZeroRecords: "Aucun &eacute;l&eacute;ment &agrave; afficher",
                    sEmptyTable: "Aucune donn&eacute;e disponible dans le tableau",
                    oPaginate: {
                        sFirst: "Premier",
                        sPrevious: "< Pr&eacute;c&eacute;dent",
                        sNext: "Suivant >",
                        sLast: "Dernier"
                    },
                    oAria: {
                        sSortAscending: ": activer pour trier la colonne par ordre croissant",
                        sSortDescending: ": activer pour trier la colonne par ordre d&eacute;croissant"
                    },
                    select: {
                        rows: {
                            _: "&nbsp; %d lignes s&eacute;lectionn&eacute;es",
                            0: "&nbsp; Cliquez pour s&eacute;lectionner une ligne",
                            1: "&nbsp; 1 ligne s&eacute;lectionn&eacute;e"
                        }
                    }
                },
            });
    $('input[type="search"]').attr('placeholder', 'Rechercher');
    tableUserAgency
            .on('select', function (e, dt, type, indexes) {
                var dataSelected = tableUserAgency.rows({selected: true}).data().toArray()
                var newUrl = baseUrl + '/' + account + '/user/' + dataSelected[0][0] + '/edit';
                window.location.assign(newUrl);
            });
}