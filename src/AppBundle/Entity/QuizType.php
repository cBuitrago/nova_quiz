<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * QuizType
 *
 * @ORM\Table(name="quiz_type")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\QuizTypeRepository")
 */
class QuizType {

    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=255, unique=true)
     */
    private $name;

    /**
     * @ORM\OneToMany(targetEntity="Quiz", mappedBy="quizType", cascade={"all"})
     */
    private $quizCollection;

    public function __construct() {
        $this->quizCollection = new ArrayCollection();
    }

    /**
     * Get id
     *
     * @return int
     */
    public function getId() {
        return $this->id;
    }

    /**
     * Set name
     *
     * @param string $name
     *
     * @return QuizType
     */
    public function setName($name) {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name
     *
     * @return string
     */
    public function getName() {
        return $this->name;
    }

    /**
     * Add quizCollection
     *
     * @param \AppBundle\Entity\Quiz $quizCollection
     *
     * @return QuizType
     */
    public function addQuizCollection(\AppBundle\Entity\Quiz $quizCollection) {
        $this->quizCollection[] = $quizCollection;

        return $this;
    }

    /**
     * Remove quizCollection
     *
     * @param \AppBundle\Entity\Quiz $quizCollection
     */
    public function removeQuizCollection(\AppBundle\Entity\Quiz $quizCollection) {
        $this->quizCollection->removeElement($quizCollection);
    }

    /**
     * Get quizCollection
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getQuizCollection() {
        return $this->quizCollection;
    }

}
