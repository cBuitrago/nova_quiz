<?php

namespace AppBundle\Controller;

use AppBundle\Entity\AccountInfo;
use AppBundle\Entity\DepartmentInfo;
use AppBundle\Entity\DepartmentAuthorization;
use AppBundle\Entity\UserInfo;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Accountinfo controller.
 * @Security("has_role('ROLE_ADMIN')")
 * @Route("{account}/report")
 */
class ReportController extends Controller {

    private $CorporateUniqueID = [];
    private $GroupUniqueID = [];
    private $AgencyUniqueID = [];
    private $QuizUniqueID = [];
    private $UniqueUserID = [];
    private $data = [];

    /**
     * Lists all accountInfo entities.
     * @Route("/", name="report_index")
     * @Method("GET")
     */
    public function indexAction($account = '') {

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        $em = $this->getDoctrine()->getManager();
        if (!$usr->getAccountInfo()->validateAccount($account)) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        if ($this->get('security.authorization_checker')->isGranted('ROLE_GOD') &&
                $usr->getAccountInfo()->hasRole('IS_GOD')) {
            $accountInfos = $em->getRepository('AppBundle:AccountInfo')->findAll();
        }

        if ($usr->getAccountInfo()->hasRole('IS_PROVIDER')) {
            $accountInfos = $usr->getAccountInfo()->getChildrenCollection();
        }

        if (empty($accountInfos)) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        return $this->render('report/index.html.twig', array(
                    'accountInfos' => $accountInfos,
                    'account' => $account,
        ));
    }

