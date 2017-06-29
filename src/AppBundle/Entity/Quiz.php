<?php

namespace AppBundle\Entity;

use DateTime;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use stdClass;

/**
 * @ORM\Table(name="quiz")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\QuizRepository")
 * @ORM\HasLifecycleCallbacks
 */
class Quiz {

    /**
     * @ORM\Column(name="ID", type="integer", nullable=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\Column(name="QUIZ_ID", type="string", nullable=false)
     */
    private $quizId;

    /**
     * @ORM\Column(name="LOCKED_ON_COMPLETION", type="boolean", nullable=false)
     */
    private $lockedOnCompletion;

    /**
     * @ORM\Column(name="TIME_TO_COMPLETE", type="integer", nullable=false)
     */
    private $timeToComplete;

    /**
     * @ORM\Column(name="QUIZ_DATA", type="text", nullable=false)
     */
    private $quizData;

    /**
     * @ORM\Column(name="IS_USER_CAN_DISPLAY_CHART", type="boolean", nullable=false)
     */
    private $isUserCanDisplayChart;

    /**
     * @ORM\Column(name="IS_USER_CAN_DISPLAY_QA", type="boolean", nullable=false)
     */
    private $isUserCanDisplayQa;

    /**
     * @ORM\Column(name="IS_ENABLED", type="boolean", nullable=false)
     */
    private $isEnabled;

    /**
     * @ORM\Column(name="IS_USER_SEE_GOOD_ANSWER", type="boolean", nullable=false)
     */
    private $isUserSeeGoodAnswer;

    /**
     *
     * @ORM\Column(name="ANSWER_JSON", type="text", nullable=false)
     */
    private $answerJson;

    /**
     * @ORM\ManyToOne(targetEntity="QuizType", inversedBy="quizCollection")
     * @ORM\JoinColumn(name="quizType", referencedColumnName="id", nullable=false, onDelete="cascade")
     */
    private $quizType;

    /**
     * @ORM\ManyToOne(targetEntity="AccountInfo", inversedBy="quiz")
     * @ORM\JoinColumn(name="accountInfo", referencedColumnName="PK_id", nullable=false)
     */
    private $accountInfo;

    /**
     * @ORM\OneToMany(targetEntity="QuizAuthorization", mappedBy="quiz", cascade={"all"}) 
     */
    private $quizAuthorizationCollection;

    /**
     * @ORM\OneToMany(targetEntity="QuizAccount", mappedBy="quiz", cascade={"all"}) 
     */
    private $quizAccountCollection;

    /**
     * @ORM\OneToMany(targetEntity="QuizResults", mappedBy="quizId", cascade={"all"})
     */
    private $quizResultsCollection;

    /**
     * @ORM\OneToMany(targetEntity="Catalogue", mappedBy="quiz", cascade={"all"})
     */
    private $catalogueCollection;

    public function __construct() {
        $this->quizAuthorizationCollection = new ArrayCollection();
        $this->quizAccountCollection = new ArrayCollection();
        $this->quizResultsCollection = new ArrayCollection();
        $this->catalogueCollection = new ArrayCollection();
    }

    public function getId() {
        return $this->id;
    }

    public function setQuizID($quizId) {
        $this->quizId = $quizId;
        return $this;
    }

    public function getQuizID() {
        return $this->quizId;
    }

    public function setLockedOnCompletion($lockedOnCompletion) {
        $this->lockedOnCompletion = $lockedOnCompletion;
        return $this;
    }

    public function getLockedOnCompletion() {
        return $this->lockedOnCompletion;
    }

    public function setTimeToComplete($timeToComplete) {
        $this->timeToComplete = $timeToComplete;
        return $this;
    }

    public function getTimeToComplete() {
        return $this->timeToComplete;
    }

    public function setQuizData($quizData) {
        $this->quizData = $quizData;
        return $this;
    }

    public function getQuizData() {
        return $this->quizData;
    }

    public function setIsUserCanDisplayChart($isUserCanDisplayChart) {
        $this->isUserCanDisplayChart = $isUserCanDisplayChart;
        return $this;
    }

    public function getIsUserCanDisplayChart() {
        return $this->isUserCanDisplayChart;
    }

