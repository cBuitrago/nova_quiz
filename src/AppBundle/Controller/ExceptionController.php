<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;

class ExceptionController extends Controller {

    public function showExceptionAction(Request $request) {
        
        $session = $request->getSession();
         var_dump($request->request);

        $securityContext = $this->container->get('security.authorization_checker');
        if ($securityContext && $securityContext->isGranted('IS_AUTHENTICATED_REMEMBERED')) {
            var_dump(" bbbbbb ");
        }

var_dump(" cccccccc ");

        if ($this->get('security.token_storage')->getToken()) {
            $usr = $this->get('security.token_storage')->getToken()->getUser();

            return $this->render('Exception/error404.html.twig', array(
              'lang' => "account",
              )); 
        } else {
            return $this->redirectToRoute('homepage');
        }
    }

}
