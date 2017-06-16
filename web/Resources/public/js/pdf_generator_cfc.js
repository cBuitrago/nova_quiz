var DB_QUIZ_RESULTS_GROUP_NAME = 15;
var DB_QUIZ_RESULTS_NOM = 11;
var DB_QUIZ_RESULTS_PRENOM = 12;
var DB_QUIZ_RESULTS_START_DATE = 3;
var DB_QUIZ_RESULTS_END_DATE = 4;
var DB_QUIZ_RESULTS_PROGRESS_NAME = 18;

var JSON_content;
var IMG_unchecked = new Image();
var IMG_checked = new Image();
var IMG_Chart = new Image();
var IMG_style_bg = new Image();
var IMG_logoCFC = new Image();
var strongIcon = new Image();
var OPTION_Show_Questions = true;

var PDF_Nb_Pages = 1;

window.addEventListener("load", function () {
    var groupeReport = document.getElementById("onGroupeReport");
    if (groupeReport)
        groupeReport.addEventListener("click", CreateGroupReportPDF);
});

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
    API.PrintSocialGraphResult = function (startGraphX, startGraphY, result1, result2, result3, result4, max) {

        //Convert rate from % to fit the square
        var newR1 = (result1 * 155) / max;
        var newR2 = (result2 * 155) / max;
        var newR3 = (result3 * 155) / max;
        var newR4 = (result4 * 155) / max;

        var rate1 = (result1 / max) * 100;
        rate1 = Math.trunc(rate1);
        var rate2 = (result2 / max) * 100;
        rate2 = Math.trunc(rate2);
        var rate3 = (result3 / max) * 100;
        rate3 = Math.trunc(rate3);
        var rate4 = (result4 / max) * 100;
        rate4 = Math.trunc(rate4);

        this.addImage(IMG_style_bg, "jpeg", startGraphX - 220, startGraphY, 412, 412);

        this.setFillColor(153, 180, 234);
        this.roundedRect(startGraphX - 170, startGraphY + 50, 155, 155, 3, 3, 'F');
        this.setFillColor(60, 114, 221);
        this.rect(startGraphX - 170, 155 + startGraphY + 50 - newR1, 155, newR1, 'F');
        this.setFillColor(255, 255, 255);
        this.roundedRect(startGraphX - 170.5, startGraphY + 51, 156, -1.5, 3, 3, 'F');
        this.roundedRect(startGraphX - 170.5, startGraphY + 51 + 154.5, 156, -1, 3, 3, 'F');
        this.setFontSize(16);
        this.CenterTextInRect("ANALYTIQUE", "horizontal", startGraphX - 170, startGraphY + 40, 155, 155);
        this.setFontSize(18);
        this.setFontType('bold');
        this.CenterTextInRect(result1.toString().concat("/") + max.toString().concat(" (") + rate1.toString().concat(" %)"), "horizontal", startGraphX - 170, startGraphY + 60, 155, 155);
        this.setFontType('normal');

        this.setFillColor(228, 143, 140);
        this.roundedRect(startGraphX - 10, startGraphY + 50, 155, 155, 3, 3, 'F');
        this.setFillColor(208, 39, 34);
        this.rect(startGraphX - 10, 155 + startGraphY + 50 - newR2, 155, newR2, 'F');
        this.setFillColor(255, 255, 255);
        this.roundedRect(startGraphX - 10.5, startGraphY + 51, 156, -1.5, 3, 3, 'F');
        this.roundedRect(startGraphX - 10.5, startGraphY + 51 + 154.5, 156, -1, 3, 3, 'F');
        this.setFontSize(16);
        this.CenterTextInRect("DIRECTIF", "horizontal", startGraphX - 10, startGraphY + 40, 155, 155);
        this.setFontSize(18);
        this.setFontType('bold');
        this.CenterTextInRect(result2.toString().concat("/") + max.toString().concat(" (") + rate2.toString().concat(" %)"), "horizontal", startGraphX - 10, startGraphY + 60, 155, 155);
        this.setFontType('normal');

        this.setFillColor(173, 198, 146);
        this.roundedRect(startGraphX - 170, startGraphY + 210, 155, 155, 3, 3, 'F');
        this.setFillColor(100, 150, 46);
        this.rect(startGraphX - 170, 155 + startGraphY + 210 - newR3, 155, newR3, 'F');
        this.setFillColor(255, 255, 255);
        this.roundedRect(startGraphX - 170.5, startGraphY + 211, 156, -1.5, 3, 3, 'F');
        this.roundedRect(startGraphX - 170.5, startGraphY + 211 + 154.5, 156, -1, 3, 3, 'F');
        this.setFontSize(16);
        this.CenterTextInRect("AIMABLE", "horizontal", startGraphX - 170, startGraphY + 200, 155, 155);
        this.setFontSize(18);
        this.setFontType('bold');
        this.CenterTextInRect(result3.toString().concat("/") + max.toString().concat(" (") + rate3.toString().concat(" %)"), "horizontal", startGraphX - 170, startGraphY + 220, 155, 155);
        this.setFontType('normal');

        this.setFillColor(239, 218, 149);
        this.roundedRect(startGraphX - 10, startGraphY + 210, 155, 155, 3, 3, 'F');
        this.setFillColor(232, 189, 50);
        this.rect(startGraphX - 10, 155 + startGraphY + 210 - newR4, 155, newR4, 'F');
        this.setFillColor(255, 255, 255);
        this.roundedRect(startGraphX - 10.5, startGraphY + 211, 156, -1.5, 3, 3, 'F');
        this.roundedRect(startGraphX - 10.5, startGraphY + 211 + 154.5, 156, -1, 3, 3, 'F');
        this.setFontSize(16);
        this.CenterTextInRect("EXPRESSIF", "horizontal", startGraphX - 10, startGraphY + 200, 155, 155);
        this.setFontSize(18);
        this.setFontType('bold');
        this.CenterTextInRect(result4.toString().concat("/") + max.toString().concat(" (") + rate4.toString().concat(" %)"), "horizontal", startGraphX - 10, startGraphY + 220, 155, 155);
        this.setFontType('normal');
    }
})(jsPDF.API);

