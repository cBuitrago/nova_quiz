var JSON_content;
var IMG_Unchecked = new Image();
var IMG_Good_Asnwer = new Image();
var IMG_Best_Answer = new Image();
var IMG_Wrong_Answer = new Image();
var IMG_Chart = new Image();
var OPTION_Radar_graph = true;
var OPTION_Show_Questions = true;
var OPTION_Show_Answers_Scores = true;
var OPTION_Show_Best_Answers = true;
var OPTION_COMPARE_TO = "";
var OPTION_SEPERATE_PDF = false;
var json_data_array;
var options_data_array;
var quiz_data_array;
var chartjs_config;
var chartjs_config_comparison;

var DB_QUIZ_DATA_QUIZ_ID = 0;
var DB_QUIZ_DATA_QUIZ_NAME = 1;
var DB_QUIZ_DATA_START_DATE = 2;
var DB_QUIZ_DATA_END_DATE = 3;
var DB_QUIZ_DATA_LOCKED_ON_COMPLETION = 4;
var DB_QUIZ_DATA_TIME_TO_COMPLETE = 5;
var DB_QUIZ_DATA_QUIZ_DATA = 6;
var DB_QUIZ_DATA_IS_USER_CAN_DISPLAY_CHART = 7;
var DB_QUIZ_DATA_IS_USER_CAN_DISPLAY_QA = 8;
var DB_QUIZ_DATA_IS_ENABLED = 9;
var DB_QUIZ_DATA_IS_USER_SEE_GOOD_ANSWER = 10;
var DB_QUIZ_DATA_ANSWER_JSON = 11;

var chartColors = window.chartColors;
var color = Chart.helpers.color;

var PDF_Nb_Pages = 1;
var PDF_Nb_Pages_Per_User = new Array();

var progress_message = "";
var progress_update_delay = 500;
var progress_cur_element = 0;

var user_global_score = -1;
var comparaison_global_score = -1;

chartjs_config =
        {
            data: {
                datasets: [{
                        pointBorderColor: "rgba(0,0,0,1)",
                        pointBackgroundColor: "rgba(255,0,0,1)",
                        strokeWidth: 10,
                        pointRadius: 5,
                        data: [],
                        // borderWidth: 10,
                        backgroundColor: [
                            color(chartColors.red).alpha(0.5).rgbString(),
                        ],
                        label: 'Mon pointage' // for legend
                    }],
                labels: []
            },
            options: {
                scaleFontStyle: "bold",
                scaleFontSize: 14,
                pointDot: true,
                responsive: false,
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: ''
                },
                scale: {
                    ticks: {
                        display: true,
                        beginAtZero: true,
                        max: 100,
                        min: 0,
                    },
                    pointLabels: {
                        fontSize: 14
                    },
                    elements: {
                        point: {
                            radius: 10
                        }
                    },
                    gridLines: {
                        color: "rgba(0, 0, 0, 0.5)",
                        lineWidth: 1
                    },
                    reverse: false
                },
                animation: false
                        /*{
                         animateRotate: false,
                         animateScale: true,
                         onComplete: function(animation) {
                         //chart_area_img = window.myPolarArea.toBase64Image();
                         //chart_area_img = currentChart.toBase64Image();
                         chart_area_img = offscreenCanvas.toDataURL('image/jpeg', 1.0);
                         
                         //Call CreatPDF() with pre-loaded parameters
                         CreatePDF(CreatePDF_Param_json_data, CreatePDF_Param_options_data, CreatePDF_Param_quiz_data);
                         }
                         }
                         */
            }
        };
//Chart config when there is a comparison (2 datasets)
chartjs_config_comparison =
        {
            data: {
                datasets: [{
                        pointBorderColor: "rgba(0,0,0,1)",
                        pointBackgroundColor: "rgba(255,0,0,1)",
                        strokeWidth: 10,
                        pointRadius: 5,
                        data: [],
                        backgroundColor: [color(chartColors.red).alpha(0.5).rgbString()],
                        label: '' // for legend
                    },
                    {
                        pointBorderColor: "rgba(0,0,0,1)",
                        pointBackgroundColor: "rgba(0,0,255,1)",
                        strokeWidth: 10,
                        pointRadius: 5,
                        data: [],
                        backgroundColor: [color(chartColors.blue).alpha(0.5).rgbString()],
                        label: '' // for legend
                    }],
                labels: []
            },
            options: {
                scaleFontStyle: "bold",
                scaleFontSize: 14,
                pointDot: true,
                responsive: false,
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: ''
                },
                scale: {
                    ticks: {
                        display: true,
                        beginAtZero: true,
                        max: 100,
                        min: 0,
                    },
                    pointLabels: {
                        fontSize: 14
                    },
                    elements: {
                        point: {
                            radius: 10
                        }
                    },
                    gridLines: {
                        color: "rgba(0, 0, 0, 0.5)",
                        lineWidth: 1
                    },
                    reverse: false
                },
                animation: false
                        /*{
                         animateRotate: false,
                         animateScale: true,
                         onComplete: function(animation) {
                         //chart_area_img = window.myPolarArea.toBase64Image();
                         //chart_area_img = currentChart.toBase64Image();
                         chart_area_img = offscreenCanvas.toDataURL('image/jpeg', 1.0);
                         
                         //Call CreatPDF() with pre-loaded parameters
                         CreatePDF(CreatePDF_Param_json_data, CreatePDF_Param_options_data, CreatePDF_Param_quiz_data);
                         }
                         }
                         */
            }
        };

//ADD JsPDF API function calls
(function (API) {
    API.CenterText = function (txt, y) {
        // Get current font size
        var fontSize = this.internal.getFontSize();
        // Get page width
        var pageWidth = this.internal.pageSize.width;
        txtWidth = this.getStringUnitWidth(txt) * fontSize / this.internal.scaleFactor;
        // Calculate text's x coordinate
        x = (pageWidth - txtWidth) / 2;

        // Draw text at x,y
        this.text(txt, x, y);
    }
})(jsPDF.API);

(function (API) {
    API.CenterTextInRect = function (txt, options, x, y, width, height) {
        options = options || {};
        if (options == "horizontal") {
            // Get current font size
            var fontSize = this.internal.getFontSize();
            var txtWidth = this.getStringUnitWidth(txt) * fontSize / this.internal.scaleFactor;
            var txtDim = this.getTextDimensions(txt);
            // Calculate text's x/y coordinate
            rect_x = (width - txtWidth) / 2;
            rect_y = (height + (txtDim.h / 2)) / 2;

            // Draw text at x,y
            this.text(txt, x + rect_x, y + rect_y);

//	            this.textEx(txt, x + (width / 2), y + (height / 2), 'center', 'middle');

        }
        if (options == "vertical") {
            // Get current font size
            var fontSize = this.internal.getFontSize();
            var txtWidth = this.getTextWidth(txt);
            var txtDim = this.getTextDimensions(txt);
            // Calculate text's x/y coordinate
            rect_x = (width / 2) + (txtDim.h / 3);
            rect_y = (height / 2) + (txtWidth / 2);

            // Draw text at x,y
            this.text(x + rect_x, y + rect_y, txt, null, 90);
        }
    }
})(jsPDF.API);

(function (API) {
    API.PrintPageFooter = function (cur_page, nb_total_pages, record_nb) {
        this.setLineWidth(0.1);
        this.setDrawColor(0, 0, 0);
        this.line(20, this.internal.pageSize.height - 32, this.internal.pageSize.width - 20, this.internal.pageSize.height - 32);
        this.setFontSize(8);
        this.setFontType("normal");
        //	            this.text(510, 825, "Page " + cur_page + " de " + nb_total_pages);
        this.textEx("Page " + cur_page + " de " + nb_total_pages, this.internal.pageSize.width - 20, this.internal.pageSize.height - 17, 'right', 'bottom');
        if (record_nb != -1) //If user info provided
        {
            this.text(20, this.internal.pageSize.height - 17, json_data_array[record_nb][DB_QUIZ_RESULTS_CORPORATE_NAME] + " / " + json_data_array[record_nb][DB_QUIZ_RESULTS_GROUP_NAME] + " / " + json_data_array[record_nb][DB_QUIZ_RESULTS_AGENCY_NAME] + " / " + json_data_array[record_nb][DB_QUIZ_RESULTS_USER_NAME] + " / " + json_data_array[record_nb][DB_QUIZ_RESULTS_QUIZ_NAME] + " (" + json_data_array[record_nb][DB_QUIZ_RESULTS_END_DATE] + ")");
        }
    }
})(jsPDF.API);

