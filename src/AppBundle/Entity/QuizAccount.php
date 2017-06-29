<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * QuizAccount
 *
 * @ORM\Table(name="quiz_account")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\QuizAccountRepository")
 */
class QuizAccount {

    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\ManyToOne(targetEntity="Quiz", inversedBy="quizAccountCollection")
     * @ORM\JoinColumn(name="quiz", referencedColumnName="ID", onDelete="cascade", nullable=false)
     */
    private $quiz;

    /**
     * @ORM\ManyToOne(targetEntity="AccountInfo", inversedBy="quizAccountCollection")
     * @ORM\JoinColumn(name="accountInfo", referencedColumnName="PK_id", onDelete="cascade", nullable=false)
     */
    private $accountInfo;

    /**
     * Get id
     *
     * @return int
     */
    public function getId() {
        return $this->id;
    }

    /**
     * Set quiz
     *
     * @param integer $quiz
     *
     * @return QuizAccount
     */
    public function setQuiz($quiz) {
        $this->quiz = $quiz;

        return $this;
    }

    /**
     * Get quiz
     *
     * @return int
     */
    public function getQuiz() {
        return $this->quiz;
    }

    /**
     * Set account
     *
     * @param integer $account
     *
     * @return QuizAccount
     */
    public function setAccount($account) {
        $this->account = $account;

        return $this;
    }

    /**
     * Get account
     *
     * @return int
     */
    public function getAccount() {
        return $this->account;
    }


    /**
     * Set accountInfo
     *
     * @param \AppBundle\Entity\AccountInfo $accountInfo
     *
     * @return QuizAccount
     */
    public function setAccountInfo(\AppBundle\Entity\AccountInfo $accountInfo)
    {
        $this->accountInfo = $accountInfo;

        return $this;
    }

    /**
     * Get accountInfo
     *
     * @return \AppBundle\Entity\AccountInfo
     */
    public function getAccountInfo()
    {
        return $this->accountInfo;
    }
}