(function (API) {
    API.PrintGroupGraph = function (startGraphX, startGraphY, result1, result2, result3, result4, strong1, strong2, strong3, strong4) {

        var txtWidth = 0;
        this.addImage(IMG_style_bg, "jpeg", startGraphX - 220, startGraphY, 412, 412);

        this.setFillColor(153, 180, 234);
        this.roundedRect(startGraphX - 170, startGraphY + 50, 155, 155, 3, 3, 'F');
        this.setFontSize(16);
        this.CenterTextInRect("ANALYTIQUE", "horizontal", startGraphX - 170, startGraphY + 26, 155, 155);
        this.setFontSize(30);
        this.CenterTextInRect(result1.toString(), "horizontal", startGraphX - 170, startGraphY + 54, 155, 155);

        txtWidth = this.getStringUnitWidth(strong1.toString()) * this.internal.getFontSize() / this.internal.scaleFactor;
        this.addImage(strongIcon, "png", startGraphX - (97 + (txtWidth / 3)), startGraphY + 147, 15, 15);
        this.setFontSize(18);
        this.CenterTextInRect(strong1.toString(), "horizontal", startGraphX - 160, startGraphY + 78, 155, 155);

        this.setFillColor(228, 143, 140);
        this.roundedRect(startGraphX - 10, startGraphY + 50, 155, 155, 3, 3, 'F');
        this.setFontSize(16);
        this.CenterTextInRect("DIRECTIF", "horizontal", startGraphX - 10, startGraphY + 26, 155, 155);
        this.setFontSize(30);
        this.CenterTextInRect(result2.toString(), "horizontal", startGraphX - 10, startGraphY + 54, 155, 155);
        txtWidth = this.getStringUnitWidth(strong2.toString()) * this.internal.getFontSize() / this.internal.scaleFactor;
        this.addImage(strongIcon, "png", startGraphX + (63 - (txtWidth / 3)), startGraphY + 147, 15, 15);
        this.setFontSize(18);
        this.CenterTextInRect(strong2.toString(), "horizontal", startGraphX, startGraphY + 78, 155, 155);

        this.setFillColor(173, 198, 146);
        this.roundedRect(startGraphX - 170, startGraphY + 210, 155, 155, 3, 3, 'F');
        this.setFontSize(16);
        this.CenterTextInRect("AIMABLE", "horizontal", startGraphX - 170, startGraphY + 186, 155, 155);
        this.setFontSize(30);
        this.CenterTextInRect(result3.toString(), "horizontal", startGraphX - 170, startGraphY + 214, 155, 155);
        txtWidth = this.getStringUnitWidth(strong3.toString()) * this.internal.getFontSize() / this.internal.scaleFactor;
        this.addImage(strongIcon, "png", startGraphX - (97 + (txtWidth / 3)), startGraphY + 303, 15, 15);
        this.setFontSize(18);
        this.CenterTextInRect(strong3.toString(), "horizontal", startGraphX - 160, startGraphY + 234, 155, 155);

        this.setFillColor(239, 218, 149);
        this.roundedRect(startGraphX - 10, startGraphY + 210, 155, 155, 3, 3, 'F');
        this.setFontSize(16);
        this.CenterTextInRect("EXPRESSIF", "horizontal", startGraphX - 10, startGraphY + 186, 155, 155);
        this.setFontSize(30);
        this.CenterTextInRect(result4.toString(), "horizontal", startGraphX - 10, startGraphY + 214, 155, 155);
        txtWidth = this.getStringUnitWidth(strong4.toString()) * this.internal.getFontSize() / this.internal.scaleFactor;
        this.addImage(strongIcon, "png", startGraphX + (63 - (txtWidth / 3)), startGraphY + 303, 15, 15);
        this.setFontSize(18);
        this.CenterTextInRect(strong4.toString(), "horizontal", startGraphX, startGraphY + 234, 155, 155);
    }
})(jsPDF.API);