(function (API) {
    API.PrintPageFooterStatistic = function (cur_page, nb_total_pages, record_nb, quiz_name, item_name) {
        this.setLineWidth(0.1);
        this.setDrawColor(0, 0, 0);
        this.line(20, this.internal.pageSize.height - 32, this.internal.pageSize.width - 20, this.internal.pageSize.height - 32);
        this.setFontSize(8);
        this.setFontType("normal");
        //	            this.text(510, 825, "Page " + cur_page + " de " + nb_total_pages);
        this.textEx("Page " + cur_page + " de " + nb_total_pages, this.internal.pageSize.width - 20, this.internal.pageSize.height - 17, 'right', 'bottom');
        var date = getCurrentDate();
        if (record_nb != -1) //If user info provided
        {
            this.text(20, this.internal.pageSize.height - 17, quiz_name + " / " + item_name + " ( " + date + " ) ");
        }
    }
})(jsPDF.API);

(function (API) {
    API.PrintPageHeader = function (cur_title, cur_title_2) {
        this.setLineWidth(0.1);
        this.setDrawColor(0, 0, 0);
        this.setFontType("bold");
        this.setFontSize(16);
        this.CenterText(cur_title, 50);
        this.setFontType("normal");
        this.setFontSize(12);
        this.CenterText(cur_title_2, 70);
        this.line(20, 90, this.internal.pageSize.width - 20, 90);
    }
})(jsPDF.API);

var splitRegex = /\r\n|\r|\n/g;
(function (API) {
    API.textEx = function (text, x, y, hAlign, vAlign) {
        var fontSize = this.internal.getFontSize() / this.internal.scaleFactor;

        // As defined in jsPDF source code
        var lineHeightProportion = 1.15;

        var splittedText = null;
        var lineCount = 1;
        if (vAlign === 'middle' || vAlign === 'bottom' || hAlign === 'center' || hAlign === 'right') {
            splittedText = typeof text === 'string' ? text.split(splitRegex) : text;

            lineCount = splittedText.length || 1;
        }

        // Align the top
        y += fontSize * (2 - lineHeightProportion);

        if (vAlign === 'middle')
            y -= (lineCount / 2) * fontSize;
        else if (vAlign === 'bottom')
            y -= lineCount * fontSize;

        if (hAlign === 'center' || hAlign === 'right') {
            var alignSize = fontSize;
            if (hAlign === 'center')
                alignSize *= 0.5;

            if (lineCount > 1) {
                for (var iLine = 0; iLine < splittedText.length; iLine++) {
                    this.text(splittedText[iLine], x - this.getStringUnitWidth(splittedText[iLine]) * alignSize, y);
                    y += fontSize;
                }
                return this;
            }
            x -= this.getStringUnitWidth(text) * alignSize;
        }

        this.text(text, x, y);
        return this;
    }
})(jsPDF.API);

function getCurrentDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    var today = dd + '/' + mm + '/' + yyyy;

    return today;
}

function CreateReportPDF(json_data, quiz_data) {
    var doc = new jsPDF('l', 'pt', [612, 792]);
    doc.setFont("helvetica");
    var startGraphX = (doc.internal.pageSize.width / 2);
    var startGraphY = 100;
    var columns = ["COMPAGNIE", "GROUPE", "AGENCE", "USAGER", "QUIZ", "DATE D\311BUT", "DATE FIN", "PROGR\310S", "NOTE"];

    var data = [];
    //Prepare data
    for (var i = 0; i < json_data.length; i++) {
        data[i] = [];
        data[i][0] = json_data[i][DB_QUIZ_RESULTS_CORPORATE_NAME];
        data[i][1] = json_data[i][DB_QUIZ_RESULTS_GROUP_NAME];
        data[i][2] = json_data[i][DB_QUIZ_RESULTS_AGENCY_NAME];
        data[i][3] = json_data[i][DB_QUIZ_RESULTS_USER_NAME];
        data[i][4] = json_data[i][DB_QUIZ_RESULTS_QUIZ_NAME];
        data[i][5] = json_data[i][DB_QUIZ_RESULTS_START_DATE];
        data[i][6] = json_data[i][DB_QUIZ_RESULTS_END_DATE];
        data[i][7] = json_data[i][DB_QUIZ_RESULTS_PROGRESS_NAME];

        //Calculate global score
        var score = "N/A";
        if (json_data[i][DB_QUIZ_RESULTS_QUIZ_SCORE] != "") {
            var user_scores = GetUserScorePerSection(json_data[i][DB_QUIZ_RESULTS_QUIZ_SCORE]);
            var global_score = GetUserGlobalScore(user_scores);
            score = parseInt(global_score) + " %";
        }
        data[i][8] = score;
    }
    var nbPages = 0;
    var doc = new jsPDF('l', 'pt');
    doc.PrintPageHeader("Gestion des quiz", "\311tat de la progression");
    doc.autoTable(columns, data, {
        styles: {fontSize: 8},
        startY: 100,
        afterPageContent: function (data) {
            nbPages++;
        }
    });
    //Print all pages footer
    for (var i = 1; i <= nbPages; i++) {
        doc.setPage(i);
        doc.PrintPageFooter(i, nbPages, -1);
    }

    doc.save("User_Participation.pdf");
    endLoadGif();
}

function CreatePDF(json_data, options_data, quiz_data) {
    //Parse options
    options_data_array = JSON.parse(options_data);
    OPTION_Radar_graph = options_data_array[PDF_GEN_OPTION_SHOW_GRAPH] ? true : false;
    OPTION_Show_Questions = options_data_array[PDF_GEN_OPTION_SHOW_ANSWERS] ? true : false;
    OPTION_COMPARE_TO = options_data_array[PDF_GEN_OPTION_USER_REPORT_COMPARE];
    OPTION_SEPERATE_PDF = options_data_array[PDF_GEN_OPTION_SEPERATE_PDF] ? true : false;
    OPTION_Show_Answers_Scores = options_data_array[PDF_GEN_OPTION_SHOW_ANSWERS_SCORES] ? true : false;
    OPTION_Show_Best_Answers = options_data_array[PDF_GEN_OPTION_SHOW_BEST_ANSWERS] ? true : false;

    //We start by getting averages from server
    $.ajax({
        url: "/" + account + "/report/average",
        type: 'post',
        async: true,
        headers: {"cache-control": "no-cache"},
        cache: false,
        data: JSON.stringify({data: json_data, compare: OPTION_COMPARE_TO, reportType: 'POLYHEDRON'}),
        dataType: "text",
        success: function (return_data) {
            //If cannot access database, we are in OFFLINE mode
            if (return_data == "false") {
                alert("ERREUR: lecture de la base de données impossible...");
                $('.load').addClass("hidden-load");
                $('body').removeClass("loading");
                return;
            }
            var data = JSON.parse(return_data).message;
            PrePDFCreation(json_data, options_data, quiz_data, JSON.stringify(data));
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("ERREUR: lecture de la base de données impossible...");
        }
    });
}

function GetSectionTitlesFromQuiz(quiz_array) {
    var quiz_sections = new Array();
    for (var i = 0; i < quiz_array.section.length; i++) {
        quiz_sections.push(quiz_array.section[i].sectionTitle);
    }
    return quiz_sections;
}

