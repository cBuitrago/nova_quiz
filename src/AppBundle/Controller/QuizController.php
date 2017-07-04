<?php

namespace AppBundle\Controller;

use AppBundle\Entity\Quiz;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

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
        $quizzes = $usr->getDepartmentAuthorization()->getDepartmentInfo()->getQuizAuthorizationCollection();

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
        $em = $this->getDoctrine()->getManager();

        $quiz = new Quiz();
        $form = $this->createForm('AppBundle\Form\QuizType', $quiz);
        $form->handleRequest($request);

        /*if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($quiz);
            $em->flush();

            return $this->redirectToRoute('quiz_show', array(
                        'id' => $quiz->getId(),
                        'account' => $account)
            );
        }*/

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

        return $this->render('quiz/new.html.twig', array(
                    'quiz' => $quiz,
                    'form' => $form->createView(),
                    'account' => $account,
                    'departments' => $departments,
        ));
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
        $deleteForm = $this->createDeleteForm($quiz, $account);
        //$editForm = $this->createForm('AppBundle\Form\QuizType', $quiz);
        //$editForm->handleRequest($request);
        //if ($editForm->isSubmitted() && $editForm->isValid()) {
        //$this->getDoctrine()->getManager()->flush();
        //return $this->redirectToRoute('quiz_edit', array('id' => $quiz->getId(), 'account' => $account));
        //}

        return $this->render('quiz/edit.html.twig', array(
                    'quiz' => $quiz,
                    'account' => $account,
                    'delete_form' => $deleteForm->createView(),
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

}