(function (API) {
    API.CustomFooter = function (fName, lName, gName, t_date, pageNumber) {
        var nomPrenom = "";
        if (lName != "") {
            nomPrenom = gName + ", " + lName + ", " + fName;
        } else {
            nomPrenom = gName + ", " + fName;
        }

        this.setFontType('bold');
        this.setTextColor(80, 80, 80);
        this.text(37, 764, nomPrenom);
        this.line(37 + (nomPrenom.length * 5), 767, 37 + (nomPrenom.length * 5), 756);
        this.setTextColor(150, 150, 150);
        this.text(42 + (nomPrenom.length * 5), 764, t_date);
        this.setTextColor(150, 150, 150);
        this.text(567, 764, pageNumber);
    }
})(jsPDF.API);

(function (API) {
    API.CustomFooter_group = function (t_date) {
        this.setTextColor(150, 150, 150);
        this.text(37, 764, t_date);
        this.text(567, 764, "1");
    }
})(jsPDF.API);

//Use this one for Maj strings (cap lock)
(function (API) {
    API.BulletString = function (x, y, b_string) {
        this.setTextColor(0, 0, 0);
        this.setFontType('normal');
        this.setFontSize(15);
        this.text(x, y, "\u2022");
        this.setTextColor(50, 50, 50);
        this.setFontSize(10.5);
        this.text(x + 17, y - 1, b_string);
    }
})(jsPDF.API);

//Use this one for normal string (no cap lock)
(function (API) {
    API.BulletString2 = function (x, y, b_string) {
        this.setTextColor(0, 0, 0);
        this.setFontType('normal');
        this.setFontSize(15);
        this.text(x, y, "\u2022");
        this.setTextColor(50, 50, 50);
        this.setFontSize(10.5);
        this.text(x + 17, y - 1.5, b_string);
    }
})(jsPDF.API);

(function (API) {
    API.SetFontTitle_T1 = function () {
        this.setFontType('bold');
        this.setTextColor(23, 53, 129);
        this.setFontSize(17);
    }
})(jsPDF.API);

(function (API) {
    API.SetFontTitle_T2 = function () {
        this.setFontType('bold');
        this.setTextColor(23, 53, 129);
        this.setFontSize(11.5);
    }
})(jsPDF.API);

(function (API) {
    API.SetFontParagraph = function () {
        this.setFontType('normal');
        this.setTextColor(50, 50, 50);
        this.setFontSize(10.5);
    }
})(jsPDF.API);

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

function CreateGroupReportPDF() {

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
        if (selected_data[i][DB_QUIZ_RESULTS_PROGRESS_ID] != 3)
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
    //var selected_array = new Array();
    var selected_array = {};
    for (i = 0; i < count; i++) {
        if (selected_data[i][DB_QUIZ_RESULTS_PROGRESS_ID] == 3) {

            if (typeof selected_array[ selected_data[i][DB_QUIZ_RESULTS_QUIZ_ID] ] == 'undefined') {
                selected_array[ selected_data[i][DB_QUIZ_RESULTS_QUIZ_ID] ] = [];
            }
            selected_array[ selected_data[i][DB_QUIZ_RESULTS_QUIZ_ID] ].push(selected_data[i][DB_QUIZ_RESULTS_AGENCY_ID]);
        }
    }

    $.ajax({
        url: "/" + account + "/report/average_type_b",
        type: 'post',
        async: true,
        headers: {"cache-control": "no-cache"},
        data: JSON.stringify(selected_array),
        cache: false,
        dataType: "text",
        success: function (return_data) {
            //If cannot access database, we are in OFFLINE mode
            if (return_data.message == "false") {
                Alert("ERREUR: lecture de la base de donn\351es impossible...");
                endLoadGif();
                return;
            }
            return_data_array = JSON.parse(return_data).message;
            CreateGroupReport(return_data_array);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            endLoadGif();
            alert("ERREUR: lecture de la base de donn\351es impossible...");
        }
    });

}

