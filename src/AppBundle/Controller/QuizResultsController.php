<?php

namespace AppBundle\Controller;

use AppBundle\Entity\QuizResults;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use DateTime;
use stdClass;

/**
 * Quizresult controller.
 * @Security("has_role('ROLE_USER')")
 * @Route("{account}/quizresults")
 */
class QuizResultsController extends Controller {

    /**
     * Lists all quizResult entities.
     *
     * @Route("/", name="quizresults_index")
     * @Method("GET")
     */
    public function indexAction() {
        $em = $this->getDoctrine()->getManager();

        $quizResults = $em->getRepository('AppBundle:QuizResults')->findAll();

        return $this->render('quizresults/index.html.twig', array(
                    'quizResults' => $quizResults,
        ));
    }

    /**
     * Creates a new quizResult entity.
     *
     * @Route("/new", name="quizresults_new")
     * @Method({"GET", "POST"})
     */
    public function newAction(Request $request, $account) {
        //FALTA ADICIONAR SEGURIDAD START OJOooooooooooooooooooooooo
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'false'), 400);
        }
        // END   OJOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
        $usr = $this->get('security.token_storage')->getToken()->getUser();
        $em = $this->getDoctrine()->getManager();

        if (!$usr->getAccountInfo()->validateAccount($account)) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        $data = json_decode($request->getContent());
        $quizInfo = $em->getRepository('AppBundle:Quiz')
                ->findOneByQuizId($data->QUIZ_ID);
        if ($quizInfo == NULL) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        $validation = FALSE;
        $departmentInfo = $usr->getDepartmentAuthorization()->getDepartmentInfo();
        foreach ($departmentInfo->getQuizAuthorizationCollection() as $quizAuthorization) {
            if ($quizAuthorization->getQuizInfo() == $quizInfo) {
                $validation = TRUE;
            }
        }

        if (!$usr->getDepartmentAuthorization()->getDepartmentInfo()->hasQuiz($quizInfo)) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        if ($quizInfo->getTimeToComplete() > 0) {
            if ((($data->END_DATE - $data->START_DATE) < $quizInfo->getTimeToComplete()) ||
                    ((($request->END_DATE - $request->START_DATE ) == $quizInfo->getTimeToComplete()) &&
                    ( count(explode(",", $data->ANSWERS)) > 1 ))) {
                $progress = 3;
            } else {
                $progress = 2;
                $data->ANSWERS = "";
                $data->QUIZ_SCORE = "";
            }
        } elseif (count(explode(",", $data->ANSWERS)) > 1) {
            $progress = 3;
        } else {
            $progress = 2;
            $data->ANSWERS = "";
            $data->QUIZ_SCORE = "";
        }

        $progressId = $em->getRepository('AppBundle:ProgressInfo')
                ->find($progress);
        if ($progressId == NULL) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        $quizResultsConflict = $em->getRepository('AppBundle:QuizResults')
                ->createQueryBuilder('u')
                ->where('u.quizId = :quizId')
                ->andWhere('u.userInfo = :userInfo')
                ->setParameter("userInfo", $usr)
                ->setParameter("quizId", $quizInfo)
                ->getQuery()
                ->getOneOrNullResult();
        if ($quizInfo->getLockedOnCompletion()) {
            if ($quizResultsConflict != NULL) {
                return new JsonResponse(array('message' => 'false'), 400);
            }
        } else {
            if ($quizResultsConflict != NULL) {
                $data->PREVIOUS_ANSWERS = $quizResultsConflict->getAnswers();
                $data->PREVIOUS_SCORES = $quizResultsConflict->getQuizScore();
            }
        }

        $startDate = new DateTime();
        $startDate->setTimestamp($data->START_DATE);
        $endDate = new DateTime();
        $endDate->setTimestamp($data->END_DATE);
        if ($progress == 3) {
            switch ($quizInfo->getQuizType()->getName()) {
                case 'TYPE_A':
                    $data->QUIZ_SCORE = $this->getScoreTypeA($data->ANSWERS, $quizInfo);
                    break;
                case 'TYPE_B':
                    $data->QUIZ_SCORE = $this->getScoreTypeB($data->ANSWERS, $quizInfo);
                    break;
                default:
                    return new JsonResponse(array('message' => 'false'), 400);
            }
        }

        $quizResults = new QuizResults();
        $quizResults->mapPostData($data);
        $quizResults->setQuizID($quizInfo)
                ->setUserID($usr)
                ->setProgressId($progressId)
                ->setStartDate($startDate)
                ->setEndDate($endDate);

        $em->persist($quizResults);
        $em->flush();

        return new JsonResponse(array('message' => $quizInfo->getId()), 201);
    }

    /**
     * Displays a form to edit an existing quizResult entity.
     *
     * @Route("/{id}/edit", name="quizresults_edit")
     * @Method({"GET", "POST"})
     */
    public function editAction(Request $request, QuizResults $quizResult) {
        $deleteForm = $this->createDeleteForm($quizResult);
        $editForm = $this->createForm('AppBundle\Form\QuizResultsType', $quizResult);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted() && $editForm->isValid()) {
            $this->getDoctrine()->getManager()->flush();

            return $this->redirectToRoute('quizresults_edit', array('id' => $quizResult->getId()));
        }

        return $this->render('quizresults/edit.html.twig', array(
                    'quizResult' => $quizResult,
                    'edit_form' => $editForm->createView(),
                    'delete_form' => $deleteForm->createView(),
        ));
    }

    /**
     * Deletes a quizResult entity.
     *
     * @Route("/{id}", name="quizresults_delete")
     * @Method("DELETE")
     */
    public function deleteAction(Request $request, QuizResults $quizResult) {
        $form = $this->createDeleteForm($quizResult);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->remove($quizResult);
            $em->flush();
        }

        return $this->redirectToRoute('quizresults_index');
    }

    /**
     * Creates a form to delete a quizResult entity.
     *
     * @param QuizResults $quizResult The quizResult entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm(QuizResults $quizResult) {
        return $this->createFormBuilder()
                        ->setAction($this->generateUrl('quizresults_delete', array('id' => $quizResult->getId())))
                        ->setMethod('DELETE')
                        ->getForm()
        ;
    }

    //AJAX FUNCTIONS
    /**
     *
     * @Route("/getDataTypeA", name="get_result_type_a")
     * @Method({"GET", "POST"})
     */
    public function getDataTypeA(Request $request, $account) {
        
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'false'), 400);
        }
        $usr = $this->get('security.token_storage')->getToken()->getUser();
        if (!$usr->getAccountInfo()->validateAccount($account)) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        $data = [];
        $data[0] = [];
        $data[1] = [];

        foreach ($usr->getQuizResultsCollection() as $quizResult) {
            if ($quizResult->getProgressId()->getId() == 3 &&
                    $quizResult->getQuizID()->getId() == $request->getContent()) {
                $quizResults = $quizResult->getData();
                $quizResults[] = $quizResult->getQuizID()->getQuizID();
                $quizResults[] = $quizResult->getUserID()->getUserName();
                $quizResults[] = "";
                $quizResults[] = "";
                $quizResults[] = "";
                $quizResults[] = "";
                $quizResults[] = $usr->getDepartmentAuthorization()->getDepartmentInfo()->getId();
                $quizResults[] = $usr->getDepartmentAuthorization()->getDepartmentInfo()->getName();
                $quizResults[] = $quizResult->getProgressId()->getFra();
                $data[0][] = $quizResults;
                $data[2][] = $quizResult->getQuizID()->getData();
            }
            if ($quizResult->getProgressId()->getId() == 3 &&
                    $quizResult->getQuizID()->getQuizType() == 'TYPE_A') {
                $quiz_result = [];
                $quiz_result['USER_ID'] = $usr->getId();
                $quiz_result['ANSWERS'] = $quizResult->getAnswers();
                $quiz_result['QUIZ_SCORE'] = $quizResult->getQuizScore();
                $quiz_result['QUIZ_ID'] = $quizResult->getQuizID()->getId();
                $quizGroupQuizList = $em->getRepository('AppBundle:QuizGroupQuizList')
                        ->findOneBy(array('quizId' => $quizResult->getQuizID()->getId()));
                $quiz_result['QUIZ_GROUP_ID'] = $quizGroupQuizList->getQuizGroupID();
                $quiz_result['QUIZ_ORDER'] = $quizGroupQuizList->getOrderNB();
                $quiz_result['QUIZ_NAME'] = $quizResult->getQuizID()->getQuizID();
                $data[1][] = $quiz_result;
            }
        }

        if (empty($data)) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        return new JsonResponse(array('message' => $data), 200);
    }
    
    /**
     *
     * @Route("/getDataTypeB", name="get_result_type_b")
     * @Method({"GET", "POST"})
     */
    public function getDataTypeB(Request $request, $account) {

        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'false'), 400);
        }
        $usr = $this->get('security.token_storage')->getToken()->getUser();
        if (!$usr->getAccountInfo()->validateAccount($account)) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        foreach ($usr->getQuizResultsCollection() as $quizResult) {
            if ($quizResult->getProgressId()->getId() == 3 &&
                    $quizResult->getQuizID()->getId() == $request->getContent()) {
                $data[0] = $usr->getFirstName();
                $data[1] = $usr->getName();
                $data[2] = $usr->getUsername();
                $data[3] = $quizResult->getEndDate()->format('Y-m-d');
                $dataScore = explode(',', $quizResult->getQuizScore());
                $data[4] = $this->GetDataFromRawString($dataScore[0], 'r', null);
                $data[5] = $this->GetDataFromRawString($dataScore[1], 'r', null);
                $data[6] = $this->GetDataFromRawString($dataScore[2], 'r', null);
                $data[7] = $this->GetDataFromRawString($dataScore[3], 'r', null);
                continue;
            }
        }

        if (empty($data)) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        return new JsonResponse(array('message' => $data), 200);
    }

    public function getDataFromString($data, $valA, $valB = null) {

        $posA = strrpos($data, $valA) + 1;

        if ($valB != null) {
            $posB = strrpos($data, $valB);
            return substr($data, $posA, $posB - $posA);
        } else {
            return substr($data, $posA);
        }
    }

    public function getHighestInArray($arrayToSort) {
        $highestValue = $arrayToSort[0];
        for ($m = 0; $m < count($arrayToSort); $m++) {
            if ($m == 0) {
                $highestValue = $arrayToSort[$m];
            } else if ($arrayToSort[$m] > $highestValue) {
                $highestValue = $arrayToSort[$m];
            }
        }
        return $highestValue;
    }

    public function sumUpArray($arrayToAdd) {
        $arraySum = 0;
        for ($q = 0; $q < count($arrayToAdd); $q++) {
            $arraySum += $arrayToAdd[$q];
        }

        return $arraySum;
    }

    public function GetDataFromRawString($stringP, $firstLimiter, $secondLimiter) {

        $res;
        if ($secondLimiter != null) {
            $res = substr($stringP, strpos($stringP, $firstLimiter) + 1, strpos($stringP, $secondLimiter));
        } else {
            $res = substr($stringP, strpos($stringP, $firstLimiter) + 1);
        }

        return $res;
    }

    public function getScoreTypeA($answers, $quizInfo) {

        $goodAnswers = explode("|", $quizInfo->getAnswerJson());
        for ($j = 0; $j < count($goodAnswers); $j++) {
            $goodAnswers[$j] = explode(";", $goodAnswers[$j]);
            for ($m = 0; $m < count($goodAnswers[$j]); $m++) {
                $goodAnswers[$j][$m] = explode(",", $goodAnswers[$j][$m]);
            }
        }

        $resultRawData = explode(",", $answers);
        $resultsCompiledData = new stdClass();

        $section = 0;
        $score = 0;
        $resultCompiledData = new stdClass();
        $resultCompiledData->{'section' . $section} = new stdClass();
        $newSection = 0;
        $sectionCounter = 0;
        $questionCounter = 0;
        $maxScorePerSection = array();

        $item = count($resultRawData);
        for ($i = 0; $i <= $item; $i++) {

            if (!isset($resultRawData[$i])) {
                $resultRawData[$i] = NULL;
            }
            $newSection = $this->getDataFromString($resultRawData[$i], "s", "q");
            $question = $this->getDataFromString($resultRawData[$i], "q", "a");
            $answer = $this->getDataFromString($resultRawData[$i], "a");
            $weight = $goodAnswers[$newSection][$question][$answer];

            if ($newSection != $section) {
                if ($score < 0)
                    $score = 0;

                $resultCompiledData->{'section' . $section}->{'maxScore'} = $this->sumUpArray($maxScorePerSection);
                $maxScorePerSection = array();
                $resultCompiledData->{'section' . $section}->{'score'} = $score;
                $resultCompiledData->{'section' . $section}->{'questionLength'} = $questionCounter;
                $section = $newSection;
                $questionCounter = 0;
                $resultCompiledData->{'section' . $section} = new stdClass();

                $score = 0;
                $sectionCounter++;
            }

            $score += (int) $weight;
            if (!isset($resultsCompiledData->{'section' . $section})) {
                $resultsCompiledData->{'section' . $section} = new stdClass();
            }

            $resultsCompiledData->{'section' . $section}->{'question' . $question} = new stdClass();
            $resultsCompiledData->{'section' . $section}->{'question' . $question}->{'answer'} = $answer;
            $resultsCompiledData->{'section' . $section}->{'question' . $question}->{'score'} = $weight;
            $resultsCompiledData->{'section' . $section}->{'question' . $question}->{'maxScore'} = $this->getHighestInArray($goodAnswers[$newSection][$question]);
            array_push($maxScorePerSection, $resultsCompiledData->{'section' . $section}->{'question' . $question}->{'maxScore'});
            $questionCounter++;
        }

        if ($score < 0)
            $score = 0;

        $resultCompiledData->{'section' . $section}->{'maxScore'} = $this->sumUpArray($maxScorePerSection);
        $maxScorePerSection = array();
        $resultCompiledData->{'section' . $section}->{'score'} = $score;
        $resultCompiledData->{'section' . $section}->{'questionLength'} = $questionCounter;

        $resultCompiledData->{'sectionLength'} = $sectionCounter;

        //Creer les resultas de section s##r##m##
        $sectionResultString = '';
        for ($k = 0; $k < $resultCompiledData->{'sectionLength'}; $k++) {
            if ($k == (int) $resultCompiledData->{'sectionLength'} - 1) {
                $sectionResultString.= "s" . $k . "r" . $resultCompiledData->{'section' . $k}->{'score'} . "m" . $resultCompiledData->{'section' . $k}->{'maxScore'};
            } else {
                $sectionResultString.= "s" . $k . "r" . $resultCompiledData->{'section' . $k}->{'score'} . "m" . $resultCompiledData->{'section' . $k}->{'maxScore'} . ",";
            }
        }

        return $sectionResultString;
    }

    public function getScoreTypeB($answers, $quizInfo) {
        $stringResult = explode(',', $answers);
        $timeToAnswer = $quizInfo->getTimeToComplete();
        $goodAnswers = explode("|", $quizInfo->getAnswerJson());

        for ($j = 0; $j < count($goodAnswers); $j++) {
            $goodAnswers[$j] = explode(";", $goodAnswers[$j]);
            for ($m = 0; $m < count($goodAnswers[$j]); $m++) {
                $goodAnswers[$j][$m] = explode(",", $goodAnswers[$j][$m]);
            }
        }

        $resultArrayTmp = array();
        $counter = 0;

        for ($i = 0; $i < count($goodAnswers); $i++) {
            for ($j = 0; $j < count($goodAnswers[$i]); $j++) {
                $resultArrayTmp[$counter] = $goodAnswers[$i][$j];
                $counter++;
            }
        }

        $resultArray = array();

        for ($i = 0; $i < count($resultArrayTmp); $i++) {
            $resultArray[$i] = implode('', $resultArrayTmp[$i]);
        }

        $userResults = array(0, 0, 0, 0);

        for ($i = 0; $i < count($stringResult); $i++) {
            $answer = $this->GetDataFromRawString($stringResult[$i], "a", null);
            switch ($answer) {
                case 0:
                    $val = strpos($resultArray[$i], "a");
                    $userResults[$val] ++;
                    break;
                case 1:
                    $val = strpos($resultArray[$i], "b");
                    $userResults[$val] ++;
                    break;
                case 2:
                    $val = strpos($resultArray[$i], "c");
                    $userResults[$val] ++;
                    break;
                case 3:
                    $val = strpos($resultArray[$i], "d");
                    $userResults[$val] ++;
                    break;
                default:
                    //echo "Error invalid answer";
                    break;
            }
        }

        for ($i = 0; $i < count($userResults); $i++) {
            $userResults[$i] = 's' . $i . 'r' . $userResults[$i];
        }

        return implode(",", $userResults);
    }

}
