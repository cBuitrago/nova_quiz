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

/**
 * Userinfo controller.
 *
 * @Route("{account}/user")
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

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        if (!$usr->getAccountInfo()->validateAccount($account)) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        if ($usr->getForcePsw()) {
            return $this->redirectToRoute('user_change_psw', array('account' => $account));
        }

        $userInfo = $this->get('security.token_storage')->getToken()->getUser();
        $deleteForm = $this->createDeleteForm($userInfo, $account);
        $editForm = $this->createForm('AppBundle\Form\UserInfoType', $userInfo);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted() && $editForm->isValid()) {
            $this->getDoctrine()->getManager()->flush();

            return $this->redirectToRoute('user_edit', array('id' => $userInfo->getId(), 'account' => $account));
        }

        return $this->render('userinfo/edit.html.twig', array(
                    'userInfo' => $userInfo,
                    'edit_form' => $editForm->createView(),
                    'delete_form' => $deleteForm->createView(),
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

        $deleteForm = $this->createDeleteForm($userInfo, $account);
        $editForm = $this->createForm('AppBundle\Form\UserInfoPswType', $userInfo);
        $editForm->handleRequest($request);

        if ($editForm->isSubmitted() && $editForm->isValid()) {
            $this->getDoctrine()->getManager()->flush();

            return $this->redirectToRoute('user_edit', array('id' => $userInfo->getId(), 'account' => $account));
        }

        return $this->render('userinfo/edit.html.twig', array(
                    'userInfo' => $userInfo,
                    'edit_form' => $editForm->createView(),
                    'delete_form' => $deleteForm->createView(),
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
        $users = explode(',', $data->users);
        if ($notification) {
            $pattern = '/^.{2,30}@.{2,30}\.[a-zA-Z]{2,6}$/';
            foreach ($users as $user) {
                if (intval(preg_match($pattern, trim($user))) < 1) {
                    return new JsonResponse(array('message' => 'false'), 400);
                }
            }
        }

        $force = TRUE;
        $roles = array('ROLE_USER');
        $departmentInfo = $this->getDoctrine()
                ->getRepository('AppBundle:DepartmentInfo')
                ->find(intval($request->request->get('user_department')));
        if (!$departmentInfo) {
            return new JsonResponse(array('message' => 'false'), 400);
        }
        $reponse_users = [];
        $reponse_users['created'] = [];
        $reponse_users['failed'] = [];
        foreach ($users as $user) {

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
            $encoder = $this->container->get('security.password_encoder');
            if ($notification) {
                $encoded = $encoder->encodePassword("");
                $userInfo->setPassword($encoded)
                        ->setUsername($user)
                        ->setName('')
                        ->setFirstName('')
                        ->setEmail($user)
                        ->setIsActive(FALSE)
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
                
                //SEND MAIL
                
            } else {
                if ($pswRandom) {
                    $tmpPsw = $this->createRandPsw();
                    $encoded = $encoder->encodePassword($tmpPsw);
                    
                } else {
                    $encoded = $encoder->encodePassword($data->password);
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

                $userInfoConflictUsername = $this->getDoctrine()
                        ->getRepository('AppBundle:UserInfo')
                        ->findByUsername($request->request->get('username'));
                $userInfoConflictEmail = $this->getDoctrine()
                        ->getRepository('AppBundle:UserInfo')
                        ->findByEmail($request->request->get('email'));
                if ($userInfoConflictUsername || $userInfoConflictEmail) {
                    throw new ConflictHttpException('User Already Exists!');
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
            }
        }
        return new JsonResponse(array('message' => 'true'), 201);
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

}