    /**
     * @Route("/average", name="report_average")
     * @Method("POST")
     */
    public function getAverageAction(Request $request, $account) {

        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        $em = $this->getDoctrine()->getManager();
        if (!$usr->getAccountInfo()->validateAccount($account)) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        $requestContent = json_decode($request->getContent());
        $this->GetUniqueID(json_decode($requestContent->data));
        $reportType = $em->getRepository('AppBundle:ReportType')
                ->findOneByName($requestContent->reportType);
        if (NULL === $reportType) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        $data = [];
        if (array_search('none', explode(",", $requestContent->compare)) !== FALSE) {

            foreach ($this->UniqueUserID as $user) {
                $userInfo = $em->getRepository('AppBundle:UserInfo')->find($user);
                if ($userInfo == NULL) {
                    return new JsonResponse(array('message' => 'false'), 400);
                }

                foreach ($userInfo->getQuizResultsCollection() as $result) {
                    if ($result->getProgressId()->getId() == 3 &&
                            $reportType->supportQuiz($result->getQuizID())) {
                        $quiz_result = [];
                        $quiz_result['USER_ID'] = $userInfo->getId();
                        $quiz_result['ANSWERS'] = $result->getAnswers();
                        $quiz_result['QUIZ_SCORE'] = $result->getQuizScore();
                        $quiz_result['QUIZ_ID'] = $result->getQuizID()->getId();
                        $quizGroupQuizList = $em->getRepository('AppBundle:QuizGroupQuizList')
                                ->findOneBy(array('quizId' => $result->getQuizID()->getId()));
                        $quiz_result['QUIZ_GROUP_ID'] = $quizGroupQuizList->getQuizGroupID();
                        $quiz_result['QUIZ_ORDER'] = $quizGroupQuizList->getOrderNB();
                        $quiz_result['QUIZ_NAME'] = $result->getQuizID()->getQuizID();
                        array_push($data, $quiz_result);
                    }
                }
            }
        }
        if (array_search('AGENCIES', explode(",", $requestContent->compare)) !== FALSE) {

            foreach ($this->AgencyUniqueID as $agency) {
                $quiz_answers = [];
                $quiz_scores = [];
                $quiz_id = [];
                $departmentInfo = $em->getRepository('AppBundle:DepartmentInfo')->find($agency);
                if ($departmentInfo == NULL) {
                    return new JsonResponse(array('message' => 'false'), 400);
                }

                if (!$usr->getAccountInfo()->validateAccount($departmentInfo->getAccountInfo()->getName())) {
                    return new JsonResponse(array('message' => 'false'), 400);
                }

                if (!$usr->getDepartmentInfo()->validateDepartment($departmentInfo)) {
                    return new JsonResponse(array('message' => 'false'), 400);
                }

                foreach ($departmentInfo->getDepartmentAuthorizationCollection() as $deptAuthorization) {
                    if ($deptAuthorization->getUserInfo()->getQuizResultsCollection()->count() > 0) {
                        foreach ($deptAuthorization->getUserInfo()->getQuizResultsCollection() as $quizResult) {
                            if (!isset($quiz_answers[$quizResult->getQuizID()->getId()])) {
                                $quiz_answers[$quizResult->getQuizID()->getId()] = [];
                                $quiz_scores[$quizResult->getQuizID()->getId()] = [];
                                $quiz_id[] = $quizResult->getQuizID()->getId();
                            }
                            if ($quizResult->getProgressId()->getId() == 3 &&
                                    $reportType->supportQuiz($quizResult->getQuizID())) {
                                $quiz_answers[$quizResult->getQuizID()->getId()][] = $quizResult->getAnswers();
                                $quiz_scores[$quizResult->getQuizID()->getId()][] = $quizResult->getQuizScore();
                            }
                        }
                    }
                }

                foreach ($quiz_id as $quizId) {
                    if (array_search($quizId, $this->QuizUniqueID) !== FALSE && count($quiz_answers[$quizId]) > 0) {
                        $quiz_scores_averages = $this->CalculateScoresAverage($quiz_scores[$quizId]);
                        $quiz_answers_average = $this->CalculateAnswersAverage($quiz_answers[$quizId]);
                        $agencies_info = [];
                        $agencies_info[0] = "AGENCIES_AVERAGES";
                        $agencies_info[1] = $quizId; //Current QUIZ_ID
                        $agencies_info[2] = $departmentInfo->getId(); //Current AGENCY_ID
                        $agencies_info[3] = $quiz_scores_averages; //Current AGENCY_ID/QUIZ_ID scores averages
                        $agencies_info[4] = $quiz_answers_average; //Current AGENCY_ID/QUIZ_ID answers averages
                        $agencies_info[5] = $departmentInfo->getName(); //Current AGENCY_NAME
                        array_push($data, $agencies_info);
                    }
                }
            }
        }

        if (array_search('CORPORATES', explode(",", $requestContent->compare)) !== FALSE) {

            foreach ($this->CorporateUniqueID as $corporate) {
                $quiz_corpo_answers = [];
                $quiz_corpo_scores = [];
                $quiz_id = [];
                $corpoInfo = $em->getRepository('AppBundle:AccountInfo')->find($corporate);
                if (!$usr->getAccountInfo()->validateAccount($corpoInfo->getName())) {
                    return new JsonResponse(array('message' => 'false'), 400);
                }

                foreach ($corpoInfo->getUserInfo() as $userInfo) {
                    if ($userInfo->getQuizResultsCollection()->count() > 0) {
                        foreach ($userInfo->getQuizResultsCollection() as $quizResult) {
                            if (!isset($quiz_corpo_answers[$quizResult->getQuizID()->getId()])) {
                                $quiz_corpo_answers[$quizResult->getQuizID()->getId()] = [];
                                $quiz_corpo_scores[$quizResult->getQuizID()->getId()] = [];
                                $quiz_id[] = $quizResult->getQuizID()->getId();
                            }

                            if ($quizResult->getProgressId()->getId() == 3) {
                                $quiz_corpo_answers[$quizResult->getQuizID()->getId()][] = $quizResult->getAnswers();
                                $quiz_corpo_scores[$quizResult->getQuizID()->getId()][] = $quizResult->getQuizScore();
                            }
                        }
                    }
                }
                foreach ($quiz_id as $quizId) {
                    if (array_search($quizId, $this->QuizUniqueID) !== FALSE && count($quiz_corpo_answers[$quizId]) > 0) {
                        $quiz_corpo_scores_averages = $this->CalculateScoresAverage($quiz_corpo_scores[$quizId]);
                        $quiz_answers_average = $this->CalculateAnswersAverage($quiz_corpo_answers[$quizId]);
                        $corpo_info[0] = "CORPORATES_AVERAGES";
                        $corpo_info[1] = $quizId; //Current QUIZ_ID
                        $corpo_info[2] = $corpoInfo->getId(); //Current CORPO_ID
                        $corpo_info[3] = $quiz_corpo_scores_averages; //Current CORPO_ID/QUIZ_ID scores averages
                        $corpo_info[4] = $quiz_answers_average; //Current CORPO_ID/QUIZ_ID answers averages
                        $corpo_info[5] = $corpoInfo->getName(); //Current CORPO_NAME
                        array_push($data, $corpo_info);
                    }
                }
            }
        }

        return new JsonResponse(array('message' => $data), 200);
    }

