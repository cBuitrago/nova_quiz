<?php

namespace AppBundle\EventListener;

use Symfony\Component\HttpKernel\Event\GetResponseForExceptionEvent;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Bundle\FrameworkBundle\Templating\EngineInterface;

class ExceptionListener {

    /** @var EngineInterface */
    private $templating;

    public function __construct(EngineInterface $templating) {
        $this->templating = $templating;
    }

    public function onKernelException(GetResponseForExceptionEvent $event) {

        // You get the exception object from the received event
        $exception = $event->getException();

        //$event->getRequest());
        $message = sprintf(
                'My Error says: %s with code: %s', $exception->getMessage(), $exception->getCode()
        );
        //Customize your response object to display the exception details
        //$response = new Response();
        //$response->setContent($message);
        // HttpExceptionInterface is a special type of exception that
        // holds status code and header details
        if ($exception instanceof HttpExceptionInterface) {
            // $response->setStatusCode(401);
            // $response->headers->replace($exception->getHeaders());
        } else {
            // $response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $response = $this->templating->renderResponse('Exception/error404.html.twig', array(
            'lang' => "account",
        ));

        // Send the modified response object to the event
        $event->setResponse($response);
    }

}
