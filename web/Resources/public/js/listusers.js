window.addEventListener("load", function () {
    $("#usersList").click(createUsersList);

    $(function () {
        $('[data-toggle="popover"]').popover()
    });

    $('input#rdm_psw').change(hideOrShowPswInput);
});

function hideOrShowPswInput() {
    if ($('input#rdm_psw:checked').val() === undefined) {
        $('.js-psw').removeClass('hide');
    } else {
        $('.js-psw').addClass('hide');
    }
}

function createUsersList(e) {

    startLoadBtnGif(e.target);
    var data = {};
    data.users = [];
    var users = $('textarea#users_list').val().split(",");

    if ($('input#notification:checked').val() === undefined) {
        var pattern = /^[a-zA-Z0-9ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ@_\-\.]{6,30}$/;
        data.notification = false;
    } else {
        var pattern = /^.{2,30}@.{2,30}\.[a-zA-Z]{2,6}$/;
        data.notification = true;
    }

    for (var i = 0, c = users.length; i < c; i++) {
        if (users[i].trim().match(pattern)) {
            data.users.push(users[i].trim());
        } else {
            alert("username : " + users[i] + " forbidden");
            endLoadBtnGif(e.target);
            return;
        }
    }

    if ($('input#rdm_psw:checked').val() === undefined) {
        var patternPsw = /^.{6,16}$/;
        var password = document.getElementById('password').value.trim();
        if (password.match(patternPsw)) {
            data.password = password;
        } else {
            alert("mot de passe doit contenir entre 6 et 16 characteres, pas d'espaces");
            endLoadBtnGif(e.target);
            return;
        }
        data.rdm_psw = false;
    } else {
        data.rdm_psw = true;
    }

    if ($('input[name=user_department]:checked').val() === undefined) {
        alert("il faut choisir un departement");
        endLoadBtnGif(e.target);
        return false;
    }

    data.department = $('input[name=user_department]:checked').val();

    $.ajax({
        url: "/" + account + "/user/newListAjax",
        type: 'post',
        async: true,
        headers: {"cache-control": "no-cache"},
        cache: false,
        data: JSON.stringify(data),
        dataType: "text",
        success: function (return_data) {
            if (return_data.message == "false") {
                alert("ERREUR: lecture de la base de données impossible...");
                endLoadBtnGif(e.target);
            }
            if (createUsersListPDF(JSON.parse(return_data).message, data.notification)) {
                location.reload();
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("ERREUR: lecture de la base de données impossible...");
            endLoadBtnGif(e.target);
        }
    });
}

function createUsersListPDF(data, notification) {

    var doc = new jsPDF('p', 'pt', [612, 792]);
    var nbPages = 1;
    var font_size = 12;
    var font_size_table = 10;
    var font_size_subscript = 8;
    var left_margin = 50;
    var right_margin = 30;
    var top_margin = 75;
    var max_width_page = 612 - left_margin - right_margin;
    var curr_y = top_margin;

    doc.setFont("helvetica");
    doc.setFontSize(font_size);

    if (false === notification && data.created.length > 0) {
        var columns = ["USAGER CRÉÉ", "MOT DE PASSE"];
        var createdData = [];
        //Prepare data
        for (var i = 0; i < data.created.length; i++) {
            createdData[i] = [];
            createdData[i][0] = data.created[i][0];
            createdData[i][1] = data.created[i][1];
        }

        if (data.created.length == 1) {
            var title_user_created = doc.splitTextToSize("L'usager suivant a été créé pour le departement '" + data.department + "' : ", max_width_page);
        } else {
            var title_user_created = doc.splitTextToSize("Les usagers suivants ont été créés pour le departement '" + data.department + "' : ", max_width_page);
        }

        doc.text(title_user_created, left_margin, curr_y);
        curr_y = curr_y + (font_size * title_user_created.length);
        doc.autoTable(columns, createdData, {
            styles: {fontSize: font_size_table},
            startY: curr_y,
            afterPageContent: function (createdData) {
                nbPages++;
            }
        });
        curr_y = curr_y + (createdData.length * 20) + 63; //value from autoTable
    } else if (true === notification && data.created.length > 0) {
        var columns = ["USAGER CRÉÉ"];
        var createdData = [];
        //Prepare data
        for (var i = 0; i < data.created.length; i++) {
            createdData[i] = [];
            createdData[i][0] = data.created[i];
        }
        if (data.created.length == 1) {
            var title_user_created = doc.splitTextToSize("L'usager suivant a été créé pour le departement '" + data.department + "' : ", max_width_page);
        } else {
            var title_user_created = doc.splitTextToSize("Les usagers suivants ont été créés pour le departement '" + data.department + "' : ", max_width_page);
        }

        doc.text(title_user_created, left_margin, curr_y);
        curr_y = curr_y + (font_size * title_user_created.length);
        doc.autoTable(columns, createdData, {
            styles: {fontSize: font_size_table},
            startY: curr_y,
            afterPageContent: function (createdData) {
                nbPages++;
            }
        });
        curr_y = curr_y + (createdData.length * 20) + 33; //value from autoTable
        doc.setFontSize(font_size_subscript);
        doc.text("* Une notification a été envoyée à chaque utilisateur créé.", left_margin, curr_y);

        curr_y = curr_y + 30;
    }

    if (data.failed.length > 0) {
        var columns = ["Requête échoue"];
        var failedData = [];
        //Prepare data
        for (var i = 0; i < data.failed.length; i++) {
            failedData[i] = [];
            failedData[i][0] = data.failed[i];
        }
        if (data.failed.length == 1) {
            var title_user_failed = doc.splitTextToSize("La requête suivante a échoué : ", max_width_page);
        } else {
            var title_user_failed = doc.splitTextToSize("Les requêtes suivantes ont échoués : ", max_width_page);
        }

        doc.setFontSize(font_size);
        doc.text(title_user_failed, left_margin, curr_y);
        curr_y = curr_y + (font_size * title_user_failed.length);
        doc.autoTable(columns, failedData, {
            styles: {fontSize: font_size_table},
            startY: curr_y,
            afterPageContent: function (failedData) {
                nbPages++;
            }
        });
        curr_y = curr_y + (createdData.length * 20) + 33; //value from autoTable
    }
    doc.save("Liste_utilisateurs_crees.pdf");

    return true;
}

function startLoadBtnGif(obj) {
    $(obj).button('loading');
}

function endLoadBtnGif(obj) {
    $(obj).button('reset');
}