function GetUserScorePerSection(user_scores_array) {
    var user_final_scores = new Array();

    var scores_string = user_scores_array.split(',');
    for (var i = 0; i < scores_string.length; i++) {
        var section_score = scores_string[i].substring(scores_string[i].lastIndexOf("r") + 1, scores_string[i].lastIndexOf("m"));
        var section_max_score = scores_string[i].substring(scores_string[i].lastIndexOf("m") + 1);
        //Score is 0 if section score is smaller than 0
        var final_score = (Number((section_score < 0 ? 0 : section_score)) / Number(section_max_score)) * 100.0;
        user_final_scores.push(final_score);
    }
    return user_final_scores;
}

function GetScorePerSection(scores_array) {
    var final_scores = new Array();

    //var scores_string = user_scores_array.split(',');
    for (var i = 0; i < scores_array.length; i++) {
        var section_score = Number((scores_array[i][0] < 0 ? 0 : scores_array[i][0]));
        var section_max_score = Number(scores_array[i][1]);
        if (section_score > section_max_score || section_max_score == 0) {
            var final_score = 0;
        } else {
            var final_score = (section_score / section_max_score) * 100.0;
        }
        final_scores.push(final_score);
    }
    return final_scores;
}

function GetUserGlobalScore(scores_array) {
    var current_total = 0;
    for (var i = 0; i < scores_array.length; i++) {
        current_total += scores_array[i];
    }
    return current_total / scores_array.length;
}

function FindUserFirstResults(user_id, quiz_id, averages_array) {
    //Find the quiz group first
    var users_quiz_group = -1;
    var current_quiz_order = -1;
    for (var i = 0; i < averages_array.length; i++) {
        if (averages_array[i].USER_ID == user_id && averages_array[i].QUIZ_ID == quiz_id) {
            users_quiz_group = averages_array[i].QUIZ_GROUP_ID;
            current_quiz_order = averages_array[i].QUIZ_ORDER
        }
    }

    var first_result = new Array();
    //if result is already the first one or not found (for some reason)
    if (current_quiz_order == 1 || current_quiz_order == -1) {
        return first_result; //empty array
    }
    //else we find first result and return it (if any)
    for (var i = 0; i < averages_array.length; i++) {
        if (averages_array[i].USER_ID == user_id && averages_array[i].QUIZ_GROUP_ID == users_quiz_group && averages_array[i].QUIZ_ORDER == 1) {
            first_result = averages_array[i];
        }
    }
    return first_result; //can be empty if not found
}

function GetAveragesDataFromAveragesArray(averages_array) {
    var user_final_scores = new Array();
    for (var i = 0; i < averages_array.length; i++) {
        var final_score = (Number((averages_array[i][0] < 0 ? 0 : averages_array[i][0])) / Number(averages_array[i][1])) * 100.0;
        user_final_scores.push(final_score);
    }
    return user_final_scores;
}

function GetCurrentCompleteDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    var today = dd + '/' + mm + '/' + yyyy;
    return today;
}

function CreateStar(pdf_ref, x_pos, y_pos, spikes, radius, linewidth) {
    var rot = Math.PI / 2 * 3;
    var x1 = x_pos;
    var y1 = y_pos;
    var x2, y2;
    var step = Math.PI / spikes;
    var outerRadius = radius * 0.8;
    var innerRadius = radius * 0.4;

    pdf_ref.setLineWidth(linewidth);

    x2 = x_pos;
    y2 = y_pos - outerRadius;
    for (i = 0; i < spikes; i++) {
        x1 = x_pos + Math.cos(rot) * outerRadius;
        y1 = y_pos + Math.sin(rot) * outerRadius;
        pdf_ref.line(x2, y2, x1, y1);
        rot += step

        x2 = x_pos + Math.cos(rot) * innerRadius;
        y2 = y_pos + Math.sin(rot) * innerRadius;
        pdf_ref.line(x1, y1, x2, y2);
        rot += step
    }
    pdf_ref.line(x2, y2, x_pos, y_pos - outerRadius);
    pdf_ref.circle(x_pos, y_pos, radius);
}

