<?php

namespace AppBundle\Entity;

use DateTime;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use stdClass;

/**
 * @ORM\Table(name="progress_info")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\ProgressInfoRepository")
 * @ORM\HasLifecycleCallbacks
 */
class ProgressInfo {

    /**
     * @ORM\Column(name="ID", type="integer", nullable=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="FRA", type="string", nullable=false)
     */
    private $fra;

    /**
     * @var string
     *
     * @ORM\Column(name="ENG", type="string", nullable=false)
     */
    private $eng;

    /**
     * @ORM\OneToMany(targetEntity="QuizResults", mappedBy="progressId", cascade={"all"})
     */
    private $quizResultsCollection;

    public function __construct() {
        $this->quizResultsCollection = new ArrayCollection();
    }

    public function getId() {
        return $this->id;
    }

    public function setFra($fra) {
        $this->fra = $fra;
        return $this;
    }

    public function getFra() {
        return $this->fra;
    }

    public function setEng($eng) {
        $this->eng = $eng;
        return $this;
    }

    public function getEng() {
        return $this->eng;
    }

    public function getQuizResultsCollection() {
        return $this->quizResultsCollection;
    }

    /** @ORM\PrePersist */
    public function onPrePersist() {
        
    }

    /** @ORM\PreUpdate */
    public function onPreUpdate() {
        
    }

    public function mapPostData($requestData) {
        $this->setFra($requestData->fra);
        $this->setEng($requestData->eng);
    }

    public function mergePostData($requestData) {
        if (isset($requestData->fra))
            $this->setFra($requestData->fra);

        if (isset($requestData->eng))
            $this->setEng($requestData->eng);
    }

    public function getData($includes = NULL) {
        if ($includes === NULL) {
            $includes = array();
        }

        /* $data = new stdClass();

          $data->id = $this->getId();
          $data->fra = $this->getFra();
          $data->eng = $this->getEng(); */

        /* $data = [];

          $data['ID'] = $this->getId();
          $data['FRA'] = $this->getFra();
          $data['ENG'] = $this->getEng(); */

        $data = [];

        $data[] = $this->getId();
        $data[] = $this->getFra();
        $data[] = $this->getEng();

        return $data;
    }

    /**
     * Add quizResultsCollection
     *
     * @param \AppBundle\Entity\QuizResults $quizResultsCollection
     *
     * @return ProgressInfo
     */
    public function addQuizResultsCollection(\AppBundle\Entity\QuizResults $quizResultsCollection) {
        $this->quizResultsCollection[] = $quizResultsCollection;

        return $this;
    }

    /**
     * Remove quizResultsCollection
     *
     * @param \AppBundle\Entity\QuizResults $quizResultsCollection
     */
    public function removeQuizResultsCollection(\AppBundle\Entity\QuizResults $quizResultsCollection) {
        $this->quizResultsCollection->removeElement($quizResultsCollection);
    }

}
