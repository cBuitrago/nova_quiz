<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class DefaultController extends Controller {

    /**
     * @Route("/", name="homepage")
     */
    public function indexAction(Request $request) {
        // replace this example code with whatever you need
        return $this->render('/index.html.twig');
    }

    /**
     * @Route("{account}/indexpanel", name="index_panel")
     */
    public function indexPanelAction(Request $request) {
        // replace this example code with whatever you need
        return $this->render('/index.html.twig');
    }

}
