<?php

namespace AppBundle\Controller;

use AppBundle\Entity\Quiz;
use AppBundle\Entity\QuizAuthorization;
use AppBundle\Entity\QuizAccount;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Quiz controller.
 * @Security("has_role('ROLE_USER')")
 * @Route("{account}/quiz")
 */
class QuizController extends Controller {

    /**
     * Lists all quiz entities.
     *
     * @Route("/", name="quiz_index")
     * @Method("GET")
     */
    public function indexAction($account) {

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        $quizzes = $usr->getDepartmentAuthorization()->getDepartmentInfo()->getQuizAuthorizationCollection();

        return $this->render('quiz/index.html.twig', array(
                    'quizzes' => $quizzes,
                    'account' => $account,
        ));
    }

    /**
     * Lists all quiz entities.
     *
     * @Route("/index", name="quiz_index_admin")
     * @Security("has_role('ROLE_ADMIN')")
     * @Method("GET")
     */
    public function indexAdminAction($account) {

        $usr = $this->get('security.token_storage')->getToken()->getUser();

        $quizAuthorization = $usr->getDepartmentAuthorization()
                ->getDepartmentInfo()
                ->getQuizAuthorizationCollection();
        $quizzes = [];

        foreach ($quizAuthorization as $quiz) {
            array_push($quizzes, $quiz->getQuiz());
        }

        foreach ($usr->getAccountInfo()->getQuiz() as $quiz) {
            if (array_search($quiz, $quizzes) === FALSE) {
                array_push($quizzes, $quiz);
            }
        }

        $quizAuthorization = $usr->getDepartmentAuthorization()
                ->getDepartmentInfo()
                ->getQuizAuthorizationCollection();

        return $this->render('quiz/index_admin.html.twig', array(
                    'quizzes' => $quizzes,
                    'account' => $account,
        ));
    }

    /**
     * Lists all quiz entities.
     *
     * @Route("/results/{id}", name="results_index")
     * @Method("GET")
     */
    public function resultsAction($account, $id) {

        $em = $this->getDoctrine()->getManager();
        $quizzes = $em->getRepository('AppBundle:Quiz')->findAll();

        return $this->render('quiz/index.html.twig', array(
                    'quizzes' => $quizzes,
                    'account' => $account,
        ));
    }