    /**
     * @Route("/average_type_b", name="report_average_type_b")
     * @Method("POST")
     */
    public function getAverageTypeBAction(Request $request, $account) {

        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        $em = $this->getDoctrine()->getManager();
        if (!$usr->getAccountInfo()->validateAccount($account)) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        $requestContent = json_decode($request->getContent());

        $data = [];
        $reportType = $em->getRepository('AppBundle:ReportType')->findOneByName('SQUARE_25');

        foreach ($requestContent as $key => $group) {

            $quizInfo = $em->getRepository('AppBundle:Quiz')->find(intval($key));
            if (!$quizInfo) {
                return new JsonResponse(array('message' => 'false'), 400);
            }
            if (!$reportType->supportQuiz($quizInfo)) {
                return new JsonResponse(array('message' => 'false'), 400);
            }

            foreach ($group as $value) {
                $agencyInfo = $em->getRepository('AppBundle:DepartmentInfo')->find(intval($value));
                if (!$agencyInfo) {
                    return new JsonResponse(array('message' => 'false'), 400);
                }
                if (!$usr->getDepartmentInfo()->validateDepartment($agencyInfo)) {
                    return new JsonResponse(array('message' => 'false'), 400);
                }
                $quiz_scores = array();
                foreach ($agencyInfo->getDepartmentAuthorizationCollection() as $userAgency) {
                    if ($userAgency->getUserInfo()->getQuizResultsCollection()->count() > 0) {
                        foreach ($userAgency->getUserInfo()->getQuizResultsCollection() as $quizResult) {
                            if ($quizResult->getProgressId()->getId() == 3 &&
                                    $reportType->supportQuiz($quizResult->getQuizID())) {
                                $quiz_scores[] = $quizResult->getQuizScore();
                            }
                        }
                    }
                }
                $group_final_score = [[0, 0], [0, 0], [0, 0], [0, 0]];
                if (count($quiz_scores) > 0) {
                    $group_Scores = array();
                    for ($i = 0; $i < count($quiz_scores); $i++) {
                        $group_Scores[] = $this->GetProfileFromData($quiz_scores[$i]);
                    }

                    $group_final_score = $this->GetGroupFinalScore($group_Scores);
                }
                $final_return[0] = $agencyInfo->getName();
                $final_return[1] = $group_final_score;
                array_push($data, $final_return);
            }
        }
        return new JsonResponse(array('message' => $data), 200);
    }

