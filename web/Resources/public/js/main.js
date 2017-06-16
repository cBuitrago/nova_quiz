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
var DB_QUIZ_RESULTS_PREVIOUS_SCORES = 9
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

var cq_quiz_data = {section: []};

window.addEventListener("load", function () {
    /*var userTable = document.getElementById("usersTable");
    if (userTable) {
        GetAllUsersFromServer();
    }
    var userTableAgency = document.getElementById("dataTableAgency");
    if (userTableAgency) {
        GetAllUsersAgencyFromServer();
    }
    /**LOGIN, LOGOUT*/
    /*var login = document.getElementById("onLogin")
    if (login)
        login.addEventListener("click", onLogin);
    var logout = document.getElementById("onLogout")
    if (logout)
        logout.addEventListener("click", onLogout);
    /**ACCOUNT*/
    /*var editSettings = document.getElementById("editSettings")
    if (editSettings)
        editSettings.addEventListener("click", onSettingsEdit);
    /**USER*/
    /*var userEdit = document.getElementById("onUserEdit");
    if (userEdit)
        userEdit.addEventListener("click", onUserEdit);
    var userAdd = document.getElementById("onUserAdd");
    if (userAdd)
        userAdd.addEventListener("click", onUserAdd);
    var usersCreate = document.getElementById("onUsersCreate");
    if (usersCreate)
        usersCreate.addEventListener("click", onUsersCreate);
    var userAddAccount = document.getElementById("onUserAddAccount");
    if (userAddAccount)
        userAddAccount.addEventListener("click", onUserAddAccount);
    var userRemove = document.getElementById("onUserRemove");
    if (userRemove)
        userRemove.addEventListener("click", onUserRemove);
    var userEditPassword = document.getElementById("onUserEditPassword");
    if (userEditPassword)
        userEditPassword.addEventListener("click", onUserEditPassword);
    var userEditProfile = document.getElementById("onUserEditProfile");
    if (userEditProfile)
        userEditProfile.addEventListener("click", onUserEditProfile);
    var userChangePassword = document.getElementById("onUserChangePassword");
    if (userChangePassword)
        userChangePassword.addEventListener("click", onUserChangePassword);
    var userEditPermission = document.getElementById("onUserEditPermission");
    if (userEditPermission)
        userEditPermission.addEventListener("click", onUserEditPermission);
    var userEditAgency = document.getElementById("onUserEditAgency");
    if (userEditAgency)
        userEditAgency.addEventListener("click", onUserEditAgency);
    /**DEPARTMENT*/
    /*var addDepartment = document.getElementById("onDepartmentAdd");
    if (addDepartment)
        addDepartment.addEventListener("click", onDepartmentAdd);
    var editDepartment = document.getElementById("onDepartmentEdit");
    if (editDepartment)
        editDepartment.addEventListener("click", onDepartmentEdit);
    /**QUIZ*/
    /*var addQuiz = document.getElementById("onAddQuiz");
    if (addQuiz)
        addQuiz.addEventListener("click", onAddQuiz);
    var editQuiz = document.getElementById("onEditQuiz");
    if (editQuiz)
        editQuiz.addEventListener("click", onEditQuiz);
    var cancelAll = document.getElementById("cancelAll")
    if (cancelAll)
        cancelAll.addEventListener("click", onCancelAll);
    /**TEST*/
    var test = document.getElementById("test");
    if (test)
        test.addEventListener("click", onTest);

    sizeImg();

    $(".js_quizTitle").click(onQuizTitle);
    $("input.editInput").keyup(function () {
        $(this).addClass('changed');
    });
    $(".cancelAll").click(function () {
        location.reload();
    });
    $(window).resize(function () {
        sizeImg();
    });

    $(".js_add_answer").click(onAddAnswer);
    $(".js_add_question").click(onAddQuestion);
    $(".js_add_section").click(onManageSections);
    $(".js_delete_section").click(onDeleteSection);
    $(".js_delete_question").click(onDeleteQuestion);
    $(".js_delete_answer").click(onDeleteAnswer);

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

/**QUIZ*/
var onQuizAddComplete = function (data) {
    if (data.responseText === "true") {
        location.reload();
    }
}

function onQuizTitle() {

    var modal = $('div.modal.in');
    //var modal = document.getElementById('editDataQuiz');
    if (!validateInput(modal[0].querySelector('#QUIZ_TITLE'), 'name')) {
        return;
    }

    cq_quiz_data['pageTitle'] = modal[0].querySelector('#QUIZ_TITLE').value;
    $('a[href="#collapse_' + this.getAttribute("data-collapse") + '"]').click();

}

function onManageSections() {

    var current_section = this.getAttribute("data-collapse");
    var next_section = parseInt(current_section) + 1;
    var testButton = document.querySelector("button[data-collapse='" + next_section + "']");

    if (testButton == null) {
        onCreateNewSection(this);
    } else {
        $("a[href='#collapse_" + next_section + "']").click();
    }
}

function onDeleteSection() {
    var parentPanelGroup = $(this).parents('.panel-group');
    var sections = parentPanelGroup.find('div.panel.panel-default.js_section');

    if (sections.length > 1) {
        $(this).parents('div.panel.panel-default.js_section')[0].remove();
        var newSections = parentPanelGroup.find('div.panel.panel-default.js_section');
        for (var i = 0; i < newSections.length; i++) {
            var cur_number = i + 1;
            newSections[i].querySelector('a[role=button][data-toggle=collapse]').setAttribute('href', '#collapse_' + cur_number);
            newSections[i].querySelector('a[role=button][data-toggle=collapse]').innerHTML = 'Section ' + cur_number + ' : ';
            newSections[i].querySelector('div.panel-collapse.collapse[role=tabpanel]').setAttribute('id', 'collapse_' + cur_number);
            newSections[i].querySelector('button.js_add_section').setAttribute('data-collapse', cur_number);
        }
    }
}

function onDeleteQuestion() {
    var parentPanelGroup = $(this).parents('div.question');
    var questions = parentPanelGroup.find('div.question_body');

    if (questions.length > 1) {
        $(this).parents('div.question_body')[0].remove();
        var newQuestions = parentPanelGroup.find('div.question_body');

        for (var i = 0; i < newQuestions.length; i++) {
            var cur_number = i + 1;
            newQuestions[i].querySelector('input.js_curr_question').value = cur_number + '.';
        }
    }
}

function onDeleteAnswer() {
    var parentPanelGroup = $(this).parents('div.answer');
    var answers = parentPanelGroup.find('div.item');

    if (answers.length > 1) {
        $(this).parents('div.item')[0].remove();
        var newAnswers = parentPanelGroup.find('div.item');

        for (var i = 0; i < newAnswers.length; i++) {
            var cur_number = i + 1;
            if (i == 0) {
                newAnswers[i].querySelector('input.js_curr_answer').value = 'A.';
            } else {
                newAnswers[i].querySelector('input.js_curr_answer').value = defineValueLabel(newAnswers[i - 1].querySelector('input.js_curr_answer'));
            }
        }
    }
}

function onAddAnswer() {

    var thisQuestion = this.parentElement.parentElement;

    var divItem = document.createElement("div");
    divItem.setAttribute("class", "item");

    var divInputGroupeAnswer = document.createElement("div");
    divInputGroupeAnswer.setAttribute("class", "input-group");
    divItem.appendChild(divInputGroupeAnswer);

    var inputLabel = document.createElement("input");
    inputLabel.setAttribute("type", "text");
    inputLabel.setAttribute("class", "js_curr_answer");
    var allAnswers = thisQuestion.querySelectorAll('.item .js_curr_answer');
    var valueLabel = defineValueLabel(allAnswers[allAnswers.length - 1]);
    inputLabel.setAttribute("value", valueLabel);
    inputLabel.setAttribute("disabled", "disabled");
    divInputGroupeAnswer.appendChild(inputLabel);

    var inputAnswer = document.createElement("input");
    inputAnswer.setAttribute("type", "text");
    inputAnswer.setAttribute("name", "QUIZ_ANSWER_TITLE");
    divInputGroupeAnswer.appendChild(inputAnswer);

    var inputScore = document.createElement("input");
    inputScore.setAttribute("type", "number");
    inputScore.setAttribute("name", "QUIZ_ANSWER_SCORE");
    divInputGroupeAnswer.appendChild(inputScore);

    var spanDeleteAnswer = document.createElement("span");
    spanDeleteAnswer.setAttribute("class", "input-group-addon glyphicon glyphicon-remove btn-span");
    divInputGroupeAnswer.appendChild(spanDeleteAnswer);
    $(spanDeleteAnswer).click(onDeleteAnswer);

    thisQuestion.appendChild(divItem);

}

function onAddQuestion() {

    var thisSection = this.parentElement.parentElement;

    var divQuestionBody = document.createElement("div");
    divQuestionBody.setAttribute("class", "question_body");

    var divInputGroup = document.createElement("div");
    divInputGroup.setAttribute("class", "input-group");
    divQuestionBody.appendChild(divInputGroup);

    var inputLabelQuestion = document.createElement("input");
    inputLabelQuestion.setAttribute("type", "text");
    inputLabelQuestion.setAttribute("class", "js_curr_question");
    var allQuestions = thisSection.querySelectorAll('.js_curr_question');
    var valueLabel = defineValueLabelNumber(allQuestions[allQuestions.length - 1]);
    inputLabelQuestion.setAttribute("value", valueLabel);
    inputLabelQuestion.setAttribute("disabled", "disabled");
    divInputGroup.appendChild(inputLabelQuestion);

    var inputNewQuestion = document.createElement("input");
    inputNewQuestion.setAttribute("type", "text");
    inputNewQuestion.setAttribute("name", "QUIZ_QUESTION_TITLE");
    divInputGroup.appendChild(inputNewQuestion);

    var spanDeleteQuestion = document.createElement("span");
    spanDeleteQuestion.setAttribute("class", "input-group-addon glyphicon glyphicon-remove btn-span js_delete_question");
    divInputGroup.appendChild(spanDeleteQuestion);
    $(spanDeleteQuestion).click(onDeleteQuestion);

    var divAnswer = document.createElement("div");
    divAnswer.setAttribute("class", "answer");

    var divAnswerHead = document.createElement("div");
    divAnswerHead.setAttribute("class", "answer-head");
    divAnswer.appendChild(divAnswerHead);

    var pTitle = document.createElement("p");
    pTitle.setAttribute("class", "p_title");
    var pTextAnswer = document.createTextNode("Reponses");
    pTitle.appendChild(pTextAnswer);
    divAnswerHead.appendChild(pTitle);

    var buttonQuestion = document.createElement("button");
    buttonQuestion.setAttribute("type", "button");
    buttonQuestion.setAttribute("class", "btn btn-default btn-prev btn_add js_add_answer");
    var pTextButton = document.createTextNode("ajouter answer");
    buttonQuestion.appendChild(pTextButton);
    divAnswerHead.appendChild(buttonQuestion);

    var pScore = document.createElement("p");
    pScore.setAttribute("class", "score");
    var pTextScore = document.createTextNode("score");
    pScore.appendChild(pTextScore);
    divAnswerHead.appendChild(pScore);
    divQuestionBody.appendChild(divAnswer);

    var divItem = document.createElement("div");
    divItem.setAttribute("class", "item");

    var divInputGroupeAnswer = document.createElement("div");
    divInputGroupeAnswer.setAttribute("class", "input-group");
    divItem.appendChild(divInputGroupeAnswer);

    var inputLabel = document.createElement("input");
    inputLabel.setAttribute("type", "text");

    inputLabel.setAttribute("class", "js_curr_answer");
    inputLabel.setAttribute("value", "A.");
    inputLabel.setAttribute("disabled", "disabled");
    divInputGroupeAnswer.appendChild(inputLabel);

    var inputAnswer = document.createElement("input");
    inputAnswer.setAttribute("type", "text");
    inputAnswer.setAttribute("name", "QUIZ_ANSWER_TITLE");
    divInputGroupeAnswer.appendChild(inputAnswer);

    var inputScore = document.createElement("input");
    inputScore.setAttribute("type", "number");
    inputScore.setAttribute("name", "QUIZ_ANSWER_SCORE");
    divInputGroupeAnswer.appendChild(inputScore);

    var spanDeleteAnswer = document.createElement("span");
    spanDeleteAnswer.setAttribute("class", "input-group-addon glyphicon glyphicon-remove btn-span");
    divInputGroupeAnswer.appendChild(spanDeleteAnswer);
    $(spanDeleteAnswer).click(onDeleteAnswer);

    divAnswer.appendChild(divItem);
    thisSection.appendChild(divQuestionBody);

    $(buttonQuestion).click(onAddAnswer);
}

function onCreateNewSection(el) {

    var thisAccordion = document.getElementById("accordion");
    var prev_accordion = el.getAttribute("data-collapse");
    var current_accordion = parseInt(prev_accordion) + 1;

    var divPanel = document.createElement("div");
    divPanel.setAttribute("class", "panel panel-default js_section");
    thisAccordion.appendChild(divPanel);

    var divPanelHeading = document.createElement("div");
    divPanelHeading.setAttribute("class", "panel-heading");
    divPanelHeading.setAttribute("role", "tab");
    divPanel.appendChild(divPanelHeading);

    var divPanelHeadingH4 = document.createElement("h4");
    divPanelHeadingH4.setAttribute("class", "panel-title");
    divPanelHeading.appendChild(divPanelHeadingH4);
    var divPanelHeadingLink = document.createElement("a");
    divPanelHeadingLink.setAttribute("role", "button");
    divPanelHeadingLink.setAttribute("data-toggle", "collapse");
    divPanelHeadingLink.setAttribute("data-parent", "#accordion");
    divPanelHeadingLink.setAttribute("href", "#collapse_" + current_accordion);
    var titleLink = document.createTextNode("Section " + current_accordion + " :");
    divPanelHeadingLink.appendChild(titleLink);
    divPanelHeadingH4.appendChild(divPanelHeadingLink);

    var divCollapseId = document.createElement("div");
    divCollapseId.setAttribute("id", "collapse_" + current_accordion);
    divCollapseId.setAttribute("class", "panel-collapse collapse");
    divCollapseId.setAttribute("role", "tabpanel");
    divPanel.appendChild(divCollapseId);

    var divPanelBody = document.createElement("div");
    divPanelBody.setAttribute("class", "panel-body");
    divCollapseId.appendChild(divPanelBody);

    var divSingleInput = document.createElement("div");
    divSingleInput.setAttribute("class", "single-input");
    divPanelBody.appendChild(divSingleInput);

    var labelSection = document.createElement("label");
    labelSection.setAttribute("for", "QUIZ_SECTION_TITLE_" + prev_accordion);
    var textLabelSection = document.createTextNode("Titre de la section");
    labelSection.appendChild(textLabelSection);
    divSingleInput.appendChild(labelSection);

    var btnDeleteSection = document.createElement("button");
    btnDeleteSection.setAttribute("type", "button");
    btnDeleteSection.setAttribute("class", "btn btn-default btn-prev js_delete_section");
    var textBtnDeleteSection = document.createTextNode("Effacer Section");
    btnDeleteSection.appendChild(textBtnDeleteSection);
    divSingleInput.appendChild(btnDeleteSection);
    $(btnDeleteSection).click(onDeleteSection);

    var inputTitleSection = document.createElement("input");
    inputTitleSection.setAttribute("type", "text");
    inputTitleSection.setAttribute("name", "QUIZ_SECTION_TITLE");
    inputTitleSection.setAttribute("id", "QUIZ_SECTION_TITLE_" + prev_accordion);
    divSingleInput.appendChild(inputTitleSection);

    var divColorPicker = document.createElement("div");
    divColorPicker.setAttribute("class", "input-group colorpicker-component js_color_picker colorpicker-element");
    divPanelBody.appendChild(divColorPicker);

    var inputColorPicker = document.createElement("input");
    inputColorPicker.setAttribute("type", "text");
    inputColorPicker.setAttribute("value", "#00FFAA");
    inputColorPicker.setAttribute("class", "form-control");
    inputColorPicker.setAttribute("name", "js_color_section");
    divColorPicker.appendChild(inputColorPicker);

    var spanColorPicker = document.createElement("span");
    spanColorPicker.setAttribute("class", "input-group-addon");
    divColorPicker.appendChild(spanColorPicker);

    var iSpanColorPicker = document.createElement("i");
    spanColorPicker.appendChild(iSpanColorPicker);

    $(function () {
        $(divColorPicker).colorpicker({
            color: '#00FFAA',
            format: 'rgb'
        });
    });

    var divQuestionId = document.createElement("div");
    divQuestionId.setAttribute("class", "question");
    divQuestionId.setAttribute("id", "question");
    divPanelBody.appendChild(divQuestionId);

    var divQuestionHeadId = document.createElement("div");
    divQuestionHeadId.setAttribute("class", "question_head");
    divQuestionId.appendChild(divQuestionHeadId);

    var pQuestionHead = document.createElement("p");
    var textPQuestionHead = document.createTextNode("Question");
    pQuestionHead.appendChild(textPQuestionHead);
    divQuestionHeadId.appendChild(pQuestionHead);

    var buttonAddQuestion = document.createElement("button");
    buttonAddQuestion.setAttribute("type", "button");
    buttonAddQuestion.setAttribute("class", "btn btn-default btn-prev js_add_question");
    var textButtonQuestion = document.createTextNode("ajouter question");
    buttonAddQuestion.appendChild(textButtonQuestion);
    divQuestionHeadId.appendChild(buttonAddQuestion);

    $(buttonAddQuestion).click(onAddQuestion);

    var divQuestionBody = document.createElement("div");
    divQuestionBody.setAttribute("class", "question_body");
    divQuestionId.appendChild(divQuestionBody);

    var divInputGroup = document.createElement("div");
    divInputGroup.setAttribute("class", "input-group");
    divQuestionBody.appendChild(divInputGroup);

    var inputLabelQuestion = document.createElement("input");
    inputLabelQuestion.setAttribute("type", "text");
    inputLabelQuestion.setAttribute("class", "js_curr_question");
    inputLabelQuestion.setAttribute("value", "1. ");
    inputLabelQuestion.setAttribute("disabled", "disabled");
    divInputGroup.appendChild(inputLabelQuestion);

    var inputNewQuestion = document.createElement("input");
    inputNewQuestion.setAttribute("type", "text");
    inputNewQuestion.setAttribute("name", "QUIZ_QUESTION_TITLE");
    divInputGroup.appendChild(inputNewQuestion);

    var spanDeleteQuestion = document.createElement("span");
    spanDeleteQuestion.setAttribute("class", "input-group-addon glyphicon glyphicon-remove btn-span");
    divInputGroup.appendChild(spanDeleteQuestion);
    $(spanDeleteQuestion).click(onDeleteQuestion);

    var divAnswer = document.createElement("div");
    divAnswer.setAttribute("class", "answer");

    var divAnswerHead = document.createElement("div");
    divAnswerHead.setAttribute("class", "answer-head");
    divAnswer.appendChild(divAnswerHead);

    var pTitle = document.createElement("p");
    pTitle.setAttribute("class", "p_title");
    var pTextAnswer = document.createTextNode("Reponses");
    pTitle.appendChild(pTextAnswer);
    divAnswerHead.appendChild(pTitle);

    var buttonQuestion = document.createElement("button");
    buttonQuestion.setAttribute("type", "button");
    buttonQuestion.setAttribute("class", "btn btn-default btn-prev btn_add js_add_answer");
    var pTextButton = document.createTextNode("ajouter answer");
    buttonQuestion.appendChild(pTextButton);
    divAnswerHead.appendChild(buttonQuestion);

    $(buttonQuestion).click(onAddAnswer);

    var pScore = document.createElement("p");
    pScore.setAttribute("class", "score");
    var pTextScore = document.createTextNode("score");
    pScore.appendChild(pTextScore);
    divAnswerHead.appendChild(pScore);
    divQuestionBody.appendChild(divAnswer);

    var divItem = document.createElement("div");
    divItem.setAttribute("class", "item");
    divAnswer.appendChild(divItem);

    var divInputGroupeAnswer = document.createElement("div");
    divInputGroupeAnswer.setAttribute("class", "input-group");
    divItem.appendChild(divInputGroupeAnswer);

    var inputLabel = document.createElement("input");
    inputLabel.setAttribute("type", "text");

    inputLabel.setAttribute("class", "js_curr_answer");
    inputLabel.setAttribute("value", "A.");
    inputLabel.setAttribute("disabled", "disabled");
    divInputGroupeAnswer.appendChild(inputLabel);

    var inputAnswer = document.createElement("input");
    inputAnswer.setAttribute("type", "text");
    inputAnswer.setAttribute("name", "QUIZ_ANSWER_TITLE");
    divInputGroupeAnswer.appendChild(inputAnswer);

    var inputScore = document.createElement("input");
    inputScore.setAttribute("type", "number");
    inputScore.setAttribute("name", "QUIZ_ANSWER_SCORE");
    divInputGroupeAnswer.appendChild(inputScore);

    var spanDeleteAnswer = document.createElement("span");
    spanDeleteAnswer.setAttribute("class", "input-group-addon glyphicon glyphicon-remove btn-span");
    divInputGroupeAnswer.appendChild(spanDeleteAnswer);
    $(spanDeleteAnswer).click(onDeleteAnswer);

    var divFooter = document.createElement("div");
    divFooter.setAttribute("class", "modal-footer");
    divPanelBody.appendChild(divFooter);

    var buttonFooter = document.createElement("button");
    buttonFooter.setAttribute("type", "button");
    buttonFooter.setAttribute("class", "btn btn-primary js_add_section");
    buttonFooter.setAttribute("data-collapse", current_accordion);
    var pTextButtonFooter = document.createTextNode("next");
    buttonFooter.appendChild(pTextButtonFooter);
    divFooter.appendChild(buttonFooter);

    $(buttonFooter).click(onManageSections);

}

function defineValueLabel(el) {

    var curr_val = el.value;
    var new_val = curr_val.charCodeAt(0) + 1;

    return String.fromCharCode(new_val) + ".";

}

function defineValueLabelNumber(el) {

    var curr_val = el.value;
    var new_val = parseInt(curr_val) + 1;

    return new_val + ".";

}

function onAddQuiz() {

    var data = {};
    var form = document.getElementById('add_quiz_form');
    if (validateInput(form["QUIZ_ID"], 'name')) {
        data['quizId'] = form["QUIZ_ID"].value;
    } else {
        return false;
    }
    if (validateInput(form["TIME_TO_COMPLETE"], 'number')) {
        data['timeToComplete'] = form["TIME_TO_COMPLETE"].value;
    } else {
        return false;
    }
    if (true) {
        var dataAndScore = validateDataQuiz();
        data['quizData'] = JSON.stringify(dataAndScore[0]);
        data['answerJson'] = dataAndScore[1];
    } else {
        return false;
    }

    data['lockedOnCompletion'] = form["LOCKED_ON_COMPLETION"].checked;
    data['isUserCanDisplayChart'] = form["IS_USER_CAN_DISPLAY_CHART"].checked;
    data['isUserCanDisplayQa'] = form["IS_USER_CAN_DISPLAY_QA"].checked;
    data['isEnabled'] = form["IS_ENABLED"].checked;
    data['isUserSeeGoodAnswer'] = form["IS_USER_SEE_GOOD_ANSWER"].checked;
    data['agencies'] = [];
    for (var i = 0; i < form['agency_quiz'].length; i++) {
        if (form['agency_quiz'][i].checked === true) {
            data.agencies.push(form['agency_quiz'][i].value);
        }
    }

    if (data.agencies.length == 0) {
        $("input:radio[name='agency_quiz']").focus();
        return false;
    }

    $.ajax({
        method: "POST",
        url: baseUrl + "/php/quiz_add_ajax.php",
        processData: false,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(data),
        complete: onQuizAddComplete
    });
}

function onEditQuiz(e) {
    e.preventDefault();
    var data = {};

    var form = document.getElementById('edit_quiz_form');

    data['ID'] = form["ID"].value;
    if (validateInput(form["QUIZ_ID"], 'name')) {
        data['QUIZ_ID'] = form["QUIZ_ID"].value;
    } else {
        return false;
    }
    if (validateInput(form["TIME_TO_COMPLETE"], 'number')) {
        data['timeToComplete'] = form["TIME_TO_COMPLETE"].value;
    } else {
        return false;
    }
    if (true) {
        var dataAndScore = validateDataQuiz();
        data['QUIZ_DATA'] = JSON.stringify(dataAndScore[0]);
        data['ANSWER_JSON'] = dataAndScore[1];
    } else {
        return false;
    }

    data['LOCKED_ON_COMPLETION'] = form["LOCKED_ON_COMPLETION"].checked;
    data['IS_USER_CAN_DISPLAY_CHART'] = form["IS_USER_CAN_DISPLAY_CHART"].checked;
    data['IS_USER_CAN_DISPLAY_QA'] = form["IS_USER_CAN_DISPLAY_QA"].checked;
    data['IS_ENABLED'] = form["IS_ENABLED"].checked;
    data['IS_USER_SEE_GOOD_ANSWER'] = form["IS_USER_SEE_GOOD_ANSWER"].checked;
    data['AGENCY_QUIZ'] = [];

    for (var i = 0; i < form['AGENCY_QUIZ[]'].length; i++) {
        if (form['AGENCY_QUIZ[]'][i].checked === true) {
            data.AGENCY_QUIZ.push(form['AGENCY_QUIZ[]'][i].value);
        }
    }

    if (data.AGENCY_QUIZ.length == 0) {
        $("input:radio[name='agency_quiz']").focus();
        return false;
    }

    $.ajax({
        method: "POST",
        url: baseUrl + "/php/quiz_edit_ajax.php",
        processData: false,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(data),
        complete: onQuizAddComplete
    });
}

/** UTILITY */
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
            if (return_data == "FALSE")
            {
                alert("ERREUR: base de donn\351es innaccessible...");
                return;
            } else {
                var helper = JSON.parse(return_data);
                tableData = helper.users;
                LoadDataTableAgency();
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown)
        {
            alert("ERROR !");
        }
    });
}