    /**
     * Creates a new quiz entity.
     *
     * @Route("/new", name="quiz_new")
     * @Security("has_role('ROLE_ADMIN')")
     * @Method({"GET", "POST"})
     */
    public function newAction(Request $request, $account) {

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        if (!$usr->getAccountInfo()->validateAccount($account)) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }
        if (!$usr->getAccountInfo()->getCanCreateQuiz()) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }
        $em = $this->getDoctrine()->getManager();

        $departments = array();
        if ($usr->isGod() && $usr->getAccountInfo()->hasRole('IS_GOD')) {
            $departments = $em->getRepository('AppBundle:DepartmentInfo')
                    ->getAllParentsDepartments();
        } elseif ($usr->getAccountInfo()->hasRole('IS_PROVIDER') &&
                $usr->getDepartmentInfo()->isAccountDepartment()) {
            array_push($departments, $usr->getdepartmentInfo());
            foreach ($usr->getAccountInfo()->getChildrenCollection() as $accountChild) {
                array_push($departments, $em->getRepository('AppBundle:DepartmentInfo')
                                ->getAccountDepartment($accountChild));
            }
        } else {
            array_push($departments, $usr->getDepartmentInfo());
        }

        $accountInfos = NULL;
        if ($usr->getAccountInfo()->hasRole('IS_GOD')) {
            $accountInfos = $em->getRepository('AppBundle:AccountInfo')->findAll();
        }

        if ($usr->getAccountInfo()->hasRole('IS_PROVIDER')) {
            $accountInfos = $usr->getAccountInfo()->getChildrenCollection();
        }

        if (!isset($departments)) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        return $this->render('quiz/new.html.twig', array(
                    'account' => $account,
                    'departments' => $departments,
                    'accountInfos' => $accountInfos,
        ));
    }

    /**
     * Ajax : Creates a new quiz entity.
     * 
     * @Route("/addquiz", name="quiz_add")
     * @Security("has_role('ROLE_ADMIN')")
     * @Method("POST")
     */
    public function addQuizAction(Request $request, $account) {

        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        $em = $this->getDoctrine()->getManager();
        if (!$usr->getAccountInfo()->validateAccount($account) ||
                !$usr->getAccountInfo()->getCanCreateQuiz()) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        $requestContent = json_decode($request->getContent());
        $quizType = $em->getRepository('AppBundle:QuizType')
                ->findOneByName($requestContent->quizType);
        if (!$quizType) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        $quizConflict = $em->getRepository('AppBundle:Quiz')
                ->findByQuizId($requestContent->quizId);
        if ($quizConflict) {
            return new JsonResponse(array('message' => 'conflict'), 400);
        }
        $quiz = new Quiz();
        $quiz->setQuizType($quizType)
                ->setAccountInfo($usr->getAccountInfo())
                ->mapPostData($requestContent);

        $em = $this->getDoctrine()->getManager();
        $em->persist($quiz);
        $em->flush();

        $quizAccount = new QuizAccount();
        $quizAccount->setAccountInfo($usr->getAccountInfo())
                ->setQuiz($quiz);
        $em = $this->getDoctrine()->getManager();
        $em->persist($quizAccount);
        $em->flush();

        if (!empty($requestContent->accounts)) {

            foreach ($requestContent->accounts as $accountId) {
                $accountInfo = $em->getRepository('AppBundle:AccountInfo')
                        ->find(intval($accountId));
                if (!$accountInfo) {
                    continue;
                }

                if ($usr->getAccountInfo()->validateAccount($accountInfo->getName())) {
                    $quizAccount = new QuizAccount();
                    $quizAccount->setAccountInfo($accountInfo)
                            ->setQuiz($quiz);
                    $em = $this->getDoctrine()->getManager();
                    $em->persist($quizAccount);
                    $em->flush();
                }
            }
        }

        if (!empty($requestContent->agencies)) {

            foreach ($requestContent->agencies as $department) {
                $departmentInfo = $em->getRepository('AppBundle:DepartmentInfo')
                        ->find(intval($department));
                if (!$departmentInfo) {
                    continue;
                }
                $quizAccountVerification = $em->getRepository('AppBundle:QuizAccount')
                        ->findOneBy(array(
                    'quiz' => $quiz,
                    'accountInfo' => $departmentInfo->getAccountInfo()
                ));
                if (!$quizAccountVerification) {
                    continue;
                }
                $quizAuthorization = new QuizAuthorization();
                $quizAuthorization->setDepartmentInfo($departmentInfo)
                        ->setQuizInfo($quiz);

                $em = $this->getDoctrine()->getManager();
                $em->persist($quizAuthorization);
                $em->flush();
            }
        }

        return new JsonResponse(array('message' => 'ok'), 200);
    }
    
    /**
     * Ajax : Edot a quiz entity.
     * 
     * @Route("/{id}/editquiz", name="quiz_edit")
     * @Security("has_role('ROLE_ADMIN')")
     * @Method("POST")
     */
    public function editQuizAction(Request $request, $quiz, $account) {

        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        $em = $this->getDoctrine()->getManager();
        if (!$usr->getAccountInfo()->validateAccount($account) ||
                !$usr->getAccountInfo()->getCanCreateQuiz()) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        $requestContent = json_decode($request->getContent());
        $quizType = $em->getRepository('AppBundle:QuizType')
                ->findOneByName($requestContent->quizType);
        if (!$quizType) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        $quizConflict = $em->getRepository('AppBundle:Quiz')
                ->findByQuizId($requestContent->quizId);
        if ($quizConflict) {
            return new JsonResponse(array('message' => 'conflict'), 400);
        }
        $quiz->mergePostData($requestContent);

        $em = $this->getDoctrine()->getManager();
        $em->merge($quiz);
        $em->flush();

        return new JsonResponse(array('message' => 'ok'), 200);
    }

    /**
     * Finds and displays a quiz entity.
     *
     * @Route("/{id}", name="quiz_show")
     * @Method("GET")
     */
    public function showAction(Quiz $quiz, $account, Request $request) {

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        if (!$usr->getAccountInfo()->validateAccount($account) ||
                !$usr->getDepartmentAuthorization()->getDepartmentInfo()->hasQuiz($quiz)) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        if ($quiz->getQuizType()->getName() === 'TYPE_A' ||
                $quiz->getQuizType()->getName() === 'TYPE_B') {
            $quizData = json_decode($quiz->getQuizData());
            if (empty($request->getSession()->get('quizStartTime'))) {
                $request->getSession()->set('quizStartTime', time());
            }
            return $this->render('quiz/show.html.twig', array(
                        'quiz' => $quiz,
                        'quizData' => $quizData,
                        'account' => $account,
            ));
        }

        throw $this->createAccessDeniedException('You cannot access this page!');
    }

    /**
     * Finds and displays a quizResult entity.
     *
     * @Route("/result/{id}", name="quizresults_show")
     * @Method("GET")
     */
    public function showResultAction(Quiz $quiz, $account) {

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        $quizResult = $usr->getQuizResult($quiz);
        if (FALSE === $quizResult) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        return $this->render('quiz/showResult.html.twig', array(
                    'quiz' => $quiz,
                    'quizResult' => $quizResult,
                    'account' => $account,
        ));
    }

    /**
     * Displays a form to edit an existing quiz entity.
     *
     * @Route("/{id}/edit", name="quiz_edit")
     * @Security("has_role('ROLE_ADMIN')")
     * @Method({"GET", "POST"})
     */
    public function editAction(Request $request, Quiz $quiz, $account) {
        $usr = $this->get('security.token_storage')->getToken()->getUser();
        if (!$usr->getAccountInfo()->validateAccount($account) ||
                !$usr->getAccountInfo()->getCanCreateQuiz() ||
                !$usr->getAccountInfo()->getQuiz()->contains($quiz) ||
                $usr->getAccountInfo() !== $quiz->getAccountInfo()) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }
        $em = $this->getDoctrine()->getManager();
        $deleteForm = $this->createDeleteForm($quiz, $account);

        $goodAnswers = explode("|", $quiz->getAnswerJson());
        for ($j = 0; $j < count($goodAnswers); $j++) {
            $goodAnswers[$j] = explode(";", $goodAnswers[$j]);
            for ($m = 0; $m < count($goodAnswers[$j]); $m++) {
                $goodAnswers[$j][$m] = explode(",", $goodAnswers[$j][$m]);
            }
        }

        $accountInfos = NULL;
        if ($usr->getAccountInfo()->hasRole('IS_GOD')) {
            $accountInfos = $em->getRepository('AppBundle:AccountInfo')->findAll();
        }

        if ($usr->getAccountInfo()->hasRole('IS_PROVIDER')) {
            $accountInfos = $usr->getAccountInfo()->getChildrenCollection();
        }

        if (!empty($request->request->get('edit_quiz_authorization'))) {
            if ($request->request->get('quiz_department') === NULL) {
                $this->deleteQuizAuthorization($departments, $quiz);
            } else {
                $this->manageQuizAuthorization($departments, $quiz, $request->request->get('quiz_department'));
            }
        }
        if (!empty($request->request->get('edit_quiz_account'))) {
            if ($request->request->get('quiz_account') === NULL) {
                $this->deleteQuizAccount($accountInfos, $quiz);
            } else {
                $this->manageQuizAccount($accountInfos, $quiz, $request->request->get('quiz_account'));
            }
        }

        return $this->render('quiz/edit.html.twig', array(
                    'quiz' => $quiz,
                    'account' => $account,
                    'delete_form' => $deleteForm->createView(),
                    'data' => json_decode($quiz->getQuizData()),
                    'goodAnswers' => $goodAnswers,
                    'accountInfos' => $accountInfos,
        ));
    }

    /**
     * Displays a form to edit an existing quiz entity.
     *
     * @Route("/{id}/authorization", name="quiz_authorization")
     * @Security("has_role('ROLE_ADMIN')")
     * @Method({"GET", "POST"})
     */
    public function gestionGroupsAction(Request $request, Quiz $quiz, $account) {

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        if (!$usr->getAccountInfo()->validateAccount($account) ||
                !$usr->getAccountInfo()->getCanCreateQuiz() ||
                !$usr->getAccountInfo()->getQuiz()->contains($quiz) ||
                $usr->getAccountInfo() !== $quiz->getAccountInfo()) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        $em = $this->getDoctrine()->getManager();
        $departments = array();
        if ($usr->isGod() && $usr->getAccountInfo()->hasRole('IS_GOD')) {
            $departments = $em->getRepository('AppBundle:DepartmentInfo')
                    ->getAllParentsDepartments();
        } elseif ($usr->getAccountInfo()->hasRole('IS_PROVIDER') &&
                $usr->getDepartmentInfo()->isAccountDepartment()) {
            array_push($departments, $usr->getdepartmentInfo());
            foreach ($usr->getAccountInfo()->getChildrenCollection() as $accountChild) {
                array_push($departments, $em->getRepository('AppBundle:DepartmentInfo')
                                ->getAccountDepartment($accountChild));
            }
        } else {
            array_push($departments, $usr->getDepartmentInfo());
        }

        if (!isset($departments)) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        if (!empty($request->request->get('edit_quiz_authorization'))) {
            if ($request->request->get('quiz_department') === NULL) {
                $this->deleteQuizAuthorization($departments, $quiz);
            } else {
                $this->manageQuizAuthorization($departments, $quiz, $request->request->get('quiz_department'));
            }
        }

        return $this->render('quiz/authorization.html.twig', array(
                    'quiz' => $quiz,
                    'account' => $account,
                    'departments' => $departments,
                    'data' => json_decode($quiz->getQuizData()),
        ));
    }

    /**
     * Deletes a quiz entity.
     *
     * @Route("/{id}", name="quiz_delete")
     * @Method("DELETE")
     */
    public function deleteAction(Request $request, Quiz $quiz, $account) {
        $form = $this->createDeleteForm($quiz, $account);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->remove($quiz);
            $em->flush();
        }

        return $this->redirectToRoute('quiz_index', array('account' => $account));
    }

    /**
     * Creates a form to delete a quiz entity.
     *
     * @param Quiz $quiz The quiz entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm(Quiz $quiz, $account) {
        return $this->createFormBuilder()
                        ->setAction($this->generateUrl('quiz_delete', array('id' => $quiz->getId(), 'account' => $account)))
                        ->setMethod('DELETE')
                        ->getForm()
        ;
    }

    private function manageQuizAuthorization($departments, $quiz, $quizDepartment) {
        $em = $this->getDoctrine()->getManager();
        foreach ($departments as $department) {
            if (array_search($department->getId(), $quizDepartment) !== FALSE) {
                $quizAuthorization = $em->getRepository('AppBundle:QuizAuthorization')
                        ->findOneBy(array(
                    'quiz' => $quiz,
                    'departmentInfo' => $department
                ));
                if (!$quizAuthorization) {
                    $newQuizAuthorization = new QuizAuthorization();
                    $newQuizAuthorization->setDepartmentInfo($department)
                            ->setQuiz($quiz)
                            ->setStartDate(NULL)
                            ->setEndDate(NULL);
                    $em->persist($newQuizAuthorization);
                    $em->flush();
                }
            } else {
                $quizAuthorization = $em->getRepository('AppBundle:QuizAuthorization')
                        ->findOneBy(array(
                    'quiz' => $quiz,
                    'departmentInfo' => $department
                ));
                if ($quizAuthorization) {
                    $em->remove($quizAuthorization);
                    $em->flush();
                }
            }
            if ($department->getChildrenCollection()->count() > 0) {
                $this->manageQuizAuthorization($department->getChildrenCollection(), $quiz, $quizDepartment);
            }
        }
    }

    private function deleteQuizAuthorization($departments, $quiz) {
        $em = $this->getDoctrine()->getManager();
        foreach ($departments as $department) {

            $quizAuthorization = $em->getRepository('AppBundle:QuizAuthorization')
                    ->findOneBy(array(
                'quiz' => $quiz,
                'departmentInfo' => $department
            ));
            if ($quizAuthorization) {
                $em->remove($quizAuthorization);
                $em->flush();
            }
            if ($department->getChildrenCollection()->count() > 0) {
                $this->deleteQuizAuthorization($department->getChildrenCollection(), $quiz);
            }
        }
    }
    
    private function manageQuizAccount($accounts, $quiz, $quizAccountArray) {
        $em = $this->getDoctrine()->getManager();
        foreach ($accounts as $account) {
            if (array_search($account->getId(), $quizAccountArray) !== FALSE) {
                $quizAccountConflict = $em->getRepository('AppBundle:QuizAccount')
                        ->findOneBy(array(
                    'quiz' => $quiz,
                    'accountInfo' => $account
                ));
                if (!$quizAccountConflict) {
                    $newQuizAuthorization = new QuizAccount();
                    $newQuizAuthorization->setAccountInfo($account)
                            ->setQuiz($quiz);
                    $em->persist($newQuizAuthorization);
                    $em->flush();
                }
            } else {
                $quizAccount = $em->getRepository('AppBundle:QuizAccount')
                        ->findOneBy(array(
                    'quiz' => $quiz,
                    'accountInfo' => $account
                ));
                if ($quizAccount && $quiz->getAccountInfo() != $account) {
                    $em->remove($quizAccount);
                    $em->flush();
                }
            }
        }
    }

    private function deleteQuizAccount($accounts, $quiz) {
        $em = $this->getDoctrine()->getManager();
        foreach ($accounts as $account) {

            $quizAccount = $em->getRepository('AppBundle:QuizAccount')
                    ->findOneBy(array(
                'quiz' => $quiz,
                'accountInfo' => $account
            ));
            if ($quizAccount && $account != $quiz->getAccountInfo()) {
                $em->remove($quizAccount);
                $em->flush();
            }
        }
    }

}
