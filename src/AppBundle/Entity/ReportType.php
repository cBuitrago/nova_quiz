<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * ReportType
 *
 * @ORM\Table(name="report_type")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\ReportTypeRepository")
 */
class ReportType {

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
     * @ORM\OneToMany(targetEntity="Catalogue", mappedBy="reportType", cascade={"all"})
     */
    private $catalogueCollection;

    public function __construct() {
        $this->catalogueCollection = new ArrayCollection();
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
     * @return ReportType
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
     * Add catalogueCollection
     *
     * @param \AppBundle\Entity\Catalogue $catalogueCollection
     *
     * @return ReportType
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
    
    public function supportQuiz($quiz) {
        
        foreach ($this->catalogueCollection as $catalogue) {
            if ($catalogue->getQuiz() === $quiz) {
                return TRUE;
            }
        }
        
        return FALSE;
    }

}