function PrePDFCreation(json_data, options_data, quiz_data, averages_data) {
    //Reset page counter
    PDF_Nb_Pages = 1;
    PDF_Nb_Pages_Per_User = [];

    //FONT with signs: zapfdingbats
    var jspdf_doc = new jsPDF('p', 'pt', 'a4');
    jspdf_doc.setFont("helvetica");

    jspdf_doc.setLineWidth(1);

    json_data_array = JSON.parse(json_data);
    quiz_data_array = JSON.parse(quiz_data);

    //Prepare RADIAL GRAPH canvas
    offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 800;
    offscreenCanvas.height = 800;
    var context2 = offscreenCanvas.getContext('2d');
    //Make background WHITE
    Chart.plugins.register({
        beforeDraw: function (chartInstance) {
            var ctx = chartInstance.chart.ctx;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, chartInstance.chart.width, chartInstance.chart.height);
        }
    });
    //*** DEBUT BOUCLE POUR TOUS LES RECORDS SELECTIONNES
    for (var i = 0; i < json_data_array.length; i++) {

        progress_cur_element = i;
        //Update user with creation progress (taken care of in the timeoutLoop() function)
        progress_message = "Création donnée #" + i + " de " + json_data_array.length + " ...";

        //Find quiz_data_array correct QUIZ ID from json_data
        var found_quiz = -1;
        for (var ii = 0; ii < quiz_data_array.length; ii++) {
            if (quiz_data_array[ii][DB_QUIZ_DATA_QUIZ_ID] == json_data_array[i][DB_QUIZ_RESULTS_QUIZ_ID]) {
                found_quiz = ii;
            }
        }

        //Error if could not find QUIZ ID data
        if (found_quiz == -1) {
            alert("ERREUR: impossible de trouver les données du quiz: " + json_data_array[i][DB_QUIZ_RESULTS_QUIZ_ID]);
            return;
        }
        JSON_content = JSON.parse(quiz_data_array[found_quiz][DB_QUIZ_DATA_QUIZ_DATA]);
        //Prepare Graph info from data
        var quiz_sectionNames = GetSectionTitlesFromQuiz(JSON_content);
        var user_scores = GetUserScorePerSection(json_data_array[i][DB_QUIZ_RESULTS_QUIZ_SCORE]);
        user_global_score = GetUserGlobalScore(user_scores);

        var Comparison_Title = "";
        var comparison_results;
        var comparaison_data;
        var comparison_label = "";

        //Prepare COMPARE TO if needed
        var averages_array = JSON.parse(averages_data);
        if (OPTION_COMPARE_TO == "none") {
            //Check quiz order of current record (find it in the averages array)
            comparison_results = FindUserFirstResults(json_data_array[i][DB_QUIZ_RESULTS_USER_ID], json_data_array[i][DB_QUIZ_RESULTS_QUIZ_ID], averages_array);
            if (typeof comparison_results.USER_ID !== "undefined") {
                comparaison_data = GetUserScorePerSection(comparison_results.QUIZ_SCORE);
                comparaison_global_score = GetUserGlobalScore(comparaison_data);
                Comparison_Title = "Comparaison '" + json_data_array[i][DB_QUIZ_RESULTS_QUIZ_NAME] + "' avec '" + comparison_results.QUIZ_NAME + "'";
                comparison_label = comparison_results.QUIZ_NAME;
            }
        } else if (OPTION_COMPARE_TO == "CORPORATES") {
            var corpo_averages = new Array();
            //Find the user's corporate averages record
            for (var ii = 0; ii < averages_array.length; ii++) {
                if ((averages_array[ii][1] == json_data_array[i][DB_QUIZ_RESULTS_QUIZ_ID]) && (averages_array[ii][2] == json_data_array[i][DB_QUIZ_RESULTS_CORPORATE_ID])) {
                    corpo_averages = averages_array[ii][3];
                }
            }
            comparaison_data = GetAveragesDataFromAveragesArray(corpo_averages);
            comparaison_global_score = GetUserGlobalScore(comparaison_data);
            Comparison_Title = "Comparaison avec la moyenne de la compagnie (" + GetCurrentCompleteDate() + ")";
            comparison_label = "Moyenne compagnie";
        } else if (OPTION_COMPARE_TO == "GROUPS") {
            var group_averages = new Array();
            //Find the user's corporate averages record
            for (var ii = 0; ii < averages_array.length; ii++) {
                if ((averages_array[ii][1] == json_data_array[i][DB_QUIZ_RESULTS_QUIZ_ID]) && (averages_array[ii][2] == json_data_array[i][DB_QUIZ_RESULTS_GROUP_ID])) {
                    group_averages = averages_array[ii][3];
                }
            }
            comparaison_data = GetAveragesDataFromAveragesArray(group_averages);
            comparaison_global_score = GetUserGlobalScore(comparaison_data);
            Comparison_Title = "Comparaison avec la moyenne du groupe (" + GetCurrentCompleteDate() + ")";
            comparison_label = "Moyenne groupe";
        } else if (OPTION_COMPARE_TO == "AGENCIES") {
            var agency_averages = new Array();
            //Find the user's corporate averages record
            for (var ii = 0; ii < averages_array.length; ii++) {
                if ((averages_array[ii][1] == json_data_array[i][DB_QUIZ_RESULTS_QUIZ_ID]) && (averages_array[ii][2] == json_data_array[i][DB_QUIZ_RESULTS_AGENCY_ID])) {
                    agency_averages = averages_array[ii][3];
                }
            }
            comparaison_data = GetAveragesDataFromAveragesArray(agency_averages);
            comparaison_global_score = GetUserGlobalScore(comparaison_data);
            Comparison_Title = "Comparaison avec la moyenne de l'agence (" + GetCurrentCompleteDate() + ")";
            comparison_label = "Moyenne agence";
        }


        Chart.defaults.global.defaultFontStyle = "bold";
        Chart.defaults.global.defaultFontSize = 16;

        //Add new dataset if a comparison title has been set
        if (Comparison_Title != "") {
            chartjs_config_comparison.data.datasets[0].data = user_scores;
            chartjs_config_comparison.data.datasets[0].label = json_data_array[i][DB_QUIZ_RESULTS_QUIZ_NAME];
            chartjs_config_comparison.data.labels = quiz_sectionNames;

            chartjs_config_comparison.data.datasets[1].data = comparaison_data;
            chartjs_config_comparison.data.datasets[1].label = comparison_label;

            chartjs_config_comparison.options.title.text = Comparison_Title;

            currentChart = new Chart.Radar(context2, chartjs_config_comparison);
        } //No comparison, display regular chart
        else {
            chartjs_config.data.datasets[0].data = user_scores;
            chartjs_config.data.datasets[0].label = json_data_array[i][DB_QUIZ_RESULTS_QUIZ_NAME];
            chartjs_config.data.labels = quiz_sectionNames;
            currentChart = new Chart.Radar(context2, chartjs_config);
        }

        //currentChart = new Chart.Radar(context2, chartjs_config);
        chart_area_img = offscreenCanvas.toDataURL('image/jpeg', 1.0);

        jspdf_doc = GeneratePDF(jspdf_doc, i);

        //Add page if needed
        if (i < json_data_array.length - 1) {
            jspdf_doc.addPage();
            PDF_Nb_Pages++;
        }

        //Reset global scores
        user_global_score = -1;
        comparaison_global_score = -1;
    }

    //Print all pages footer
    var footer_cur_page = 1;
    for (var i = 0; i < json_data_array.length; i++) {
        for (var j = 0; j < PDF_Nb_Pages_Per_User[i]; j++) {
            jspdf_doc.setPage(footer_cur_page);
            jspdf_doc.PrintPageFooter(footer_cur_page, PDF_Nb_Pages, i);
            footer_cur_page++;
        }
    }

    // Output as Data URI
    //doc.output('datauri');
    jspdf_doc.save("User_Report.pdf");

    $('.load').addClass("hidden-load");
    $('body').removeClass("loading");

    return;
}

function CreateStatisticReportPDF(json_data) {
    OPTION_COMPARE_TO = document.getElementById("statistic_report_compare").value;
    //We start by getting averages from server
    $.ajax({
        url: "/" + account + "/report/average",
        type: 'post',
        async: true,
        headers: {"cache-control": "no-cache"},
        cache: false,
        data: JSON.stringify({data: json_data, compare: OPTION_COMPARE_TO, reportType: 'POLYHEDRON'}),
        dataType: "text",
        success: function (return_data) {
            //If cannot access database, we are in OFFLINE mode
            if (return_data == "QUERY_ERROR" || return_data == "DB_OPEN_ERROR" || return_data == "DB_READ_ERROR") {
                alert("ERREUR: lecture de la base de données impossible...");
                return;
            }
            PrePDFStatisticCreation(return_data, json_data, quiz_table);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("ERREUR: lecture de la base de données impossible...");
        }
    });
}

function PrePDFStatisticCreation(data, json_data, quiz_data) {
    var item_name = 5;

    PDF_Nb_Pages = 1;
    PDF_Nb_Pages_Per_User = [];

    var jspdf_doc = new jsPDF('p', 'pt', 'a4');
    jspdf_doc.setFont("helvetica");

    jspdf_doc.setLineWidth(1);

    json_data_array = (JSON.parse(data)).message;
    quiz_data_array = quiz_data;

    offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 800;
    offscreenCanvas.height = 800;
    var context2 = offscreenCanvas.getContext('2d');
    Chart.plugins.register({
        beforeDraw: function (chartInstance) {
            var ctx = chartInstance.chart.ctx;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, chartInstance.chart.width, chartInstance.chart.height);
        }
    });
    
    for (var i = 0, c = json_data_array.length; i < c; i++) {
        progress_cur_element = i;
        var found_quiz = -1;
        for (var ii = 0; ii < quiz_data.length; ii++) {
            if (quiz_data[ii][DB_QUIZ_DATA_QUIZ_ID] == json_data_array[i][1]) {
                found_quiz = ii;
            }
        }

        if (found_quiz == -1) {
            alert("ERREUR: impossible de trouver les données");
            return;
        }
        JSON_content = JSON.parse(quiz_data[found_quiz][DB_QUIZ_DATA_QUIZ_DATA]);
        //Prepare Graph info from data
        var quiz_sectionNames = GetSectionTitlesFromQuiz(JSON_content);
        var item_score = GetScorePerSection(json_data_array[i][3]);
        global_score = GetUserGlobalScore(item_score);

        Chart.defaults.global.defaultFontStyle = "bold";
        Chart.defaults.global.defaultFontSize = 16;

        chartjs_config.data.datasets[0].data = item_score;
        chartjs_config.data.datasets[0].label = quiz_data[found_quiz][DB_QUIZ_DATA_QUIZ_NAME] + ' - ' + json_data_array[i][5];

        chartjs_config.data.labels = quiz_sectionNames;
        currentChart = new Chart.Radar(context2, chartjs_config);

        chart_area_img = offscreenCanvas.toDataURL('image/jpeg', 1.0);

        jspdf_doc = GenerateStatisticPDF(jspdf_doc, i);

        if (i < json_data_array.length - 1) {
            jspdf_doc.addPage();
            PDF_Nb_Pages++;
        }

    }

    var footer_cur_page = 1;
    for (var i = 0; i < json_data_array.length; i++) {
        for (var j = 0; j < PDF_Nb_Pages_Per_User[i]; j++) {
            jspdf_doc.setPage(footer_cur_page);
            jspdf_doc.PrintPageFooterStatistic(footer_cur_page, PDF_Nb_Pages, i, quiz_data[found_quiz][DB_QUIZ_DATA_QUIZ_NAME], json_data_array[i][5]);
            footer_cur_page++;
        }
    }

    jspdf_doc.save("Statistic_Report.pdf");
    endLoadGif();

    return;
}

