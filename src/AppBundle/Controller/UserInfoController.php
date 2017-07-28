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
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Userinfo controller.
 *
 * @Route("{account}/{_locale}/user", 
 *      defaults={"_locale":"fr"},
 *      requirements={
 *          "_locale": "fr|en|es"
 *      })
 */
class UserInfoController extends Controller {

    /**
     * Lists all userInfo entities.
     *
     * @Route("/", name="user_index")
     * @Security("has_role('ROLE_ADMIN')")
     * @Method("GET")
     */
    public function indexAction($account) {

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        if (!$usr->getAccountInfo()->validateAccount($account)) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }
        if ($usr->getForcePsw()) {
            return $this->redirectToRoute('user_change_psw', array('account' => $account));
        }

        $em = $this->getDoctrine()->getManager();
        if ($this->get('security.authorization_checker')->isGranted('ROLE_GOD') &&
                $usr->getAccountInfo()->hasRole('IS_GOD')) {
            $userInfos = $em->getRepository('AppBundle:UserInfo')->findAll();
        }

        if ($usr->getAccountInfo()->hasRole('IS_PROVIDER')) {
            $userInfos = $em->getRepository('AppBundle:UserInfo')
                    ->allUsersByProvider($usr->getAccountInfo());
        }

        if ($usr->getAccountInfo()->hasRole('IS_USUAL')) {
            $userInfos = $em->getRepository('AppBundle:UserInfo')
                    ->findByAccountInfo($usr->getAccountInfo());
        }

