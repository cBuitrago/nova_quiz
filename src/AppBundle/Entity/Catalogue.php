<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Catalogue
 *
 * @ORM\Table(name="catalogue")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\CatalogueRepository")
 */
class Catalogue {

    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\ManyToOne(targetEntity="Quiz", inversedBy="catalogueCollection")
     * @ORM\JoinColumn(name="quiz", referencedColumnName="ID", onDelete="cascade", nullable=false)
     */
    private $quiz;

    /**
     * @ORM\ManyToOne(targetEntity="ReportType", inversedBy="catalogueCollection")
     * @ORM\JoinColumn(name="reportType", referencedColumnName="id", onDelete="cascade", nullable=false)
     */
    private $reportType;

    /**
     * Get id
     *
     * @return int
     */
    public function getId() {
        return $this->id;
    }

    /**
     * Set quizType
     *
     * @param integer $quizType
     *
     * @return Catalogue
     */
    public function setQuizType($quizType) {
        $this->quizType = $quizType;

        return $this;
    }

    /**
     * Get quizType
     *
     * @return int
     */
    public function getQuizType() {
        return $this->quizType;
    }

    /**
     * Set reportType
     *
     * @param integer $reportType
     *
     * @return Catalogue
     */
    public function setReportType($reportType) {
        $this->reportType = $reportType;

        return $this;
    }

    /**
     * Get reportType
     *
     * @return int
     */
    public function getReportType() {
        return $this->reportType;
    }

    /**
     * Set quiz
     *
     * @param \AppBundle\Entity\Quiz $quiz
     *
     * @return Catalogue
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