function FindBestAnswerIndex(answer_array) {
    return answer_array.indexOf(Math.max.apply(null, answer_array)); //returns -1 if not found (fomr some reason)
}

function GetCurrentQuestionGoodAnswerArray(quiz_id) {
    var found_quiz_answers = "";
    //Get current quiz good answers string
    for (var ii = 0; ii < quiz_data_array.length; ii++) {
        if (quiz_data_array[ii][DB_QUIZ_DATA_QUIZ_ID] == quiz_id) {
            found_quiz_answers = quiz_data_array[ii][DB_QUIZ_DATA_ANSWER_JSON];
        }
    }
    //If array is empty fro some reason, return default image
    if (found_quiz_answers == "") {
        return IMG_unchecked;
    }
    //Parse correct answer string
    var good_asnwers_array = new Array();
    var answers_part_1 = found_quiz_answers.split('|'); //Split sections
    for (var i = 0; i < answers_part_1.length; i++) {
        good_asnwers_array[i] = new Array();
        var answers_part_2 = answers_part_1[i].split(';'); //Split questions
        for (var j = 0; j < answers_part_2.length; j++) {
            good_asnwers_array[i][j] = new Array();
            var answers_part_3 = answers_part_2[j].split(',').map(Number); //Split answers and convert to numbers (for Math.max)
            for (var k = 0; k < answers_part_3.length; k++) {
                good_asnwers_array[i][j][k] = answers_part_3[k];
            }
        }
    }
    return good_asnwers_array;
}

function GetTextQuestionScore(user_answer, section_nb, question_nb, quiz_id) {
    var good_answers_array = GetCurrentQuestionGoodAnswerArray(quiz_id);
    var current_answer_array = good_answers_array[section_nb][question_nb];
    var bestAnswerIndex = current_answer_array.indexOf(Math.max.apply(null, current_answer_array));
    return parseInt(current_answer_array[user_answer]) + " / " + parseInt(current_answer_array[bestAnswerIndex]);
}

function GetImageForStatisticQuestionAnswer(section_nb, question_nb, answer_nb, quiz_id) {

    var good_asnwers_array = GetCurrentQuestionGoodAnswerArray(quiz_id);
    var current_answer_array = good_asnwers_array[section_nb][question_nb];
    var bestAnswerIndex = current_answer_array.indexOf(Math.max.apply(null, current_answer_array));

    if (answer_nb == bestAnswerIndex) {
        return IMG_Best_Answer;
    }

    return IMG_Unchecked;
}

function GetImageForQuestionAnswer(user_answer, section_nb, question_nb, answer_nb, quiz_id) {
    /*	    var found_quiz_answers = "";
     //Get current quiz good answers string
     for (var ii = 0; ii < quiz_data_array.length; ii++) {
     if (quiz_data_array[ii][DB_QUIZ_DATA_QUIZ_ID] == quiz_id) {
     found_quiz_answers = quiz_data_array[ii][DB_QUIZ_DATA_ANSWER_JSON];
     }
     }
     //If array is empty fro some reason, return default image
     if (found_quiz_answers == "")
     {
     return IMG_unchecked;
     }
     //Parse correct answer string
     var good_asnwers_array = new Array();
     var answers_part_1 = found_quiz_answers.split('|'); //Split sections
     for(var i=0; i < answers_part_1.length; i++)
     {
     good_asnwers_array[i] = new Array();
     var answers_part_2 = answers_part_1[i].split(';'); //Split questions
     for (var j = 0; j < answers_part_2.length; j++)
     {
     good_asnwers_array[i][j] = new Array();
     var answers_part_3 = answers_part_2[j].split(',').map(Number); //Split answers and convert to numbers (for Math.max)
     for(var k=0; k < answers_part_3.length; k++)
     {
     good_asnwers_array[i][j][k] = answers_part_3[k];
     }
     }
     }
     */
    var good_asnwers_array = GetCurrentQuestionGoodAnswerArray(quiz_id);
    var current_answer_array = good_asnwers_array[section_nb][question_nb];
    var bestAnswerIndex = current_answer_array.indexOf(Math.max.apply(null, current_answer_array));

    if (OPTION_Show_Best_Answers) {
        //If current question answer is not user answer nor the best, it's an unchecked box
        if ((answer_nb != user_answer) && (answer_nb != bestAnswerIndex)) {
            return IMG_Unchecked;
        }
        //If user answer is the best answer
        else if ((answer_nb == user_answer) && (answer_nb == bestAnswerIndex)) {
            return IMG_Good_Asnwer;
        }
        //If user answer dans not the best
        else if ((answer_nb == user_answer) && (answer_nb != bestAnswerIndex)) {
            return IMG_Wrong_Answer;
        }
        //If not user answer but was best answer
        else if ((answer_nb != user_answer) && (answer_nb == bestAnswerIndex)) {
            return IMG_Best_Answer;
        }
    }
    // Only show suer answer
    else {
        //If current question answer is not user answer nor the best, it's an unchecked box
        if ((answer_nb != user_answer)) {
            return IMG_Unchecked;
        } else {
            return IMG_Best_Answer;
        }
    }
}