    public function setIsUserCanDisplayQa($isUserCanDisplayQa) {
        $this->isUserCanDisplayQa = $isUserCanDisplayQa;
        return $this;
    }

    public function getIsUserCanDisplayQa() {
        return $this->isUserCanDisplayQa;
    }

    public function setIsEnabled($isEnabled) {
        $this->isEnabled = $isEnabled;
        return $this;
    }

    public function getIsEnabled() {
        return $this->isEnabled;
    }

    public function setIsUserSeeGoodAnswer($isUserSeeGoodAnswer) {
        $this->isUserSeeGoodAnswer = $isUserSeeGoodAnswer;
        return $this;
    }

    public function getIsUserSeeGoodAnswer() {
        return $this->isUserSeeGoodAnswer;
    }

    public function setAnswerJson($answerJson) {
        $this->answerJson = $answerJson;
        return $this;
    }

    public function getAnswerJson() {
        return $this->answerJson;
    }

    public function getQuizAuthorizationCollection() {
        return $this->quizAuthorizationCollection;
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
        $this->setQuizID($requestData->quizId);
        $this->setLockedOnCompletion($requestData->lockedOnCompletion);
        $this->setTimeToComplete($requestData->timeToComplete);
        $this->setQuizData($requestData->quizData);
        $this->setIsUserCanDisplayChart($requestData->isUserCanDisplayChart);
        $this->setIsUserCanDisplayQa($requestData->isUserCanDisplayQa);
        $this->setIsEnabled($requestData->isEnabled);
        $this->setIsUserSeeGoodAnswer($requestData->isUserSeeGoodAnswer);
        $this->setAnswerJson($requestData->answerJson);
    }

    public function mergePostData($requestData) {
        if (isset($requestData->QUIZ_ID))
            $this->setQuizID($requestData->QUIZ_ID);

        if (isset($requestData->LOCKED_ON_COMPLETION)) {
            $this->setLockedOnCompletion($requestData->LOCKED_ON_COMPLETION);
        } else {
            $this->setLockedOnCompletion(FALSE);
        }

        if (isset($requestData->TIME_TO_COMPLETE))
            $this->setTimeToComplete($requestData->TIME_TO_COMPLETE);

        if (isset($requestData->QUIZ_DATA))
            $this->setQuizData($requestData->QUIZ_DATA);

        if (isset($requestData->IS_USER_CAN_DISPLAY_CHART)) {
            $this->setIsUserCanDisplayChart($requestData->IS_USER_CAN_DISPLAY_CHART);
        } else {
            $this->setIsUserCanDisplayChart(FALSE);
        }

        if (isset($requestData->IS_USER_CAN_DISPLAY_QA)) {
            $this->setIsUserCanDisplayQa($requestData->IS_USER_CAN_DISPLAY_QA);
        } else {
            $this->setIsUserCanDisplayQa(FALSE);
        }

        if (isset($requestData->IS_ENABLED)) {
            $this->setIsEnabled($requestData->IS_ENABLED);
        } else {
            $this->setIsEnabled(FALSE);
        }

        if (isset($requestData->IS_USER_SEE_GOOD_ANSWER)) {
            $this->setIsUserSeeGoodAnswer($requestData->IS_USER_SEE_GOOD_ANSWER);
        } else {
            $this->setIsUserSeeGoodAnswer(FALSE);
        }

        if (isset($requestData->ANSWER_JSON))
            $this->setAnswerJson($requestData->ANSWER_JSON);
    }

    public function getData($includes = NULL) {
        if ($includes === NULL) {
            $includes = array();
        }

        $data = [];

        $data[] = $this->getId();
        $data[] = $this->getQuizID();
        $data[] = "star_date";
        $data[] = "end_date";
        $data[] = $this->getLockedOnCompletion();
        $data[] = $this->getTimeToComplete();
        $data[] = $this->getQuizData();
        $data[] = $this->getIsUserCanDisplayChart();
        $data[] = $this->getIsUserCanDisplayQa();
        $data[] = $this->getIsEnabled();
        $data[] = $this->getIsUserSeeGoodAnswer();
        $data[] = $this->getAnswerJson();

        return $data;
    }