function validateDataQuiz() {
    var reponse = [];
    var data = {};

    var answers = '';
    var accordion = document.getElementById('accordion');
    data.pageTitle = accordion.querySelector('input[name="QUIZ_TITLE"]').value;
    data.section = [];
    var sections = accordion.querySelectorAll('.js_section');

    for (var i = 0; i < sections.length; i++) {
        var currentSection = {};
        currentSection.sectionTitle = sections[i].querySelector('input[name="QUIZ_SECTION_TITLE"]').value;
        currentSection.color = getColorFormat(sections[i].querySelector('input[name="js_color_section"]').value);
        currentSection.question = [];
        var questions = sections[i].querySelectorAll('div.question_body');
        answers = i != 0 ? answers + "|" : answers;
        for (var j = 0; j < questions.length; j++) {
            var currentQuestion = {};
            currentQuestion.questionTitle = questions[j].querySelector('input[name="QUIZ_QUESTION_TITLE"]').value;
            currentQuestion.answer = [];
            var answersArray = questions[j].querySelectorAll('div.item');
            answers = j != 0 ? answers + ";" : answers;
            for (var k = 0; k < answersArray.length; k++) {
                var currentAnswer = {};
                currentAnswer.answerText = answersArray[k].querySelector('input[name="QUIZ_ANSWER_TITLE"]').value;
                var curr_answer = answersArray[k].querySelector('input[name="QUIZ_ANSWER_SCORE"]').value == "" ? 0 :
                        answersArray[k].querySelector('input[name="QUIZ_ANSWER_SCORE"]').value;
                answers = k != 0 ? answers + "," : answers;
                answers = answers + curr_answer;
                currentQuestion.answer.push(currentAnswer);
            }
            currentSection.question.push(currentQuestion);
        }
        data.section.push(currentSection);
    }

    reponse[0] = data;
    reponse[1] = answers;
    return reponse;
}

function getColorFormat(colorValue) {
    var color = {};
    var pattern = /^rgb\([0-9]{1,3}\,[0-9]{1,3}\,[0-9]{1,3}\){1}$/;

    if (colorValue.match(pattern)) {
        var colorString = colorValue.replace(/^rgb\(/, '');
        colorString = colorString.replace(/\)/, '');
        var colorArray = colorString.split(",");
        color.red = colorArray[0];
        color.green = colorArray[1];
        color.blue = colorArray[2];
    } else {
        color.red = "255";
        color.green = "255";
        color.blue = "255";
    }

    return color;
}

/**DATATABLE*/
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