function GeneratePDF(doc, current_record) {

    previousData = sortSelectedAnswers(json_data_array[current_record][DB_QUIZ_RESULTS_ANSWERS]);

    //Constants for data structure
    var SECTION_CONTENT_TITLE = 0;
    var SECTION_CONTENT_COLOR_RED = 1;
    var SECTION_CONTENT_COLOR_GREEN = 2;
    var SECTION_CONTENT_COLOR_BLUE = 3;
    var SECTION_CONTENT_QUESTIONS = 4;

    var SECTION_CONTENT_QUESTIONS_TITLE = 0;
    var CONST_SECTION_CONTENT_QUESTIONS_ANSWERS = 1;

    var CONTENT_CONTENT_QUESTIONS_ANSWERS_TEXT = 0;
    var CONTENT_CONTENT_QUESTIONS_ANSWERS_WEIGHT = 1;

    var nb_section_per_pages = 2;

    //Get page title
    var PDF_Title = JSON_content.pageTitle;
    var PDF_Sections = new Array();

    var i = j = k = 0;
    for (i = 0; i < JSON_content.section.length; i++) {

        var Section_Content = new Array();
        //Section general info
        Section_Content.push(new Array());
        Section_Content[0] = JSON_content.section[i].sectionTitle;
        Section_Content[1] = JSON_content.section[i].color.red;
        Section_Content[2] = JSON_content.section[i].color.green;
        Section_Content[3] = JSON_content.section[i].color.blue;

        //Section questions
        var Section_Content_Questions = new Array();
        for (j = 0; j < JSON_content.section[i].question.length; j++) {
            Section_Content_Questions.push(new Array());
            Section_Content_Questions[j][0] = JSON_content.section[i].question[j].questionTitle;
            //Questions answers
            var Section_Content_Questions_Answers = new Array();
            for (k = 0; k < JSON_content.section[i].question[j].answer.length; k++) {
                Section_Content_Questions_Answers.push(new Array());
                Section_Content_Questions_Answers[k][0] = JSON_content.section[i].question[j].answer[k].answerText;
                Section_Content_Questions_Answers[k][1] = JSON_content.section[i].question[j].answer[k].weight;
            }
            Section_Content_Questions[j].push(Section_Content_Questions_Answers);
            Section_Content[4] = Section_Content_Questions;
        }
        PDF_Sections.push(Section_Content);
    }

    var CurrentPageNumber = 1;

    //Keep how many section page there is
    var total_nb_Pages;
    if (OPTION_Show_Questions) {
        total_nb_Pages = Math.ceil(PDF_Sections.length / nb_section_per_pages);
    } else {
        total_nb_Pages = 0;
    }

    //Print Radar graph is option selected
    if (OPTION_Radar_graph) {

        IMG_Chart.src = chart_area_img;
        //adImage(data, type, pos_x, pox_y, height, width)
        //doc.addImage(IMG_Chart, 'PNG', (595/2) - (400/2) + 30, 250, 400, 400);
        doc.addImage(IMG_Chart, 'JPEG', (595 / 2) - (500 / 2), 150, 500, 500);

        //Print page footer
        total_nb_Pages += 1; //Add Radar Graph pahe to page count
        doc.setFontSize(10);
        doc.setFontType("normal");
        doc.setTextColor(0);
        doc.PrintPageHeader(PDF_Title, "Résumé des résultats");
        //doc.PrintPageFooter(CurrentPageNumber, total_nb_Pages);

        //Print Global scores
        doc.setFontSize(10);
        doc.setFontType("normal");
        doc.setTextColor(0);
        //doc.text(500, 100, "Note globale: " + parseInt(user_global_score, 10) + " %");
        doc.CenterText("Note globale: " + parseInt(user_global_score, 10) + " %", 670);
        if (comparaison_global_score != -1) {
            var comparaison_name = "";
            if (OPTION_COMPARE_TO == "none")
                comparaison_name = "Ancienne note: ";
            if (OPTION_COMPARE_TO == "CORPORATES")
                comparaison_name = "Moyenne compagnie: ";
            if (OPTION_COMPARE_TO == "GROUPS")
                comparaison_name = "Moyenne groupe: ";
            if (OPTION_COMPARE_TO == "AGENCIES")
                comparaison_name = "Moyenne agence: ";
            //doc.text(500, 110, comparaison_name + parseInt(comparaison_global_score, 10) + " %");
            doc.CenterText(comparaison_name + parseInt(comparaison_global_score, 10) + " %", 685);
        }

        //Start a new page if QA display option enabled
        if (OPTION_Show_Questions) {
            doc.addPage();
            CurrentPageNumber++;
            PDF_Nb_Pages++;
        }
    }

    //doc.addHTML(ctx, function() {});

    //Print QA sections if option enabled
    if (OPTION_Show_Questions) {
        var section_main_width = 40;
        var section_main_height = 362;
        var section_question_width = 22;
        var pos_Section_starting_x = 20;
        var pos_Section_starting_y = 100;
        var question_rect_spacing = 12;
        var queston_title_start_x_from_section_start = 80;
        var question_title_max_width = 410;
        var answer_text_start_x_from_question = 30;
        var answer_text_max_width = 430;
        var question_answer_spacing = 10;
        var answers_spacing = 8;
        var answer_checked_start_x = 3;
        var checked_y_correction = -13;
        var question_rect_bottom_padding = 5;
        var inter_section_spacing = 10;
        var question_score_start_x_from_question_end = 2;
        var question_score_rect_width = 40;
        var question_score_rect_height = 15;
        var question_score_rect_color_r = 159;
        var question_score_rect_color_g = 202;
        var question_score_rect_color_b = 143;

        var Section_Title_font_Size = 14;
        var Question_Rectangle_Font_Size = 8;
        var Question_Title_Font_Size = 12;
        var Question_Asnwers_Font_Size = 10;
        var Score_Rectangle_Text_Font_Size = 10;

        var rectangle_cur_x = 0;
        var rectangle_cur_y = 0;
        var rectangle_cur_height = 0;
        var rectangle_cur_width = 0;

        //Sections
        var section_bottom_y_pos = 0;
        var current_pos_Section_starting_y = pos_Section_starting_y; //Keep track of Y lon multiple section per pages
        for (var i = 0; i < PDF_Sections.length; i++) {
            //Question title
            var next_question_spacing = 0;
            doc.setFontSize(12);
            var current_y = current_pos_Section_starting_y + doc.internal.getFontSize();
            var total_section_rectangle_height = 0;
            for (var j = 0; j < PDF_Sections[i][SECTION_CONTENT_QUESTIONS].length; j++) {
                var current_quesion_total_height = 0;

                doc.setFontType("bold");
                doc.setTextColor(0);
                doc.setFontSize(Question_Title_Font_Size);
                var splitTitle = doc.splitTextToSize(PDF_Sections[i][SECTION_CONTENT_QUESTIONS][j][SECTION_CONTENT_QUESTIONS_TITLE], question_title_max_width);
                doc.text(pos_Section_starting_x + queston_title_start_x_from_section_start, current_y + next_question_spacing, splitTitle);
                var question_title_total_height = doc.internal.getFontSize() * splitTitle.length;

                //Question score rectangle and text
                if (OPTION_Show_Answers_Scores) {
                    doc.setFillColor(question_score_rect_color_r, question_score_rect_color_g, question_score_rect_color_b);
                    doc.rect(pos_Section_starting_x + queston_title_start_x_from_section_start + question_title_max_width + question_score_start_x_from_question_end,
                            current_y + next_question_spacing - doc.internal.getFontSize() + 3,
                            question_score_rect_width,
                            question_score_rect_height, 'F');
                    doc.setFontSize(Score_Rectangle_Text_Font_Size);
                    doc.setFontType("bold");
                    doc.setTextColor(255); // white
                    doc.CenterTextInRect(GetTextQuestionScore(previousData['section' + i]['question' + j]['answer'], i, j, json_data_array[current_record][DB_QUIZ_RESULTS_QUIZ_ID]),
                            "horizontal",
                            pos_Section_starting_x + queston_title_start_x_from_section_start + question_title_max_width + question_score_start_x_from_question_end,
                            current_y + next_question_spacing - doc.internal.getFontSize() + 3,
                            question_score_rect_width,
                            question_score_rect_height - 3);
                }

                //Question answers
                var next_spacing_answer = question_title_total_height + question_answer_spacing;
                var questions_total_height = 0;
                for (var k = 0; k < PDF_Sections[i][SECTION_CONTENT_QUESTIONS][j][CONST_SECTION_CONTENT_QUESTIONS_ANSWERS].length; k++) {
                    splitTitle = [];
                    doc.setFontType("normal");
                    doc.setTextColor(0);
                    doc.setFontSize(Question_Asnwers_Font_Size);
                    splitTitle = doc.splitTextToSize(PDF_Sections[i][SECTION_CONTENT_QUESTIONS][j][CONST_SECTION_CONTENT_QUESTIONS_ANSWERS][k][CONTENT_CONTENT_QUESTIONS_ANSWERS_TEXT], answer_text_max_width);

                    doc.addImage(GetImageForQuestionAnswer(previousData['section' + i]['question' + j]['answer'], i, j, k, json_data_array[current_record][DB_QUIZ_RESULTS_QUIZ_ID]),
                            'jpg',
                            pos_Section_starting_x + queston_title_start_x_from_section_start + answer_checked_start_x,
                            current_y + checked_y_correction + next_spacing_answer + next_question_spacing,
                            18,
                            18);
                    //GetImageForQuestionAnswer(user_answer, section_nb, question_nb, answer_nb, quiz_id)

                    /********************
                     if (previousData['section' + i]['question' + j]['answer'] == k) {
                     //doc.addImage(IMG_Good_Asnwer, 'png', pos_Section_starting_x + queston_title_start_x_from_section_start + answer_checked_start_x, current_y + checked_y_correction + next_spacing_answer + next_question_spacing);
                     doc.addImage(IMG_Good_Asnwer,
                     'jpg',
                     pos_Section_starting_x + queston_title_start_x_from_section_start + answer_checked_start_x,
                     current_y + checked_y_correction + next_spacing_answer + next_question_spacing,
                     18,
                     18);
                     }
                     else {
                     doc.addImage(IMG_unchecked,
                     'JPEG',
                     pos_Section_starting_x + queston_title_start_x_from_section_start + answer_checked_start_x,
                     current_y + checked_y_correction + next_spacing_answer + next_question_spacing,
                     18,
                     18);
                     }
                     *****************/
                    doc.text(pos_Section_starting_x + queston_title_start_x_from_section_start + answer_text_start_x_from_question, current_y + next_spacing_answer + next_question_spacing, splitTitle);
                    next_spacing_answer += answers_spacing + (doc.internal.getFontSize() * splitTitle.length);
                    questions_total_height += answers_spacing + (doc.internal.getFontSize() * splitTitle.length);
                }

                current_quesion_total_height = questions_total_height + question_title_total_height + question_answer_spacing;

                //Restore Question title font size so rect Y calculation working
                doc.setFontSize(Question_Title_Font_Size);

                //Draw question rectangle
                doc.setFillColor(parseInt(PDF_Sections[i][SECTION_CONTENT_COLOR_RED]), parseInt(PDF_Sections[i][SECTION_CONTENT_COLOR_GREEN]), parseInt(PDF_Sections[i][SECTION_CONTENT_COLOR_BLUE]));
                rectangle_cur_x = pos_Section_starting_x + section_main_width + question_rect_spacing - question_rect_bottom_padding;
                rectangle_cur_y = current_y - doc.internal.getFontSize() + next_question_spacing;
                rectangle_cur_width = section_question_width;
                rectangle_cur_height = current_quesion_total_height + question_rect_bottom_padding;

                doc.rect(rectangle_cur_x, rectangle_cur_y, rectangle_cur_width, rectangle_cur_height, 'F');
                section_bottom_y_pos = current_y - doc.internal.getFontSize() + next_question_spacing + current_quesion_total_height + question_rect_bottom_padding;
                total_section_rectangle_height += current_quesion_total_height + question_rect_bottom_padding;
                doc.setFontType("bold");
                doc.setTextColor(255);
                doc.setFontSize(Question_Rectangle_Font_Size);
                doc.CenterTextInRect("Question " + (j + 1), "vertical", rectangle_cur_x, rectangle_cur_y, rectangle_cur_width, rectangle_cur_height);
                next_question_spacing += question_rect_spacing + questions_total_height + question_title_total_height + question_answer_spacing;
            }

            //Draw section first rectangle
            doc.setTextColor(255);
            doc.setFontSize(Section_Title_font_Size);
            doc.setFontType("bold");
            doc.setFillColor(parseInt(PDF_Sections[i][SECTION_CONTENT_COLOR_RED]), parseInt(PDF_Sections[i][SECTION_CONTENT_COLOR_GREEN]), parseInt(PDF_Sections[i][SECTION_CONTENT_COLOR_BLUE]));
            rectangle_cur_x = pos_Section_starting_x;
            rectangle_cur_y = current_pos_Section_starting_y;
            rectangle_cur_width = section_main_width;
            rectangle_cur_height = section_bottom_y_pos - current_pos_Section_starting_y;
            doc.rect(rectangle_cur_x, rectangle_cur_y, rectangle_cur_width, rectangle_cur_height, 'F');
            doc.CenterTextInRect(PDF_Sections[i][SECTION_CONTENT_TITLE], "vertical", rectangle_cur_x, rectangle_cur_y, rectangle_cur_width, rectangle_cur_height);

            //Print page footer
            doc.setFontSize(10);
            doc.setFontType("normal");
            doc.setTextColor(0);
            doc.PrintPageHeader(PDF_Title, "Réponses aux questions");
            //doc.PrintPageFooter(CurrentPageNumber, total_nb_Pages);

            //Add page if needed
            if (i < PDF_Sections.length - 1) {
                //Add page if page is already full of sections
                if (((i + 1) % nb_section_per_pages) == 0) {
                    doc.addPage();
                    CurrentPageNumber++;
                    PDF_Nb_Pages++;
                    current_pos_Section_starting_y = pos_Section_starting_y; //Reset section starting Y
                } else {
                    //Add inter-section to Y tracking
                    current_pos_Section_starting_y = rectangle_cur_y + rectangle_cur_height + inter_section_spacing;
                }
            }
        }
    }
    PDF_Nb_Pages_Per_User.push(total_nb_Pages);

    return doc;
}

