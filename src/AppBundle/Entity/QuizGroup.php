<?php

namespace AppBundle\Entity;

use AppBundle\Entity\ApiConfig;
use DateTime;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use stdClass;

/**
 * @ORM\Table(name="quiz_group")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\QuizGroupRepository")
 * @ORM\HasLifecycleCallbacks
 */
class QuizGroup {

    /**
     * @ORM\Column(name="ID", type="integer", nullable=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\Column(name="NAME", type="string", nullable=false)
     */
    private $name;

    public function __construct() {
        
    }

    public function getId() {
        return $this->id;
    }

    public function setName($name) {
        $this->name = $name;
        return $this;
    }

    public function getName() {
        return $this->name;
    }

    /** @ORM\PrePersist */
    public function onPrePersist() {
        
    }

    /** @ORM\PreUpdate */
    public function onPreUpdate() {
        
    }

    public function mapPostData($requestData) {
        $this->setName($requestData->name);
    }

    public function mergePostData($requestData) {
        if (isset($requestData->name))
            $this->setName($requestData->name);
    }

    public function getData($includes = NULL) {
        if ($includes === NULL) {
            $includes = array();
        }

        $data = new stdClass();

        $data->id = $this->getId();
        $data->name = $this->getName();

        return $data;
    }

}
