<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;

/**
 * Security controller.
 *
 * @Route("{account}")
 */
class SecurityController extends Controller {

    /**
     * @Route("/", name="login")
     */
    public function loginAction(Request $request, $account = "") {

        $em = $this->getDoctrine()->getManager();
        $accountInfo = $em->getRepository('AppBundle:AccountInfo')
                ->findOneByName($account);

        if (!$accountInfo) {
            throw $this->createNotFoundException($account . ' does not exist');
        }
        $settings = json_decode($accountInfo->getSettings());
        $session = $this->get('session'); 
        $session->set('settings', array(
            'accountAside' => $settings->colors->aside,
            'accountNav' => $settings->colors->nav,
            'accountPrincipal' => $settings->colors->principal,
            'accountBtnCancel' => $settings->colors->btn_cancel,
            'accountNav2' => $settings->colors->nav2,
            'logo' => $settings->logo,
        ));
        $authenticationUtils = $this->get('security.authentication_utils');

        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();

        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('security/login.html.twig', array(
                    'last_username' => $lastUsername,
                    'error' => $error,
                    'account' => $accountInfo->getName(),
                    'settings' => $accountInfo->getSettings(),
        ));
    }

    /**
     * @Route("/success", name="login_success")
     */
    public function successAction($account = "") {
        var_dump("jjj");
    }

    /**
     * @Route("/fail", name="login_fail")
     */
    public function failAction($account = "") {
        var_dump("ggg");
    }

    /**
     * @Route("/logout", name="logout")
     */
    public function logoutAction($account = "") {
        return $this->redirectToRoute('login', array('account' => $account));
    }

}