    /**
     * @Route("/reportData", name="report_data")
     * @Method("GET")
     */
    public function getReportData(Request $request, $account) {

        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        $em = $this->getDoctrine()->getManager();

        if (!$usr->getAccountInfo()->validateAccount($account)) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        $reportType = $em->getRepository('AppBundle:ReportType')->findOneByName($request->get('data'));
        if (NULL === $reportType) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        $this->data = [];
        $this->data[0] = [];
        $this->data[1] = [];

        //OjOOOOOOOOOOOOOOOOO  seguridad enviar quiz autorizados
        $quizArray = $em->getRepository('AppBundle:Quiz')
                ->findAll();
        foreach ($quizArray as $quiz) {
            if ($reportType->supportQuiz($quiz)) {
                $this->data[1][] = $quiz->getData();
            }
        }
//end OJOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
        if ($usr->isGod() && $usr->getAccountInfo()->hasRole('IS_GOD')) {

            $allQuizResults = $em->getRepository('AppBundle:QuizResults')->findAll();
            $this->setData($allQuizResults, $reportType);
        } else if ($usr->isAccountAdminUser() && $usr->getAccountInfo()->hasRole('IS_PROVIDER')) {

            foreach ($usr->getAccountInfo()->getUserInfo() as $userInfo) {
                $this->setData($userInfo->getQuizResultsCollection(), $reportType);
            }

            foreach ($usr->getAccountInfo()->getChildrenCollection() as $childAccount) {
                foreach ($childAccount->getUserInfo() as $userInfo) {
                    $this->setData($userInfo->getQuizResultsCollection(), $reportType);
                }
            }
        } else if ($usr->isAccountAdminUser() && $usr->getAccountInfo()->hasRole('IS_USUAL')) {

            foreach ($usr->getAccountInfo()->getChildrenCollection() as $childAccount) {
                foreach ($childAccount->getUserInfo() as $userInfo) {
                    $this->setData($userInfo->getQuizResultsCollection(), $reportType);
                }
            }
        } else if ($usr->isAdmin()) {
            $department = $usr->getDepartmentInfo();
            foreach ($department->getDepartmentAuthorizationCollection() as $departmentAuthorization) {
                $this->setData($departmentAuthorization->getUserInfo()->getQuizResultsCollection(), $reportType);
            }

            if ($usr->getDepartmentAuthorization()->getIsRecursive()) {
                if (count($department->getChildrenCollection()) > 0) {
                    $this->builderTree($department, $reportType);
                }
            }
        } else {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        $progressInfo = $em->getRepository('AppBundle:ProgressInfo')->findAll();
        foreach ($progressInfo as $progress) {
            $this->data[2][] = $progress->getData();
        }

        return new JsonResponse(array('message' => $this->data), 200);
    }

    /**
     * @Route("/reportType/{type}", name="report_type")
     * @Method("GET")
     */
    public function getTypeReport(Request $request, $account, $type) {

        if ($type == 'type_a') {
            return $this->render('report/report_type_a.html.twig', array(
                        'account' => $account,
            ));
        }

        if ($type == 'type_b') {

            return $this->render('report/report_type_b.html.twig', array(
                        'account' => $account,
            ));
        }

        throw $this->createAccessDeniedException('You cannot access this page!');
    }

    public function builderTree($department, $reportType) {
        foreach ($department->getChildrenCollection() as $departmentInfo) {
            foreach ($departmentInfo->getDepartmentAuthorizationCollection() as $departmentAuthorization) {
                $this->setData($departmentAuthorization->getUserInfo()->getQuizResultsCollection(), $reportType);
            }
            if (count($departmentInfo->getChildrenCollection()) > 0) {
                $this->builderTree($departmentInfo, $reportType);
            }
        }
    }

    public function setData($allQuizResults, $reportType) {

        foreach ($allQuizResults as $quizResult) {
            if ($reportType->supportQuiz($quizResult->getQuizID())) {
                $departmentInfo = $quizResult->getUserInfo()->getDepartmentAuthorization()->getDepartmentInfo();
                $quizResults = $quizResult->getData();
                $quizResults[] = $quizResult->getQuizID()->getQuizID();
                $quizResults[] = $quizResult->getUserInfo()->getUserName();
                $quizResults[] = $quizResult->getUserInfo()->getAccountInfo()->getId();
                $quizResults[] = $quizResult->getUserInfo()->getAccountInfo()->getName();
                $quizResults[] = $departmentInfo->getParent() ? $departmentInfo->getParent()->getId() : "";
                $quizResults[] = $departmentInfo->getParent() ? $departmentInfo->getParent()->getName() : "";
                $quizResults[] = $departmentInfo->getId();
                $quizResults[] = $departmentInfo->getName();
                $quizResults[] = $quizResult->getProgressId()->getFra();
                $this->data[0][] = $quizResults;
            }
        }
    }

    public function CalculateScoresAverage($quiz_scores_array) {
        $quiz_scores_array_average = array();
        for ($i = 0; $i < count($quiz_scores_array); $i++) {
            $split_array = explode(',', $quiz_scores_array[$i]);
            for ($j = 0; $j < count($split_array); $j++) {
                $r_pos = strpos($split_array[$j], 'r');
                $m_pos = strpos($split_array[$j], 'm');
                //get section, result and maximum #
                $cur_section = substr($split_array[$j], 1, $r_pos - 1);
                $cur_result = substr($split_array[$j], $r_pos + 1, 1);
                $cur_max = substr($split_array[$j], $m_pos + 1);
                if (!isset($quiz_scores_array_average[$cur_section][0])) {
                    $quiz_scores_array_average[$cur_section][0] = 0;
                }
                $quiz_scores_array_average[$cur_section][0] += $cur_result;
                //Keep highest MAX found
                if (!isset($quiz_scores_array_average[$cur_section][1])) {
                    $quiz_scores_array_average[$cur_section][1] = 0;
                }
                if ($cur_max > $quiz_scores_array_average[$cur_section][1]) {
                    $quiz_scores_array_average[$cur_section][1] = $cur_max;
                }
            }
        }
        //Calculate final average
        $split_array2 = explode(',', $quiz_scores_array[0]);
        for ($m = 0; $m < count($split_array2); $m++) {
            $quiz_scores_array_average[$m][0] = $quiz_scores_array_average[$m][0] / count($quiz_scores_array);
        }

        return $quiz_scores_array_average;
    }

    public function CalculateAnswersAverage($quiz_answers_array) {
        // ******************* TO verify OUTPUT... *****************************
        $quiz_asnwers_array_average = array();

        for ($i = 0; $i < count($quiz_answers_array); $i++) {
            $split_array = explode(',', $quiz_answers_array[$i]);
            for ($j = 0; $j < count($split_array); $j++) {
                if (preg_match('/s[0-9]{1}q[0-9]{1}a[0-9]{1}/', $split_array[$j]) == TRUE) {
                    if (!isset($quiz_asnwers_array_average[substr($split_array[$j], 0, 4)])) {
                        $quiz_asnwers_array_average[substr($split_array[$j], 0, 4)] = array();
                        $quiz_asnwers_array_average[substr($split_array[$j], 0, 4)]['total'] = 0;
                    }
                    if (!isset($quiz_asnwers_array_average[substr($split_array[$j], 0, 4)][substr($split_array[$j], 5, 1)])) {
                        $quiz_asnwers_array_average[substr($split_array[$j], 0, 4)][substr($split_array[$j], 5, 1)] = 0;
                    }
                    $quiz_asnwers_array_average[substr($split_array[$j], 0, 4)][substr($split_array[$j], 5, 1)] += 1;
                    $quiz_asnwers_array_average[substr($split_array[$j], 0, 4)]['total'] += 1;
                }
            }
        }

        return $quiz_asnwers_array_average;
    }

    public function GetUniqueID($json_data) {
        $CorporateUniqueID = [];
        $GroupUniqueID = [];
        $AgencyUniqueID = [];
        $QuizUniqueID = [];
        $UniqueUserID = [];

        for ($i = 0; $i < count($json_data); $i++) {
            $CorporateUniqueID[$i] = $json_data[$i][12]; //CORPORATE_ID
            $GroupUniqueID[$i] = $json_data[$i][14]; //GROUP_ID
            $AgencyUniqueID[$i] = $json_data[$i][16]; //AGENCY_ID
            $QuizUniqueID[$i] = $json_data[$i][1]; //QUIZ_ID
            $UniqueUserID[$i] = $json_data[$i][2]; //USER_ID
        }

        //make unique values
        $this->CorporateUniqueID = array_values(array_unique($CorporateUniqueID, SORT_REGULAR));
        $this->GroupUniqueID = array_values(array_unique($GroupUniqueID));
        $this->AgencyUniqueID = array_values(array_unique($AgencyUniqueID, SORT_REGULAR));
        $this->QuizUniqueID = array_values(array_unique($QuizUniqueID, SORT_REGULAR));
        $this->UniqueUserID = array_values(array_unique($UniqueUserID, SORT_REGULAR));
    }

    public function GetDataFromRawString($stringP, $firstLimiter, $secondLimiter = NULL) {

        $res;
        if ($secondLimiter != null) {
            $res = substr($stringP, strpos($stringP, $firstLimiter) + 1, strpos($stringP, $secondLimiter));
        } else {
            $res = substr($stringP, strpos($stringP, $firstLimiter) + 1);
        }

        return $res;
    }

    public function GetProfileFromData($data) {

        $final_result = [0, 0, 0, 0];
        $split_array = explode(',', $data);
        $values = array();
        for ($i = 0; $i < count($split_array); $i++) {
            $values[$i] = substr($split_array[$i], 3);
        }
//Find the max value(s)
        $maxs = array_keys($values, max($values));
//Check if only one max value
        if (count($maxs) == 1) {
            if ($values[$maxs[0]] >= 13) {
                $final_result[$maxs[0]] = 2; //2=dominant
            } else {
                $final_result[$maxs[0]] = 1; //1=prominant
            }
        } else if (count($maxs) > 1) {
            for ($j = 0; $j < count($maxs); $j++) {
                $final_result[$maxs[$j]] = 1; //1=prominant
            }
        }

        return $final_result;
    }

    public function GetGroupFinalScore($data) {

        $final_score = [[0, 0], [0, 0], [0, 0], [0, 0]];
        for ($i = 0; $i < count($data); $i++) {

            if ($data[$i][0] == 1 || $data[$i][0] == 2) {
                $final_score[0][0] += 1;
                if ($data[$i][0] == 2) {
                    $final_score[0][1] += 1;
                }
            }
            if ($data[$i][1] == 1 || $data[$i][1] == 2) {
                $final_score[1][0] += 1;
                if ($data[$i][1] == 2) {
                    $final_score[1][1] += 1;
                }
            }
            if ($data[$i][2] == 1 || $data[$i][2] == 2) {
                $final_score[2][0] += 1;
                if ($data[$i][2] == 2) {
                    $final_score[2][1] += 1;
                }
            }
            if ($data[$i][3] == 1 || $data[$i][3] == 2) {
                $final_score[3][0] += 1;
                if ($data[$i][3] == 2) {
                    $final_score[3][1] += 1;
                }
            }
        }
        return $final_score;
    }

}
