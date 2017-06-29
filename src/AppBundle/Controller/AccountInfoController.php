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

/**
 * Accountinfo controller.
 * @Security("has_role('ROLE_ADMIN')")
 * @Route("{account}/account")
 */
class AccountInfoController extends Controller {

    /**
     * Lists all accountInfo entities.
     * 
     * @Route("/", name="accountinfo_index")
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

        return $this->render('accountinfo/index.html.twig', array(
                    'accountInfos' => $accountInfos,
                    'account' => $account,
        ));
    }

    /**
     * Creates a new accountInfo entity.
     *
     * @Route("/new", name="accountinfo_new")
     * @Method({"GET", "POST"})
     */
    public function newAction(Request $request, $account) {

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        if ($usr->getAccountInfo()->hasRole('IS_USUAL')) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        if (count($request->request) > 0) {

            $accountInfoConflict = $this->getDoctrine()
                    ->getRepository('AppBundle:AccountInfo')
                    ->findOneByName($request->request->get('name'));
            if ($accountInfoConflict) {
                throw new ConflictHttpException('User Already Exists!');
            }

            $accountInfo = new Accountinfo();
            $createQuiz = (NULL !== $request->request->get('can_create_quiz')) ? TRUE : FALSE;
            $emailAsUsername = (NULL !== $request->request->get('email_as_username')) ? TRUE : FALSE;

            $accountInfo->setName($request->request->get('name'))
                    ->setDescription($request->request->get('description'))
                    ->setSettingsDefault()
                    ->setCanCreateQuiz($createQuiz)
                    ->setEmailAsUsername($emailAsUsername)
                    ->setParent($usr->getAccountInfo());
            if ($this->get('security.authorization_checker')->isGranted('ROLE_GOD') &&
                    $usr->getAccountInfo()->hasRole('IS_GOD')) {
                $accountInfo->setRole($request->request->get('account_role'));
            } else {
                $accountInfo->setRole('IS_USUAL');
            }

            $em = $this->getDoctrine()->getManager();
            $em->persist($accountInfo);
            $em->flush();

            $departmentInfo = new DepartmentInfo();
            $departmentInfo->setName($accountInfo->getName())
                    ->setDescription('IS_ACCOUNT_DEPARTMENT')
                    ->setAccountInfo($accountInfo)
                    ->setParent(NULL);
            $em->persist($departmentInfo);
            $em->flush();

            return $this->redirectToRoute('user_accountinfo_new', array(
                        'account' => $account,
                        'id' => $accountInfo->getId(),
            ));
        }

        return $this->render('accountinfo/new.html.twig', array(
                    'account' => $account,
        ));
    }

