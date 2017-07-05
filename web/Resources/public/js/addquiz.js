var cq_quiz_data = {section: []};

window.addEventListener("load", function () {

    var addQuiz = document.getElementById("onAddQuiz");
    if (addQuiz)
        addQuiz.addEventListener("click", onAddQuiz);

    $(".js_quizTitle").click(onQuizTitle);
    $(".js_add_answer").click(onAddAnswer);
    $(".js_add_question").click(onAddQuestion);
    $(".js_add_section").click(onManageSections);
    $(".js_delete_section").click(onDeleteSection);
    $(".js_delete_question").click(onDeleteQuestion);
    $(".js_delete_answer").click(onDeleteAnswer);

});

var onQuizAddComplete = function (data) {
    console.log(data);
    /*if (data.responseText === "true") {
     location.reload();
     }*/

}

function onQuizTitle() {

    var modal = $('div.modal.in');
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
        onAddSection(this);
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

function onAddSection(el) {

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
    
    data['quizType'] = form["QUIZ_TYPE"].value;
    data['lockedOnCompletion'] = form["LOCKED_ON_COMPLETION"].checked;
    data['isUserCanDisplayChart'] = form["IS_USER_CAN_DISPLAY_CHART"].checked;
    data['isUserCanDisplayQa'] = form["IS_USER_CAN_DISPLAY_QA"].checked;
    data['isEnabled'] = form["IS_ENABLED"].checked;
    data['isUserSeeGoodAnswer'] = form["IS_USER_SEE_GOOD_ANSWER"].checked;
    data['agencies'] = [];
    for (var i = 0, c = form['user_department'].length; i < c; i++) {
        if (form['user_department'][i].checked === true) {
            data.agencies.push(form['user_department'][i].value);
        }
    }
    if (data.agencies.length == 0) {
        $("input:checkbox[name='user_department']").focus();
        return false;
    }

    $.ajax({
        method: "POST",
        url: "/" + account + "/quiz/addquiz",
        processData: false,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(data),
        complete: onQuizAddComplete
    });
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