    public function getDataArray($includes = NULL) {
        if ($includes === NULL) {
            $includes = array();
        }

        $data = [];

        $data['ID'] = $this->getId();
        $data['QUIZ_ID'] = $this->getQuizID();
        $data['LOCKED_ON_COMPLETION'] = $this->getLockedOnCompletion();
        $data['TIME_TO_COMPLETE'] = $this->getTimeToComplete();
        $data['QUIZ_DATA'] = $this->getQuizData();
        $data['IS_USER_CAN_DISPLAY_CHART'] = $this->getIsUserCanDisplayChart();
        $data['IS_USER_CAN_DISPLAY_QA'] = $this->getIsUserCanDisplayQa();
        $data['IS_ENABLED'] = $this->getIsEnabled();
        $data['IS_USER_SEE_GOOD_ANSWER'] = $this->getIsUserSeeGoodAnswer();
        $data['ANSWER_JSON'] = $this->getAnswerJson();

        return $data;
    }

    /**
     * Add quizAuthorizationCollection
     *
     * @param \AppBundle\Entity\QuizAuthorization $quizAuthorizationCollection
     *
     * @return Quiz
     */
    public function addQuizAuthorizationCollection(\AppBundle\Entity\QuizAuthorization $quizAuthorizationCollection) {
        $this->quizAuthorizationCollection[] = $quizAuthorizationCollection;

        return $this;
    }

    /**
     * Remove quizAuthorizationCollection
     *
     * @param \AppBundle\Entity\QuizAuthorization $quizAuthorizationCollection
     */
    public function removeQuizAuthorizationCollection(\AppBundle\Entity\QuizAuthorization $quizAuthorizationCollection) {
        $this->quizAuthorizationCollection->removeElement($quizAuthorizationCollection);
    }

    /**
     * Add quizResultsCollection
     *
     * @param \AppBundle\Entity\QuizResults $quizResultsCollection
     *
     * @return Quiz
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

    /**
     * Set accountInfo
     *
     * @param \AppBundle\Entity\AccountInfo $accountInfo
     *
     * @return Quiz
     */
    public function setAccountInfo(\AppBundle\Entity\AccountInfo $accountInfo) {
        $this->accountInfo = $accountInfo;

        return $this;
    }

    /**
     * Get accountInfo
     *
     * @return \AppBundle\Entity\AccountInfo
     */
    public function getAccountInfo() {
        return $this->accountInfo;
    }

    /**
     * Set quizType
     *
     * @param \AppBundle\Entity\QuizType $quizType
     *
     * @return Quiz
     */
    public function setQuizType(\AppBundle\Entity\QuizType $quizType) {
        $this->quizType = $quizType;

        return $this;
    }

    /**
     * Get quizType
     *
     * @return \AppBundle\Entity\QuizType
     */
    public function getQuizType() {
        return $this->quizType;
    }

    /**
     * Add catalogueCollection
     *
     * @param \AppBundle\Entity\Catalogue $catalogueCollection
     *
     * @return Quiz
     */
    public function addCatalogueCollection(\AppBundle\Entity\Catalogue $catalogueCollection) {
        $this->catalogueCollection[] = $catalogueCollection;

        return $this;
    }

    /**
     * Remove catalogueCollection
     *
     * @param \AppBundle\Entity\Catalogue $catalogueCollection
     */
    public function removeCatalogueCollection(\AppBundle\Entity\Catalogue $catalogueCollection) {
        $this->catalogueCollection->removeElement($catalogueCollection);
    }

    /**
     * Get catalogueCollection
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getCatalogueCollection() {
        return $this->catalogueCollection;
    }


    /**
     * Add quizAccountCollection
     *
     * @param \AppBundle\Entity\QuizAccount $quizAccountCollection
     *
     * @return Quiz
     */
    public function addQuizAccountCollection(\AppBundle\Entity\QuizAccount $quizAccountCollection)
    {
        $this->quizAccountCollection[] = $quizAccountCollection;

        return $this;
    }

    /**
     * Remove quizAccountCollection
     *
     * @param \AppBundle\Entity\QuizAccount $quizAccountCollection
     */
    public function removeQuizAccountCollection(\AppBundle\Entity\QuizAccount $quizAccountCollection)
    {
        $this->quizAccountCollection->removeElement($quizAccountCollection);
    }

    /**
     * Get quizAccountCollection
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getQuizAccountCollection()
    {
        return $this->quizAccountCollection;
    }
}