function CreateFirstPage(doc, fName, lName, gName, t_date, result1, result2, result3, result4, max) {
    doc.addImage(IMG_logoCFC, "jpeg", 445, 50, 135, 37);
    doc.setFillColor(23, 53, 129);
    doc.rect(0, 108, 87, 46, 'F');
    doc.setTextColor(23, 53, 129);
    doc.setFont('helvetica');
    doc.setFontSize(20);
    doc.text(92, 127, "CONNA\xCETRE SON STYLE PERSONNEL");
    doc.text(92, 148, "DE COMMUNICATION");
    doc.setFontSize(8);
    doc.text(302, 140, "1");

    var names = fName;
    var lineFactor = 0;

    if (names.length < 12) {
        lineFactor = 10.5;
    } else {
        lineFactor = 10;
    }
    //name and result headline
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(18);
    doc.setFontType('bold');
    doc.text(95, 200, names);
    var txtWidth = doc.getStringUnitWidth(names) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    //doc.line(95, 207, 95 + (names.length * lineFactor), 207);
    doc.setLineWidth(1);
    doc.line(95, 207, 95 + txtWidth, 207);
    doc.setTextColor(23, 53, 129);
    doc.setFontSize(18);
    doc.text(95, 225, "VOTRE R\xC9SULTAT");
    doc.setTextColor(0, 0, 0);
    doc.setFontType('normal');
    doc.PrintSocialGraphResult((doc.internal.pageSize.width / 2) + 10, 250, result1, result2, result3, result4, max);
    //footer 1st page
    doc.setTextColor(102, 102, 102);
    doc.line(265, 730, 576, 730);
    doc.setFontSize(6);
    doc.text(265, 738, "1");
    doc.setFontSize(8.5);
    doc.text(270, 740, "Mod\xE8le de Cormier (Cormier, S. La communication et la gestion) adapt\351 par CFC");
    doc.CustomFooter(fName, lName, gName, t_date, "1");
}