        if (empty($userInfos)) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        return $this->render('userinfo/index.html.twig', array(
                    'userInfos' => $userInfos,
                    'account' => $account,
        ));
    }

    /**
     * Lists all userInfo entities.
     *
     * @Route("/profile", name="user_profile")
     * @Security("has_role('ROLE_USER')")
     * @Method({"GET", "POST"})
     */
    public function profileAction(Request $request, $account) {

        $userInfo = $this->get('security.token_storage')->getToken()->getUser();
        if (!$userInfo->getAccountInfo()->validateAccount($account)) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        if (count($request->request) > 0) {
            $encoder = $this->container->get('security.password_encoder');
            if (trim($request->request->get('n1password')) !== trim($request->request->get('n2password'))) {
                return $this->render('security/password.html.twig', array(
                ));
            }
            $newEncoded = $encoder->encodePassword($userInfo, trim($request->request->get('n1password')));
            $userInfo->setName($request->request->get('name'))
                    ->setFirstName($request->request->get('firstname'))
                    ->setPassword($newEncoded)
                    ->setForcePsw(FALSE);
            $em = $this->getDoctrine()->getManager();
            $em->merge($userInfo);
            $em->flush();

            return $this->redirectToRoute("quiz_index", array('account' => $account));
        }

        return $this->render('userinfo/profile.html.twig', array(
                    'account' => $account,
        ));
    }

    /**
     * Lists all userInfo entities.
     *
     * @Route("/change_password", name="user_change_psw")
     * @Security("has_role('ROLE_USER')")
     * @Method({"GET", "POST"})
     */
    public function changePswAction(Request $request, $account) {

        $userInfo = $this->get('security.token_storage')->getToken()->getUser();
        if (!$userInfo->getAccountInfo()->validateAccount($account)) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        if (count($request->request) > 0) {
            $encoder = $this->container->get('security.password_encoder');
            if (trim($request->request->get('n1password')) !== trim($request->request->get('n2password'))) {
                return $this->render('security/password.html.twig', array(
                ));
            }
            $newEncoded = $encoder->encodePassword($userInfo, trim($request->request->get('n1password')));
            $userInfo->setName($request->request->get('name'))
                    ->setFirstName($request->request->get('firstname'))
                    ->setPassword($newEncoded)
                    ->setForcePsw(FALSE);
            $em = $this->getDoctrine()->getManager();
            $em->merge($userInfo);
            $em->flush();

            return $this->redirectToRoute("quiz_index", array('account' => $account));
        }

        return $this->render('userinfo/password.html.twig', array(
                    'account' => $account,
        ));
    }

    /**
     * Creates a new userInfo entity.
     *
     * @Route("/new", name="user_new")
     * @Security("has_role('ROLE_ADMIN')")
     * @Method({"GET", "POST"})
     */
    public function newAction(Request $request, $account) {

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        if (!$usr->getAccountInfo()->validateAccount($account)) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }
        $em = $this->getDoctrine()->getManager();

        if (count($request->request) > 0) {

            $force = (NULL !== $request->request->get('forcePsw')) ? TRUE : FALSE;
            $roles = array('ROLE_USER');
            if (NULL !== $request->request->get('forcePsw')) {
                array_push($roles, 'ROLE_ADMIN');
            }

            $departmentInfo = $this->getDoctrine()
                    ->getRepository('AppBundle:DepartmentInfo')
                    ->find(intval($request->request->get('user_department')));
            if (!$departmentInfo) {
                throw $this->createNotFoundException('Department Not Found!');
            }
            $userInfo = new UserInfo();
            $encoder = $this->container->get('security.password_encoder');
            $encoded = $encoder->encodePassword($userInfo, $request->request->get('password'));

            $userInfoConflictUsername = $this->getDoctrine()
                    ->getRepository('AppBundle:UserInfo')
                    ->findByUsername($request->request->get('username'));
            $userInfoConflictEmail = $this->getDoctrine()
                    ->getRepository('AppBundle:UserInfo')
                    ->findByEmail($request->request->get('email'));
            if ($userInfoConflictUsername || $userInfoConflictEmail) {
                throw new ConflictHttpException('User Already Exists!');
            }

            $userInfo->setPassword($encoded)
                    ->setUsername($request->request->get('username'))
                    ->setName($request->request->get('name'))
                    ->setFirstName($request->request->get('firstname'))
                    ->setEmail($request->request->get('email'))
                    ->setIsActive(TRUE)
                    ->setAccountInfo($departmentInfo->getAccountInfo())
                    ->setForcePsw($force)
                    ->setRoles($roles);

            $em->persist($userInfo);
            $em->flush();

            $departmentAuthorization = new DepartmentAuthorization();
            $departmentAuthorization->setUserInfo($userInfo)
                    ->setDepartmentInfo($departmentInfo)
                    ->setIsRecursive(TRUE);

            $em->persist($departmentAuthorization);
            $userInfo->setDepartmentAuthorization($departmentAuthorization);
            $em->flush();

            return $this->redirectToRoute('user_show', array('id' => $userInfo->getId(), 'account' => $account));
        }

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

        return $this->render('userinfo/new.html.twig', array(
                    'account' => $account,
                    'user' => $usr,
                    'departments' => $departments
        ));
    }

    /**
     * Creates a new userInfo List entity.
     *
     * @Route("/newList", name="user_new_list")
     * @Security("has_role('ROLE_ADMIN')")
     * @Method({"GET", "POST"})
     */
    public function newListAction(Request $request, $account) {

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        if (!$usr->getAccountInfo()->validateAccount($account)) {
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

        return $this->render('userinfo/newList.html.twig', array(
                    'account' => $account,
                    'user' => $usr,
                    'departments' => $departments
        ));
    }

    /**
     * Creates a new userInfo List entity.
     *
     * @Route("/newListAjax", name="user_new_list_ajax")
     * @Security("has_role('ROLE_ADMIN')")
     * @Method({"GET", "POST"})
     */
    public function newListAjaxAction(Request $request, $account) {

        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        if (!$usr->getAccountInfo()->validateAccount($account)) {
            return new JsonResponse(array('message' => 'false'), 400);
        }

        $em = $this->getDoctrine()->getManager();
        $data = json_decode($request->getContent());
        $notification = $data->notification;
        $users = $data->users;

        if ($notification) {
            $pattern = '/^.{2,30}@.{2,30}\.[a-zA-Z]{2,6}$/';
            foreach ($users as $user) {
                if (intval(preg_match($pattern, trim($user))) < 1) {
                    return new JsonResponse(array('message' => 'false'), 400);
                }
            }
        }

        $pswRandom = $data->rdm_psw ? true : false;
        $force = TRUE;
        $roles = array('ROLE_USER');
        $departmentInfo = $this->getDoctrine()
                ->getRepository('AppBundle:DepartmentInfo')
                ->find(intval($data->department));
        if (!$departmentInfo) {
            return new JsonResponse(array('message' => 'false'), 400);
        }
        $reponse_users = [];
        $reponse_users['created'] = [];
        $reponse_users['failed'] = [];
        $reponse_users['department'] = $departmentInfo->getName();
        $encoder = $this->container->get('security.password_encoder');
        foreach ($users as $user) {
            $user = trim($user);
            $userInfoConflictUsername = $this->getDoctrine()
                    ->getRepository('AppBundle:UserInfo')
                    ->findByUsername($user);
            $userInfoConflictEmail = $this->getDoctrine()
                    ->getRepository('AppBundle:UserInfo')
                    ->findByEmail($user);
            if ($userInfoConflictUsername || $userInfoConflictEmail) {
                array_push($reponse_users['failed'], $user);
                continue;
            }

            $userInfo = new UserInfo();
            if ($notification) {
                if ($pswRandom) {
                    $tmpPsw = $this->createRandPsw();
                    $encoded = $encoder->encodePassword($userInfo, $tmpPsw);
                } else {
                    $encoded = $encoder->encodePassword($userInfo, $data->password);
                }

                do {
                    $userKey = bin2hex(openssl_random_pseudo_bytes(16));
                    $userInfoConflictKey = $this->getDoctrine()
                            ->getRepository('AppBundle:UserInfo')
                            ->findByActivationKey($userKey);
                } while ($userInfoConflictKey);

                $userInfo->setPassword($encoded)
                        ->setUsername($user)
                        ->setName('')
                        ->setFirstName('')
                        ->setEmail($user)
                        ->setIsActive(FALSE)
                        ->setAccountInfo($departmentInfo->getAccountInfo())
                        ->setForcePsw($force)
                        ->setRoles($roles)
                        ->setActivationKey($userKey);
                $em->persist($userInfo);
                $em->flush();

                $departmentAuthorization = new DepartmentAuthorization();
                $departmentAuthorization->setUserInfo($userInfo)
                        ->setDepartmentInfo($departmentInfo)
                        ->setIsRecursive(TRUE);
                $em->persist($departmentAuthorization);
                $userInfo->setDepartmentAuthorization($departmentAuthorization);
                $em->flush();

                //SEND MAIL
                $message = new \Swift_Message('Registration Email');
                $message->setFrom('dev.nova2017@gmail.com')
                        ->setTo($userInfo->getEmail())
                        ->setBody(
                                $this->renderView(
                                        'emails/registration.html.twig', array(
                                    'userInfo' => $userInfo,
                                    'psw' => $tmpPsw
                                        )
                                ), 'text/html');
                $this->get('mailer')->send($message);
                array_push($reponse_users['created'], $userInfo->getUsername());
            } else {
                if ($pswRandom) {
                    $tmpPsw = $this->createRandPsw();
                    $encoded = $encoder->encodePassword($userInfo, $tmpPsw);
                } else {
                    $encoded = $encoder->encodePassword($userInfo, $data->password);
                }

                $userInfo->setPassword($encoded)
                        ->setUsername($user)
                        ->setName('')
                        ->setFirstName('')
                        ->setEmail(NULL)
                        ->setIsActive(TRUE)
                        ->setAccountInfo($departmentInfo->getAccountInfo())
                        ->setForcePsw($force)
                        ->setRoles($roles);
                $userInfoConflictUsername = $this->getDoctrine()
                        ->getRepository('AppBundle:UserInfo')
                        ->findByUsername($user);
                $userInfoConflictEmail = $this->getDoctrine()
                        ->getRepository('AppBundle:UserInfo')
                        ->findByEmail($user);
                if ($userInfoConflictUsername || $userInfoConflictEmail) {
                    array_push($reponse_users['failed'], $user);
                    continue;
                }

                $em->persist($userInfo);
                $em->flush();
                $departmentAuthorization = new DepartmentAuthorization();
                $departmentAuthorization->setUserInfo($userInfo)
                        ->setDepartmentInfo($departmentInfo)
                        ->setIsRecursive(TRUE);

                $em->persist($departmentAuthorization);
                $userInfo->setDepartmentAuthorization($departmentAuthorization);
                $em->flush();

                array_push($reponse_users['created'], array($userInfo->getUsername(), $tmpPsw));
            }
        }

        return new JsonResponse(array('message' => $reponse_users), 201);
    }

    /**
     * Finds and displays a userInfo entity.
     *
     * @Route("/{id}", name="user_show")
     * @Security("has_role('ROLE_ADMIN')")
     * @Method("GET")
     */
    public function showAction(UserInfo $userInfo, $account) {
        $deleteForm = $this->createDeleteForm($userInfo, $account);

        return $this->render('userinfo/show.html.twig', array(
                    'userInfo' => $userInfo,
                    'delete_form' => $deleteForm->createView(),
                    'account' => $account,
        ));
    }

    /**
     * Displays a form to edit an existing userInfo entity.
     *
     * @Route("/{id}/edit", name="user_edit")
     * @Method({"GET", "POST"})
     */
    public function editAction(Request $request, UserInfo $userInfo, $account) {

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        if (!$usr->getAccountInfo()->validateAccount($account)) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        if (!$usr->isRecursiveUser($userInfo)) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        $deleteForm = $this->createDeleteForm($userInfo, $account);
        if (count($request->request) > 0) {

            $force = (NULL !== $request->request->get('forcePsw')) ? TRUE : FALSE;
            $isActive = (NULL !== $request->request->get('isActive')) ? TRUE : FALSE;

            $departmentInfo = $this->getDoctrine()
                    ->getRepository('AppBundle:DepartmentInfo')
                    ->find(intval($request->request->get('user_department')));
            if (!$departmentInfo) {
                throw $this->createNotFoundException('Department Not Found!');
            }

            $userInfoConflictUsername = $this->getDoctrine()
                    ->getRepository('AppBundle:UserInfo')
                    ->findOneBy(array('username' => $request->request->get('username')));
            $userInfoConflictEmail = $this->getDoctrine()
                    ->getRepository('AppBundle:UserInfo')
                    ->findOneBy(array('email' => $request->request->get('email')));
            if (($userInfoConflictUsername && $userInfoConflictUsername !== $userInfo) ||
                    ($userInfoConflictEmail && $userInfoConflictEmail !== $userInfo)) {
                throw new ConflictHttpException('User Already Exists!');
            }

            if (NULL !== $request->request->get('role_admin')) {
                $userInfo->addRole('ROLE_ADMIN');
            } else {
                $userInfo->removeRole('ROLE_ADMIN');
            }
            $userInfo->setUsername($request->request->get('username'))
                    ->setName($request->request->get('name'))
                    ->setFirstName($request->request->get('firstname'))
                    ->setEmail($request->request->get('email'))
                    ->setIsActive($isActive)
                    ->setForcePsw($force);
            $em = $this->getDoctrine()->getManager();
            if (!$userInfo->getDepartmentAuthorization()->isSameDepartment($departmentInfo)) {
                $userInfo->getDepartmentAuthorization()->setDepartmentInfo($departmentInfo)
                        ->setIsRecursive(true);
                $em->merge($userInfo->getDepartmentAuthorization());
                $em->flush();
            }


            $em->merge($userInfo);
            $em->flush();

            return $this->redirectToRoute('user_show', array('id' => $userInfo->getId(), 'account' => $account));
        }

        $departments = array();
        if (($usr->isGod() && $usr->getAccountInfo()->hasRole('IS_GOD')) ||
                ($usr->getAccountInfo()->hasRole('IS_PROVIDER') &&
                $usr->getDepartmentInfo()->isAccountDepartment())) {
            array_push($departments, $this->getDoctrine()
                            ->getRepository('AppBundle:DepartmentInfo')
                            ->getAccountDepartment($userInfo->getAccountInfo()));
        } else {
            array_push($departments, $usr->getDepartmentInfo());
        }

        return $this->render('userinfo/edit.html.twig', array(
                    'userInfo' => $userInfo,
                    'delete_form' => $deleteForm->createView(),
                    'account' => $account,
                    'departments' => $departments,
        ));
    }

    /**
     * Deletes a userInfo entity.
     *
     * @Route("/{id}", name="user_delete")
     * @Security("has_role('ROLE_ADMIN')")
     * @Method("DELETE")
     */
    public function deleteAction(Request $request, UserInfo $userInfo, $account) {
        $form = $this->createDeleteForm($userInfo, $account);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->remove($userInfo);
            $em->flush();
        }

        return $this->redirectToRoute('user_index', array('account' => $account));
    }

    /**
     * Creates a form to delete a userInfo entity.
     * @param UserInfo $userInfo The userInfo entity
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm(UserInfo $userInfo, $account) {
        return $this->createFormBuilder()
                        ->setAction($this->generateUrl('user_delete', array('id' => $userInfo->getId(), 'account' => $account)))
                        ->setMethod('DELETE')
                        ->getForm()
        ;
    }

    public function createRandPsw() {

        $selectRandom = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%^?><*()A";
        $reponse = '';

        for ($i = 0; $i < 7; $i++) {
            $reponse .= substr($selectRandom, rand(0, 73), 1);
        }

        return $reponse;
    }

}
