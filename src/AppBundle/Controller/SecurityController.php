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
     * @Route("/activation/{key}", name="activation")
     */
    public function activationAction(Request $request, $account = "", $key) {

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

        $userInfo = $em->getRepository('AppBundle:UserInfo')
                ->findOneByActivationKey($key);
        if ($userInfo === NULL) {
            throw $this->createNotFoundException('user does not exist');
        }

        if ($userInfo->getIsActive() ||
                $userInfo->getAccountInfo() !== $accountInfo ||
                $userInfo->getCreatedOn()->getTimestamp() > (time() + 604800)) {
            throw $this->createNotFoundException('user does not exist');
        }

        if (count($request->request) > 0) {
            $encoder = $this->container->get('security.password_encoder');
            if (trim($request->request->get('username')) !== $userInfo->getUsername() ||
                    $encoder->isPasswordValid($userInfo, trim($request->request->get('password'))) === FALSE ||
                    trim($request->request->get('n1password')) !== trim($request->request->get('n2password'))) {
                return $this->render('security/activation.html.twig', array(
                            'userInfo' => $userInfo,
                            'error' => true
                ));
            }
            $newEncoded = $encoder->encodePassword($userInfo, trim($request->request->get('n1password')));
            $userInfo->setIsActive(TRUE)
                    ->setName($request->request->get('name'))
                    ->setFirstName($request->request->get('firstname'))
                    ->setPassword($newEncoded)
                    ->setForcePsw(FALSE)
                    ->setActivationKey(NULL);
            $em->merge($userInfo);
            $em->flush();

            return $this->redirectToRoute("quiz_index", array('account' => $account));
        }

        return $this->render('security/activation.html.twig', array(
                    'userInfo' => $userInfo,
                    'error' => false
        ));
    }

    /**
     * @Route("/success", name="login_success")
     */
    public function successAction($account = "") {
        
    }

    /**
     * @Route("/fail", name="login_fail")
     */
    public function failAction($account = "") {
        
    }

}