function GenerateStatisticPDF(doc, current_record) {

    var SECTION_CONTENT_TITLE = 0;
    var SECTION_CONTENT_COLOR_RED = 1;
    var SECTION_CONTENT_COLOR_GREEN = 2;
    var SECTION_CONTENT_COLOR_BLUE = 3;
    var SECTION_CONTENT_QUESTIONS = 4;

    var SECTION_CONTENT_QUESTIONS_TITLE = 0;
    var CONST_SECTION_CONTENT_QUESTIONS_ANSWERS = 1;

    var CONTENT_CONTENT_QUESTIONS_ANSWERS_TEXT = 0;
    var CONTENT_CONTENT_QUESTIONS_ANSWERS_WEIGHT = 1;

    var STATISTIC_CURRENT_ANSWER = 4
    var STATISTIC_CURRENT_ANSWER_TOTAL = 'total';

    var nb_section_per_pages = 2;

    //Get page title
    var PDF_Title = JSON_content.pageTitle;
    var PDF_Sections = new Array();

    var i = j = k = 0;
    for (i = 0; i < JSON_content.section.length; i++) {
        var Section_Content = new Array();
        //Section general info
        Section_Content.push(new Array());
        Section_Content[0] = JSON_content.section[i].sectionTitle;
        Section_Content[1] = JSON_content.section[i].color.red;
        Section_Content[2] = JSON_content.section[i].color.green;
        Section_Content[3] = JSON_content.section[i].color.blue;

        //Section questions
        var Section_Content_Questions = new Array();
        for (j = 0; j < JSON_content.section[i].question.length; j++) {
            Section_Content_Questions.push(new Array());
            Section_Content_Questions[j][0] = JSON_content.section[i].question[j].questionTitle;
            //Questions answers
            var Section_Content_Questions_Answers = new Array();
            for (k = 0; k < JSON_content.section[i].question[j].answer.length; k++) {
                Section_Content_Questions_Answers.push(new Array());
                Section_Content_Questions_Answers[k][0] = JSON_content.section[i].question[j].answer[k].answerText;
                Section_Content_Questions_Answers[k][1] = JSON_content.section[i].question[j].answer[k].weight;
            }
            Section_Content_Questions[j].push(Section_Content_Questions_Answers);
            Section_Content[4] = Section_Content_Questions;
        }
        PDF_Sections.push(Section_Content);
    }

    var CurrentPageNumber = 1;

    var total_nb_Pages;
    total_nb_Pages = Math.ceil(PDF_Sections.length / nb_section_per_pages);

    IMG_Chart.src = chart_area_img;

    doc.addImage(IMG_Chart, 'JPEG', (595 / 2) - (500 / 2), 150, 500, 500);

    //Print page footer
    total_nb_Pages += 1; //Add Radar Graph pahe to page count
    doc.setFontSize(10);
    doc.setFontType("normal");
    doc.setTextColor(0);
    doc.PrintPageHeader(PDF_Title, "Résumé des résultats");

    doc.setFontSize(10);
    doc.setFontType("normal");
    doc.setTextColor(0);
    doc.CenterText("Note globale: " + parseInt(global_score, 10) + " %", 670);

    doc.addPage();
    CurrentPageNumber++;
    PDF_Nb_Pages++;

    var section_main_width = 40;
    var section_main_height = 362;
    var section_question_width = 22;
    var pos_Section_starting_x = 20;
    var pos_Section_starting_y = 100;
    var question_rect_spacing = 12;
    var queston_title_start_x_from_section_start = 80;
    var question_title_max_width = 410;
    var answer_text_start_x_from_question = 30;
    var answer_text_max_width = 430;
    var question_answer_spacing = 10;
    var answers_spacing = 8;
    var answer_checked_start_x = 3;
    var checked_y_correction = -13;
    var question_rect_bottom_padding = 5;
    var inter_section_spacing = 10;
    var question_score_start_x_from_question_end = 2;
    var question_score_rect_width = 40;
    var question_score_rect_height = 15;
    var question_score_rect_color_r = 159;
    var question_score_rect_color_g = 202;
    var question_score_rect_color_b = 143;

    var Section_Title_font_Size = 14;
    var Question_Rectangle_Font_Size = 8;
    var Question_Title_Font_Size = 12;
    var Question_Asnwers_Font_Size = 10;
    var Score_Rectangle_Text_Font_Size = 10;

    var rectangle_cur_x = 0;
    var rectangle_cur_y = 0;
    var rectangle_cur_height = 0;
    var rectangle_cur_width = 0;

    //Sections
    var section_bottom_y_pos = 0;
    var current_pos_Section_starting_y = pos_Section_starting_y; //Keep track of Y lon multiple section per pages
    for (var i = 0; i < PDF_Sections.length; i++) {
        //Question title
        var next_question_spacing = 0;
        doc.setFontSize(12);
        var current_y = current_pos_Section_starting_y + doc.internal.getFontSize();
        var total_section_rectangle_height = 0;
        for (var j = 0; j < PDF_Sections[i][SECTION_CONTENT_QUESTIONS].length; j++) {
            var current_quesion_total_height = 0;

            doc.setFontType("bold");
            doc.setTextColor(0);
            doc.setFontSize(Question_Title_Font_Size);
            var splitTitle = doc.splitTextToSize(PDF_Sections[i][SECTION_CONTENT_QUESTIONS][j][SECTION_CONTENT_QUESTIONS_TITLE], question_title_max_width);
            doc.text(pos_Section_starting_x + queston_title_start_x_from_section_start, current_y + next_question_spacing, splitTitle);
            var question_title_total_height = doc.internal.getFontSize() * splitTitle.length;

            var next_spacing_answer = question_title_total_height + question_answer_spacing;
            var questions_total_height = 0;
            for (var k = 0; k < PDF_Sections[i][SECTION_CONTENT_QUESTIONS][j][CONST_SECTION_CONTENT_QUESTIONS_ANSWERS].length; k++) {
                splitTitle = [];
                doc.setFontType("normal");
                doc.setTextColor(0);
                doc.setFontSize(Question_Asnwers_Font_Size);
                splitTitle = doc.splitTextToSize(PDF_Sections[i][SECTION_CONTENT_QUESTIONS][j][CONST_SECTION_CONTENT_QUESTIONS_ANSWERS][k][CONTENT_CONTENT_QUESTIONS_ANSWERS_TEXT], answer_text_max_width - 20);

                doc.CenterTextInRect(getPercentageAnswer(json_data_array[current_record][STATISTIC_CURRENT_ANSWER]['s' + i + 'q' + j][k], json_data_array[current_record][STATISTIC_CURRENT_ANSWER]['s' + i + 'q' + j][STATISTIC_CURRENT_ANSWER_TOTAL]),
                        "horizontal",
                        pos_Section_starting_x + queston_title_start_x_from_section_start + answer_checked_start_x,
                        current_y + checked_y_correction + next_spacing_answer + next_question_spacing,
                        18,
                        18);

                doc.addImage(GetImageForStatisticQuestionAnswer(i, j, k, json_data_array[current_record][1]),
                        'jpg',
                        pos_Section_starting_x + queston_title_start_x_from_section_start + answer_checked_start_x + 28,
                        current_y + checked_y_correction + next_spacing_answer + next_question_spacing,
                        18,
                        18);

                doc.text(pos_Section_starting_x + queston_title_start_x_from_section_start + answer_text_start_x_from_question + 25, current_y + next_spacing_answer + next_question_spacing, splitTitle);
                next_spacing_answer += answers_spacing + (doc.internal.getFontSize() * splitTitle.length);
                questions_total_height += answers_spacing + (doc.internal.getFontSize() * splitTitle.length);
            }

            current_quesion_total_height = questions_total_height + question_title_total_height + question_answer_spacing;

            //Restore Question title font size so rect Y calculation working
            doc.setFontSize(Question_Title_Font_Size);

            //Draw question rectangle
            doc.setFillColor(parseInt(PDF_Sections[i][SECTION_CONTENT_COLOR_RED]), parseInt(PDF_Sections[i][SECTION_CONTENT_COLOR_GREEN]), parseInt(PDF_Sections[i][SECTION_CONTENT_COLOR_BLUE]));
            rectangle_cur_x = pos_Section_starting_x + section_main_width + question_rect_spacing - question_rect_bottom_padding;
            rectangle_cur_y = current_y - doc.internal.getFontSize() + next_question_spacing;
            rectangle_cur_width = section_question_width;
            rectangle_cur_height = current_quesion_total_height + question_rect_bottom_padding;

            doc.rect(rectangle_cur_x, rectangle_cur_y, rectangle_cur_width, rectangle_cur_height, 'F');
            section_bottom_y_pos = current_y - doc.internal.getFontSize() + next_question_spacing + current_quesion_total_height + question_rect_bottom_padding;
            total_section_rectangle_height += current_quesion_total_height + question_rect_bottom_padding;
            doc.setFontType("bold");
            doc.setTextColor(255);
            doc.setFontSize(Question_Rectangle_Font_Size);
            doc.CenterTextInRect("Question " + (j + 1), "vertical", rectangle_cur_x, rectangle_cur_y, rectangle_cur_width, rectangle_cur_height);
            next_question_spacing += question_rect_spacing + questions_total_height + question_title_total_height + question_answer_spacing;
        }

        //Draw section first rectangle
        doc.setTextColor(255);
        doc.setFontSize(Section_Title_font_Size);
        doc.setFontType("bold");
        doc.setFillColor(parseInt(PDF_Sections[i][SECTION_CONTENT_COLOR_RED]), parseInt(PDF_Sections[i][SECTION_CONTENT_COLOR_GREEN]), parseInt(PDF_Sections[i][SECTION_CONTENT_COLOR_BLUE]));
        rectangle_cur_x = pos_Section_starting_x;
        rectangle_cur_y = current_pos_Section_starting_y;
        rectangle_cur_width = section_main_width;
        rectangle_cur_height = section_bottom_y_pos - current_pos_Section_starting_y;
        doc.rect(rectangle_cur_x, rectangle_cur_y, rectangle_cur_width, rectangle_cur_height, 'F');
        doc.CenterTextInRect(PDF_Sections[i][SECTION_CONTENT_TITLE], "vertical", rectangle_cur_x, rectangle_cur_y, rectangle_cur_width, rectangle_cur_height);

        //Print page footer
        doc.setFontSize(10);
        doc.setFontType("normal");
        doc.setTextColor(0);
        doc.PrintPageHeader(PDF_Title, "Réponses aux questions");

        //Add page if needed
        if (i < PDF_Sections.length - 1) {
            //Add page if page is already full of sections
            if (((i + 1) % nb_section_per_pages) == 0) {
                doc.addPage();
                CurrentPageNumber++;
                PDF_Nb_Pages++;
                current_pos_Section_starting_y = pos_Section_starting_y; //Reset section starting Y
            } else {
                //Add inter-section to Y tracking
                current_pos_Section_starting_y = rectangle_cur_y + rectangle_cur_height + inter_section_spacing;
            }
        }
    }
    PDF_Nb_Pages_Per_User.push(total_nb_Pages);

    return doc;
}

function getPercentageAnswer(cur_answer, total) {
    if (cur_answer == undefined) {
        var percentage_str = '0.0% ';
    } else {
        var percentage_str = String(((parseInt(cur_answer) / parseInt(total)) * 100).toFixed(1)) + '% ';
    }
    return percentage_str;
}

//Get images source
IMG_Good_Asnwer.src = "/Resources/public/media/assets/Good_answer.jpg";
IMG_Unchecked.src = "/Resources/public/media/assets/Unchecked.jpg";
IMG_Best_Answer.src = "/Resources/public/media/assets/Best_answer.jpg";
IMG_Wrong_Answer.src = "/Resources/public/media/assets/Wrong_answer.jpg";