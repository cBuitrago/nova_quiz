<?php

namespace AppBundle\Entity;

use AppBundle\Entity\DepartmentInfo;
use AppBundle\Entity\UserInfo;
use DateTime;
use Doctrine\ORM\Mapping as ORM;
use stdClass;

/**
 * @ORM\Table(name="quiz_authorization")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\QuizAuthorizationRepository")
 * @ORM\HasLifecycleCallbacks
 */
class QuizAuthorization {

    /**
     * @var integer
     * @ORM\Column(name="PK_id", type="integer", nullable=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var DateTime
     * @ORM\Column(name="START_DATE", type="datetime", nullable=true)
     */
    private $startDate;

    /**
     * @var DateTime
     * @ORM\Column(name="END_DATE", type="datetime", nullable=true)
     */
    private $endDate;

    /**
     * @ORM\ManyToOne(targetEntity="DepartmentInfo", inversedBy="quizAuthorizationCollection")
     * @ORM\JoinColumn(name="FK_department_info", referencedColumnName="PK_id", onDelete="cascade", nullable=false)
     */
    private $departmentInfo;

    /**
     * @ORM\ManyToOne(targetEntity="Quiz", inversedBy="quizAuthorizationCollection")
     * @ORM\JoinColumn(name="QUIZ_ID", referencedColumnName="ID", onDelete="cascade", nullable=false)
     */
    private $quiz;

    public function getId() {
        return $this->id;
    }

    public function setStartDate($startDate) {
        $this->startDate = $startDate;
        return $this;
    }

    public function getStartDate() {
        return $this->startDate;
    }

    public function setEndDate($endDate) {
        $this->endDate = $endDate;
        return $this;
    }

    public function getEndDate() {
        return $this->endDate;
    }

    public function setCreatedOn($createdOn) {
        $this->createdOn = $createdOn;
        return $this;
    }

    public function getCreatedOn() {
        return $this->createdOn;
    }

    public function setDepartmentInfo($departmentInfo) {
        $this->departmentInfo = $departmentInfo;
        return $this;
    }

    public function getDepartmentInfo() {
        return $this->departmentInfo;
    }

    public function setQuizInfo($quiz) {
        $this->quiz = $quiz;
        return $this;
    }

    public function getQuizInfo() {
        return $this->quiz;
    }

    /** @ORM\PrePersist */
    public function onPrePersist() {
        
    }

    public function mapPostData($requestData) {
        $this->setStartDate($requestData->startDate);
        $this->setEndDate($requestData->endDate);

        return $this;
    }

    public function mergePostData($requestData) {
        if (isset($requestData->startDate))
            $this->setStartDate($requestData->startDate);

        if (isset($requestData->endDate))
            $this->setEndDate($requestData->endDate);

        return $this;
    }

    public function getData($includes = NULL) {
        if ($includes === NULL)
            $includes = array();
        $data = new stdClass();

        $data->id = $this->getId();
        $data->startDate = $this->getStartDate();
        $data->endDate = $this->getEndDate();
        $data->userId = $this->getUserInfo()->getId();
        $data->departmentId = $this->getDepartmentInfo()->getId();
        $data->isRecursive = $this->getIsRecursive();
        $data->createdOn = $this->getCreatedOn()->getTimestamp();

        if (array_search('department_info', $includes) !== FALSE)
            $data->departmentInfo = $this->getDepartmentInfo()->getData();

        if (array_search('user_info', $includes) !== FALSE)
            $data->userInfoId = $this->getUserInfo()->getData();

        return $data;
    }

    public function __toString() {
        return strval($this->id);
    }

    /**
     * Set quiz
     *
     * @param \AppBundle\Entity\Quiz $quiz
     *
     * @return QuizAuthorization
     */
    public function setQuiz(\AppBundle\Entity\Quiz $quiz = null) {
        $this->quiz = $quiz;

        return $this;
    }

    /**
     * Get quiz
     *
     * @return \AppBundle\Entity\Quiz
     */
    public function getQuiz() {
        return $this->quiz;
    }

}