    /**
     * Creates a new accountInfo entity.
     *
     * @Route("/new/{id}/user", name="user_accountinfo_new")
     * @Method({"GET", "POST"})
     */
    public function newUserAccountAction(Request $request, AccountInfo $accountInfo, $account = '') {

        $pattern = '/\/account\/new?/';
        $usr = $this->get('security.token_storage')->getToken()->getUser();
        if (!preg_match($pattern, $request->headers->get('referer')) ||
                $usr->getAccountInfo()->hasRole('IS_USUAL') ||
                !$usr->getAccountInfo()->validateAccount($accountInfo->getName())) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        if (count($request->request) > 0) {
            $force = TRUE;
            $roles = array('ROLE_USER', 'ROLE_ADMIN');

            $departmentInfo = $this->getDoctrine()
                    ->getRepository('AppBundle:DepartmentInfo')
                    ->findOneBy(array('name' => $accountInfo->getName(),
                'accountInfo' => $accountInfo,
                'description' => 'IS_ACCOUNT_DEPARTMENT'));
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
                    ->setAccountInfo($accountInfo)
                    ->setForcePsw($force)
                    ->setRoles($roles);

            $em = $this->getDoctrine()->getManager();
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

        return $this->render('accountinfo/newuseradmin.html.twig', array(
                    'account' => $account,
        ));
    }

    /**
     * Finds and displays a accountInfo entity.
     *
     * @Route("/{id}", name="accountinfo_show")
     * @Method("GET")
     */
    public function showAction(AccountInfo $accountInfo, $account = '') {

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        if ($usr->getAccountInfo()->hasRole('IS_USUAL') &&
                $usr->getAccountInfo() !== $accountInfo) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        if (!$usr->getAccountInfo()->getChildrenCollection()->contains($accountInfo) &&
                $usr->getAccountInfo() !== $accountInfo &&
                !$usr->getAccountInfo()->hasRole('IS_GOD') &&
                !$this->get('security.authorization_checker')->isGranted('ROLE_GOD')) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        $deleteForm = $this->createDeleteForm($accountInfo, $account);

        return $this->render('accountinfo/show.html.twig', array(
                    'accountInfo' => $accountInfo,
                    'delete_form' => $deleteForm->createView(),
                    'account' => $account,
        ));
    }

    /**
     * Displays a form to edit an existing accountInfo entity.
     *
     * @Route("/{id}/edit", name="accountinfo_edit")
     * @Method({"GET", "POST"})
     */
    public function editAction(Request $request, AccountInfo $accountInfo, $account) {

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        if ($usr->getAccountInfo()->hasRole('IS_USUAL') &&
                $usr->getAccountInfo() !== $accountInfo &&
                !$usr->isAccountAdminUser()) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        $departmentInfo = $this->getDoctrine()
                ->getRepository('AppBundle:DepartmentInfo')
                ->findOneBy(array('name' => $accountInfo->getName(),
            'accountInfo' => $accountInfo,
            'description' => 'IS_ACCOUNT_DEPARTMENT')
        );

        if (!$departmentInfo) {
            throw $this->createNotFoundException('Department Not Found!');
        }

        if ($usr->getAccountInfo()->hasRole('IS_USUAL') &&
                $usr->getAccountInfo() !== $accountInfo) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        if (!$usr->getAccountInfo()->getChildrenCollection()->contains($accountInfo) &&
                $usr->getAccountInfo() !== $accountInfo &&
                !$usr->getAccountInfo()->hasRole('IS_GOD') &&
                !$this->get('security.authorization_checker')->isGranted('ROLE_GOD')) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }
        $deleteForm = $this->createDeleteForm($accountInfo, $account);

        if (count($request->request) > 0) {
            $em = $this->getDoctrine()->getManager();
            if ($request->request->get('name')) {
                $accountInfoConflict = $this->getDoctrine()
                        ->getRepository('AppBundle:AccountInfo')
                        ->findOneByName($request->request->get('name'));
                if ($accountInfoConflict && $accountInfoConflict !== $accountInfo) {
                    throw new ConflictHttpException('Account Already Exists!');
                }
                $accountInfo->setName($request->request->get('name'));
                $departmentAccountInfo = $this->getDoctrine()
                        ->getRepository('AppBundle:DepartmentInfo')
                        ->getAccountDepartment($accountInfo);
                $departmentAccountInfo->setName($request->request->get('name'));

                $em->merge($accountInfo);
                $em->merge($departmentAccountInfo);
                $em->flush();
            }
            if ($request->request->get('aside')) {
                $settings = json_decode($accountInfo->getSettings());
                $settings->colors->aside = $request->request->get('aside');
                $settings->colors->nav = $request->request->get('nav');
                $settings->colors->principal = $request->request->get('principal');
                $settings->colors->btn_cancel = $request->request->get('btn_cancel');
                $settings->colors->nav2 = $request->request->get('nav2');
                $accountInfo->setSettings(json_encode($settings));
                $em->merge($accountInfo);
                $em->flush();
            }

            $session = $this->get('session');
            $settingsAccountInfo = json_decode($usr->getAccountInfo()->getSettings());
            $session->set('settings', array(
                'accountAside' => $settingsAccountInfo->colors->aside,
                'accountNav' => $settingsAccountInfo->colors->nav,
                'accountPrincipal' => $settingsAccountInfo->colors->principal,
                'accountBtnCancel' => $settingsAccountInfo->colors->btn_cancel,
                'accountNav2' => $settingsAccountInfo->colors->nav2,
                'logo' => $settingsAccountInfo->logo,
            ));
        }

        if (count($request->files) > 0) {
            $file = $request->files->get('imgCompany');
            $fileName = md5(uniqid()) . '.' . $file->guessExtension();
            $file->move(
                    $this->getParameter('images_directory'), $fileName
            );
            $settings = json_decode($accountInfo->getSettings());
            $settings->logo = $fileName;
            $accountInfo->setSettings(json_encode($settings));

            $em = $this->getDoctrine()->getManager();
            $em->merge($accountInfo);
            $em->flush();
            $session = $this->get('session');
            $settingsAccountInfo = json_decode($usr->getAccountInfo()->getSettings());
            $session->set('settings', array(
                'accountAside' => $settingsAccountInfo->colors->aside,
                'accountNav' => $settingsAccountInfo->colors->nav,
                'accountPrincipal' => $settingsAccountInfo->colors->principal,
                'accountBtnCancel' => $settingsAccountInfo->colors->btn_cancel,
                'accountNav2' => $settingsAccountInfo->colors->nav2,
                'logo' => $settingsAccountInfo->logo,
            ));
        }

        $settings = json_decode($accountInfo->getSettings());

        return $this->render('accountinfo/edit.html.twig', array(
                    'accountInfo' => $accountInfo,
                    'delete_form' => $deleteForm->createView(),
                    'account' => $account,
                    'settings' => $settings,
        ));
    }

    /**
     * Deletes a accountInfo entity.
     *
     * @Route("/{id}", name="accountinfo_delete")
     * @Method("DELETE")
     */
    public function deleteAction(Request $request, AccountInfo $accountInfo, $account) {
        $usr = $this->get('security.token_storage')->getToken()->getUser();
        if ($usr->getAccountInfo()->hasRole('IS_USUAL')) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }
        $form = $this->createDeleteForm($accountInfo, $account);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->remove($accountInfo);
            $em->flush();
        }

        return $this->redirectToRoute('accountinfo_index', array('account' => $account));
    }

    /**
     * Creates a form to delete a accountInfo entity.
     *
     * @param AccountInfo $accountInfo The accountInfo entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm(AccountInfo $accountInfo, $account) {
        return $this->createFormBuilder()
                        ->setAction($this->generateUrl('accountinfo_delete', array('id' => $accountInfo->getId(), 'account' => $account)))
                        ->setMethod('DELETE')
                        ->getForm()
        ;
    }

}