function CreateUserReport(fName, lName, gName, t_date, result1, result2, result3, result4, max) {

    var doc = new jsPDF('p', 'pt', [612, 792]);
    CreateFirstPage(doc, fName, lName, gName, t_date, result1, result2, result3, result4, max);

    //beginning of 2nd page
    doc.addPage();
    doc.SetFontTitle_T1();
    doc.text(37, 48, "ANALYSER VOTRE R\xC9SULTAT");
    doc.SetFontTitle_T2();
    doc.text(37, 72, "R\351sultat d'une colonne nettement plus \351lev\351 que les r\351sultats des autres colonnes");
    doc.SetFontParagraph();
    doc.text(37, 88, "Votre style est tr\xE8s marqu\351. Vous avez possiblement quelques difficult\351s de communication dans certaines");
    doc.text(37, 102, "situations, plus particuli\xE8rement avec votre style oppos\351 (soit aimable/directif et analytique/expressif).");
    doc.text(37, 115, "ATTENTION \xC0 VOS LIMITES.");

    doc.SetFontTitle_T2();
    doc.text(37, 145, "R\351sultats qui se partagent \xE0 peu pr\xE8s \351galement entre deux colonnes");
    doc.SetFontParagraph();
    doc.text(37, 161, "Les caract\351ristiques des deux styles s'influencent l'un et l'autre, soit en att\351nuant ou en enrichissant");
    doc.text(37, 175, "certaines facettes.");

    doc.SetFontTitle_T2();
    doc.text(37, 202, "Les combinaisons les plus plausibles sont:");
    doc.BulletString(59, 222, "ANALYTIQUE/DIRECTIF");
    doc.BulletString(227, 222, "DIRECTIF/EXPRESSIF");
    doc.BulletString(59, 240, "AIMABLE/ANALYTIQUE");
    doc.BulletString(227, 240, "EXPRESSIF/AIMABLE");
    doc.text(37, 259, "Les combinaisons aimable/directif ainsi qu'analytique/expressif sont plus rares puisque ces deux styles");
    doc.text(37, 273, "s'opposent.");

    doc.SetFontTitle_T2();
    doc.text(37, 306, "R\351sultats qui montrent une r\351partition plus ou moins \351gale entre les quatres styles");
    doc.SetFontParagraph();
    doc.text(37, 322, "Vous faites preuve de beaucoup de souplesse, vous avez g\351n\351ralement de la facilit\351 avec tous les styles.");
    doc.text(37, 336, "Comme il s'agit de styles personnels, nous vous sugg\351rons de faire remplir le questionnaire par une autre");
    doc.text(37, 350, "personne \xE0 partir de ses perceptions de votre style. Le portrait de votre style personnel sera ainsi plus complet.");

    //Middle of the page with blue rectangle
    doc.setFillColor(23, 53, 129);
    doc.rect(0, 382, 117, 31, 'F');
    doc.SetFontParagraph();
    doc.setFontSize(12);
    doc.text(127, 395, "Le mod\xE8le des 4 styles est b\xE2ti \xE0 partir de 4 axes principaux :");
    doc.SetFontTitle_T2();
    doc.setFontSize(11);
    doc.setFontType('normal');
    doc.text(127, 409, "ACTION, R\xC9FLEXION, T\xC2CHE et RELATION");
    doc.setFontSize(6);
    doc.text(352, 404, "2");

    //Action block
    doc.SetFontTitle_T2();
    doc.text(37, 440, "Axe ACTION");
    doc.SetFontParagraph();
    doc.text(37, 457, "Les deux styles situ\351s dans la partie droite du mo-");
    doc.text(37, 471, "d\xE8le \xE0 quatre quadrants, directif et expressif, sont des");
    doc.text(37, 485, "styles dominants, qui exercent de l'influence de fa\xE7on");
    doc.text(37, 499, "plus directe: Les individus de ce style sont per\xE7us");
    doc.text(37, 513, "comme \351tant plus affirmatifs que les deux styles qui");
    doc.text(37, 527, "se trouvent dans la partie gauche. Ce sont des styles");
    doc.text(37, 541, "dont le rythme d'interaction est rapide et qui sont plus");
    doc.text(37, 555, "ax\351s vers l'action que la r\351flexion.");

    //Reflexion block
    doc.SetFontTitle_T2();
    doc.text(318, 440, "Axe R\xC9FLEXION");
    doc.SetFontParagraph();
    doc.text(318, 457, "Les deux styles situ\351s dans la partie de gauche");
    doc.text(318, 471, "du mod\xE8le, aimable et analytique, sont des styles");
    doc.text(318, 485, "impliquant des individus de r\351flexion qui occupent");
    doc.text(318, 499, "davantage une position non dominante d'observateur.");
    doc.text(318, 513, "Pour eux, il y a certains \351l\351ments r\351flexifs essentiels qui");
    doc.text(318, 527, "pr\351c\xE8dent l'action (explications, pr\351cisions). Ce sont");
    doc.text(318, 541, "donc g\351n\351ralement des gens prudents, moins impul-");
    doc.text(318, 555, "sifs et dont les affirmations sont nuanc\351es.");

    //Task block
    doc.SetFontTitle_T2();
    doc.text(37, 583, "Axe T\xC2CHE");
    doc.SetFontParagraph();
    doc.text(37, 600, "Les deux styles situ\351s dans la partie sup\351rieure du");
    doc.text(37, 614, "mod\xE8le, directif et analytique, correspondent \xE0 des");
    doc.text(37, 628, "individus qui manifestent moins fr\351quemment leurs");
    doc.text(37, 642, "r\351actions affectives. Leurs pr\351occupations pour");
    doc.text(37, 656, "l'\351motivit\351 et les sentiments sont moins pr\351sentes que");
    doc.text(37, 670, "les styles de la partie inf\351rieure du mod\xE8le (aimable et");
    doc.text(37, 684, "expressif). Ils sont ax\351s sur la t\xE2che et ce qui doit \xEAtre");
    doc.text(37, 698, "fait, plut\xF4t que sur l'importance d'entrer en r\351sonance");
    doc.text(37, 712, "avec les \351motions des autres.");

    //relationship block
    doc.SetFontTitle_T2();
    doc.text(318, 583, "Axe RELATION");
    doc.SetFontParagraph();
    doc.text(318, 600, "Les deux styles situ\351s dans la partie inf\351rieure du");
    doc.text(318, 614, "mod\xE8le, aimable et expressif, r\351f\xE8rent des individus qui");
    doc.text(318, 628, "manifestent davantage d'habilet\351s \xE0 se montrer sen-");
    doc.text(318, 642, "sibles aux autres, \xE0 leurs craintes et \xE0 leurs besoins.");
    doc.text(318, 656, "Ils expriment ouvertement leurs r\351actions affectives et");
    doc.text(318, 670, "accordent de l'importance \xE0 entrer en r\351sonance avec");
    doc.text(318, 684, "les \351motions des autres.");

    //Footer of 2nd page
    doc.setTextColor(102, 102, 102);
    doc.line(265, 737, 576, 737);
    doc.setFontSize(6);
    doc.text(265, 745, "2");
    doc.setFontSize(8.5);
    doc.text(270, 747, "Mod\xE8le de Cormier (Cormier, S. La communication et la gestion) adapt\351 par CFC");
    doc.CustomFooter(fName, lName, gName, t_date, "2");

    //Beginning of third page
    doc.addPage();
    doc.SetFontTitle_T1();
    doc.setFontSize(18);
    doc.text(37, 49, "DESCRIPTION SOMMAIRE DES STYLES");
    doc.setFontSize(9);
    doc.text(382, 42.5, "3");

    //Beginning of Analytique table
    doc.rect(37, 72, 540, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFontType('bold');
    doc.text(42, 82.5, "Analytique");

    doc.BulletString2(42, 105, "R\351action non impulsive, r\351fl\351chie");
    doc.BulletString2(42, 119, "Effort Maximal pour organiser");
    doc.BulletString2(42, 133, "Centr\351 sur les processus");
    doc.BulletString2(42, 147, "Pr\351occupation moins prononc\351e pour l'\351motivit\351 et");
    doc.text(42 + 17, 160, "les sentiments personnels");
    doc.BulletString2(42, 175, "Cadre de r\351f\351rence historique");
    doc.BulletString2(42, 189, "Prudence dans l'action");
    doc.BulletString2(42, 203, "Tendance \xE0 \351viter l'implication personnelle");
    doc.BulletString2(42, 217, "Besoin de v\351rit\351 et de pertinence");
    doc.BulletString2(42, 231, "Diplomate");
    doc.BulletString2(42, 245, "Logique");

    doc.BulletString2(320, 105, "Exact");
    doc.BulletString2(320, 119, "Capacit\351 d'analyse");
    doc.BulletString2(320, 133, "Rigoureux");
    doc.BulletString2(320, 147, "Ce qui le motive : proc\351dures, efficience,");
    doc.text(320 + 17, 160, "fa\xE7ons de faire, organisation");
    doc.BulletString2(320, 175, "Ce qui le d\351motive : conflits, erreurs, \xAB tourner");
    doc.text(320 + 17, 188, "les coins ronds \xBB");
    doc.BulletString2(320, 203, "Limites : perfectionniste, h\351site trop avant d'agir,");
    doc.text(320 + 17, 216, "esprit critique et parfois s\351v\xE8re, rigide, exigeant,");
    doc.text(320 + 17, 230, "pointilleux, \351vite l'implication personnelle");

    //Beginnning of Directif table
    doc.setFillColor(23, 53, 129);
    doc.rect(37, 298, 540, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFontType('bold');
    doc.text(42, 309, "Directif");

    doc.BulletString2(42, 331, "R\351action rapide");
    doc.BulletString2(42, 345, "Effort Maximal pour contr\xF4ler");
    doc.BulletString2(42, 359, "Centr\351 sur la t\xE2che");
    doc.BulletString2(42, 374, "Pr\351occupation minimale pour l'analyse approfondie");
    doc.text(42 + 17, 387, "et la f\351flexion th\351orique");
    doc.BulletString2(42, 402, "Le pr\351sent comme cadre de r\351f\351rence");
    doc.BulletString2(42, 416, "Action directe");
    doc.BulletString2(42, 430, "Tendance \xE0 \351viter l'inaction");
    doc.BulletString2(42, 444, "Besoin de contr\xF4le et de r\351sultats");
    doc.BulletString2(42, 458, "Fonceur et direct");
    doc.BulletString2(42, 472, "Comp\351titif");
    doc.BulletString2(42, 486, "\xC9nergique");

    doc.BulletString2(320, 331, "Curieux");
    doc.BulletString2(320, 345, "Autonome");
    doc.BulletString2(320, 359, "Prend des d\351cisions, fait avancer les choses");
    doc.BulletString2(320, 374, "Questionne le statu quo");
    doc.BulletString2(320, 388, "Fixe et atteint des objectifs");
    doc.BulletString2(320, 402, "Ce qui le motive : r\351sultats, action, d\351fis");
    doc.BulletString2(320, 416, "Ce qui le d\351motive : \351chec, absence de marge");
    doc.text(320 + 17, 429, "de man\u0153uvre, inactivit\351");
    doc.BulletString2(320, 444, "Limites : provoque des risques, \351prouve des");
    doc.text(320 + 17, 457, "difficul\351s \xE0 prendre le temps d'\351couter avec");
    doc.text(320 + 17, 471, "rigueur et pr\351cision, impatience, manque de");
    doc.text(320 + 17, 485, "diplomatie et de tact");

    //Footer of third page
    doc.setTextColor(102, 102, 102);
    doc.line(265, 737, 576, 737);
    doc.setFontSize(6);
    doc.text(265, 745, "3");
    doc.setFontSize(8.5);
    doc.text(270, 747, "Mod\xE8le de Cormier (Cormier, S. La communication et la gestion) adapt\351 par CFC");
    doc.CustomFooter(fName, lName, gName, t_date, "3");

    doc.addPage();

    //Beginning of Aimable table
    doc.setFillColor(23, 53, 129);
    doc.rect(37, 39, 540, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFontType('bold');
    doc.text(42, 49.5, "Aimable");

    doc.BulletString2(42, 72, "R\351action mod\351r\351e");
    doc.BulletString2(42, 86, "Effort Maximal pour entrer en relation");
    doc.BulletString2(42, 100, "Centr\351 sur les personnes");
    doc.BulletString2(42, 114, "Pr\351occupation minimale pour la logique trop");
    doc.text(42 + 17, 127, "formelle");
    doc.BulletString2(42, 142, "Le pr\351sent comme cadre de r\351f\351rence");
    doc.BulletString2(42, 156, "Action de soutien");
    doc.BulletString2(42, 170, "Tendance \xE0 \351viter le conflit");
    doc.BulletString2(42, 184, "Besoin de coop\351ration et d'acceptation");
    doc.BulletString2(42, 198, "Patient");
    doc.BulletString2(42, 212, "R\351fl\351chi");
    doc.BulletString2(42, 226, "Pr\351voyant");
    doc.BulletString2(42, 240, "Aimable, gentil");

    doc.BulletString2(320, 72, "Pers\351v\351rant");
    doc.BulletString2(320, 86, "Constant");
    doc.BulletString2(320, 100, "Loyal");
    doc.BulletString2(320, 114, "Grande capacit\351 de r\351solution de probl\xE8me");
    doc.BulletString2(320, 128, "P\351r\351nnit\351 du savoir-faire");
    doc.BulletString2(320, 142, "Bon joueur d'\351quipe");
    doc.BulletString2(320, 156, "Ce qui le motive : s\351curit\351, appartenance,");
    doc.text(320 + 17, 169, "continuit\351, relations");
    doc.BulletString2(320, 184, "Ce qui le d\351motive : chaos, conflit, d\351sordre,");
    doc.text(320 + 17, 197, "se faire bousculer, logique trop formelle");
    doc.BulletString2(320, 212, "Limites : influen\xE7able, ayant moins d'assurance,");
    doc.text(320 + 17, 226, "parfois h\351sitant, peu comp\351titif, h\351sitant \xE0 trans-");
    doc.text(320 + 17, 240, "mettre du feed-back critique");

    //Beginning of expressif table
    doc.setFillColor(23, 53, 129);
    doc.rect(37, 292, 540, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFontType('bold');
    doc.text(42, 302.5, "Expressif");

    doc.BulletString2(42, 325, "R\351action vive");
    doc.BulletString2(42, 339, "Effort Maximal pour s'impliquer");
    doc.BulletString2(42, 353, "Centr\351 sur l'interaction");
    doc.BulletString2(42, 367, "Pr\351occupation minimale pour la routine et la");
    doc.text(42 + 17, 380, "conformit\351");
    doc.BulletString2(42, 395, "Le futur comme cadre de r\351f\351rence");
    doc.BulletString2(42, 409, "Impulsivit\351 dans l'action");
    doc.BulletString2(42, 423, "Tendance \xE0 \351viter L'isolement");
    doc.BulletString2(42, 437, "Besoin de stimulation et d'interaction");
    doc.BulletString2(42, 451, "Influent");
    doc.BulletString2(42, 465, "Amical");
    doc.BulletString2(42, 479, "Persuasif");
    doc.BulletString2(42, 493, "Parle beaucoup");

    doc.BulletString2(320, 325, "Communicatif");
    doc.BulletString2(320, 339, "Positif");
    doc.BulletString2(320, 353, "Mobilisateur");
    doc.BulletString2(320, 367, "Rassembleur");
    doc.BulletString2(320, 381, "Fier");
    doc.BulletString2(320, 395, "Bon ambassadeur");
    doc.BulletString2(320, 409, "Leader d'opinion");
    doc.BulletString2(320, 423, "Ce qui le motive : reconnaissance sociale,");
    doc.text(320 + 17, 436, "relations, interaction");
    doc.BulletString2(320, 451, "Ce qui le d\351motive : rejet, isolement, m\351fiance");
    doc.BulletString2(320, 465, "Limites : impulsif \351motivement, parle trop, peut");
    doc.text(320 + 17, 478, "privil\351gier les \351l\351ments sociaux au d\351triment");
    doc.text(320 + 17, 492, "de la t\xE2che");

    //Footer of last page
    doc.setFontSize(8.5);
    doc.CustomFooter(fName, lName, gName, t_date, "4");

    doc.save("user_report.pdf");
}

function CreateGroupReport(data) {

    var t_date = GetCurrentCompleteDate();
    var doc = new jsPDF('p', 'pt', [612, 792]);

    for (var i = 0, c = data.length; i < c; i++) {
        var gName = data[i][0];
        var result1 = data[i][1][0][0];
        var strong1 = data[i][1][0][1];
        var result2 = data[i][1][1][0];
        var strong2 = data[i][1][1][1];
        var result3 = data[i][1][2][0];
        var strong3 = data[i][1][2][1];
        var result4 = data[i][1][3][0];
        var strong4 = data[i][1][3][1];
        
        //Header of the front page
        doc.addImage(IMG_logoCFC, "jpeg", 445, 50, 135, 37);
        doc.setFillColor(23, 53, 129);
        doc.rect(0, 108, 87, 46, 'F');
        doc.setTextColor(23, 53, 129);
        doc.setFont('helvetica');
        doc.setFontSize(20);
        doc.text(92, 127, "CONNA\xCETRE SON STYLE PERSONNEL");
        doc.text(92, 148, "DE COMMUNICATION");
        doc.setFontSize(8);
        doc.text(302, 140, "1");

        var lineFactor = 0;

        if (gName.length < 12) {
            lineFactor = 10.5;
        } else {
            lineFactor = 10;
        }
        //name and result headline
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(18);
        doc.setFontType('bold');
        doc.text(95, 200, gName);
        var txtWidth = doc.getStringUnitWidth(gName) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        doc.setLineWidth(1);
        doc.line(95, 207, 95 + txtWidth, 207);
        doc.setTextColor(23, 53, 129);
        doc.setFontSize(18);
        doc.text(95, 225, "R\xC9SULTAT");

        doc.setTextColor(0, 0, 0);
        doc.setFontType('normal');
        doc.PrintGroupGraph((doc.internal.pageSize.width / 2) + 10, 250, result1, result2, result3, result4, strong1, strong2, strong3, strong4);

        //footer 1st page
        doc.setTextColor(102, 102, 102);
        doc.line(265, 730, 576, 730);
        doc.setFontSize(6);
        doc.text(265, 738, "1");
        doc.setFontSize(8.5);
        doc.text(270, 740, "Mod\xE8le de Cormier (Cormier, S. La communication et la gestion) adapt\351 par CFC");
        doc.CustomFooter_group(t_date);
        
        if (i < (c -1)) {
            doc.addPage();
        }
    }
    doc.save("Rapport_Groupe.pdf");
    $('.load').addClass("hidden-load");
    $('body').removeClass("loading");

    return;
}

function CreateReportPDF(json_data) {
    var doc = new jsPDF('l', 'pt', [612, 792]);
    doc.setFont("helvetica");
    var startGraphX = (doc.internal.pageSize.width / 2);
    var startGraphY = 100;
    var columns = ["GROUPE", "NOM", "PRENOM", "DATE D\311BUT", "DATE FIN", "PROGR\310S"];

    var data = [];
    //Prepare data
    for (var i = 0; i < json_data.length; i++) {
        data[i] = [];
        data[i][0] = json_data[i][DB_QUIZ_RESULTS_GROUP_NAME];
        data[i][1] = json_data[i][DB_QUIZ_RESULTS_NOM];
        data[i][2] = json_data[i][DB_QUIZ_RESULTS_PRENOM];
        data[i][3] = json_data[i][DB_QUIZ_RESULTS_START_DATE];
        data[i][4] = json_data[i][DB_QUIZ_RESULTS_END_DATE];
        data[i][5] = json_data[i][DB_QUIZ_RESULTS_PROGRESS_NAME];
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

    doc.save("Rapport_Participation.pdf");
    $('.load').addClass("hidden-load");
    $('body').removeClass("loading");
}

function CreatePDFCFC(json_data, options_data, quiz_data) {
    //Reset page counter
    PDF_Nb_Pages = 1;

    //FONT with signs: zapfdingbats
    var jspdf_doc = new jsPDF('p', 'pt', [612, 792]);
    jspdf_doc.setFont("helvetica");
    jspdf_doc.setLineWidth(1);

    json_data_array = JSON.parse(json_data);

    //*** DEBUT BOUCLE POUR TOUS LES RECORDS SELECTIONNES
    for (var i = 0; i < json_data_array.length; i++) {
        progress_cur_element = i;
        //Get current user score
        var score_string_array = json_data_array[i][DB_QUIZ_RESULTS_QUIZ_SCORE].split(",");
        var score_array = new Array();
        var score_max = 0;
        for (var j = 0; j < score_string_array.length; j++) {
            score_array.push(score_string_array[j].substr(3));
            score_max += parseInt(score_array[j]);
        }
        CreateFirstPage(jspdf_doc, json_data_array[i][DB_QUIZ_RESULTS_NOM] + " " + json_data_array[i][DB_QUIZ_RESULTS_PRENOM],
                "",
                json_data_array[i][DB_QUIZ_RESULTS_END_DATE],
                json_data_array[i][DB_QUIZ_RESULTS_GROUP_NAME],
                score_array[0],
                score_array[1],
                score_array[2],
                score_array[3],
                score_max

                );

        //Add page if needed
        if (i < json_data_array.length - 1) {
            jspdf_doc.addPage();
            PDF_Nb_Pages++;
        }
    }

    jspdf_doc.save("Rapport_Usager.pdf");
    $('.load').addClass("hidden-load");
    $('body').removeClass("loading");

    return;
}

//Get images source
IMG_style_bg.src = "/Resources/public/media/images/style_sociaux_bg.jpeg";
IMG_logoCFC.src = "/Resources/public/media/images/logo-cfc-fr.jpeg";
strongIcon.src = "/Resources/public/media/images/icone.png";