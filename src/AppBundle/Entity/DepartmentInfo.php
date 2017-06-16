<?php

namespace AppBundle\Entity;

use AppBundle\Entity\AccountInfo;
use AppBundle\Entity\DepartmentAuthorization;
use AppBundle\Entity\UserInfo;
use AppBundle\Repository\DepartmentInfoRepository;
use DateTime;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use stdClass;

/**
 * @ORM\Table(name="department_info")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\DepartmentInfoRepository")
 * @ORM\HasLifecycleCallbacks
 */
class DepartmentInfo {

    /**
     * @ORM\Column(name="PK_id", type="integer", nullable=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var boolean
     * @ORM\Column(name="is_active", type="boolean", nullable=false)
     */
    private $isActive;

    /**
     * @var string
     * @ORM\Column(name="name", type="string", length=512, nullable=false)
     */
    private $name;

    /**
     * @ORM\Column(type="string", nullable=false, columnDefinition="ENUM('IS_ACCOUNT_DEPARTMENT', 'IS_USUAL_DEPARTMENT')")
     */
    private $description;

    /**
     * @var DateTime
     * @ORM\Column(name="created_on", type="datetime", nullable=false)
     */
    private $createdOn;

    /**
     * @var AccountInfo
     * @ORM\ManyToOne(targetEntity="AccountInfo", inversedBy="departmentInfoCollection")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="FK_account_info", referencedColumnName="PK_id", onDelete="cascade")
     * })
     */
    private $accountInfo;

    /**
     * @ORM\OneToMany(targetEntity="DepartmentAuthorization", mappedBy="departmentInfo", cascade={"all"})
     * */
    private $departmentAuthorizationCollection;

    /**
     * @ORM\OneToMany(targetEntity="QuizAuthorization", mappedBy="departmentInfo", cascade={"all"})
     */
    private $quizAuthorizationCollection;

    /**
     * @ORM\OneToMany(targetEntity="DepartmentInfo", mappedBy="parent")
     */
    private $childrenCollection;

    /**
     * @ORM\ManyToOne(targetEntity="DepartmentInfo", inversedBy="childrenCollection")
     * @ORM\JoinColumn(name="FK_parent", referencedColumnName="PK_id")
     */
    private $parent;

    public function __construct() {
        $this->childrenCollection = new ArrayCollection();
        $this->departmentAuthorizationCollection = new ArrayCollection();
        $this->quizAuthorizationCollection = new ArrayCollection();
    }

    public function getId() {
        return $this->id;
    }

    public function setIsActive($isActive) {
        $this->isActive = $isActive;
        return $this;
    }

    public function getIsActive() {
        return $this->isActive;
    }

    public function setName($name) {
        $this->name = $name;
        return $this;
    }

    public function getName() {
        return $this->name;
    }

    public function setDescription($description) {
        $this->description = $description;
        return $this;
    }

    public function getDescription() {
        return $this->description;
    }

    public function setCreatedOn($createdOn) {
        $this->createdOn = $createdOn;
        return $this;
    }

    public function getCreatedOn() {
        return $this->createdOn;
    }

    public function setAccountInfo($accountInfo) {
        $this->accountInfo = $accountInfo;
        return $this;
    }

    public function getAccountInfo() {
        return $this->accountInfo;
    }

    public function setParent($parent = NULL) {
        $this->parent = $parent;
        return $this;
    }

    public function getParent() {
        return $this->parent;
    }

    public function getChildrenCollection() {
        return $this->childrenCollection;
    }

    public function getDepartmentAuthorizationCollection() {
        return $this->departmentAuthorizationCollection;
    }

    public function getQuizAuthorizationCollection() {
        return $this->quizAuthorizationCollection;
    }

    public function getQuizCollection() {
        return $this->quizCollection;
    }

    /** @ORM\PrePersist */
    public function onPrePersist() {
        $this->isActive = TRUE;
        $this->createdOn = new DateTime();
    }

    public function mapPostData($requestData) {
        $this->name = $requestData->name;
        $this->description = $requestData->description;

        return $this;
    }

    public function mergePostData($requestData) {
        if (isset($requestData->name))
            $this->name = $requestData->name;

        if (isset($requestData->description))
            $this->description = $requestData->description;

        if (isset($requestData->isActive))
            $this->isActive = $requestData->isActive;

        return $this;
    }

    public function getData($includes = NULL) {
        if ($includes === NULL)
            $includes = array();
        $data = new stdClass();

        $data->id = $this->id;
        $data->name = $this->name;
        $data->description = $this->description;
        $data->isActive = $this->isActive;
        $data->createdOn = $this->createdOn->getTimestamp();
        $data->parent = ($this->parent != NULL) ? $this->getParent()->getId() : NULL;

        if (array_search('account_info', $includes) !== FALSE)
            $data->accountInfo = $this->accountInfo->getData();

        if (array_search('children', $includes) !== FALSE) {
            $child = array();
            $this->childrenCollection->first();
            while ($this->childrenCollection->current() != NULL) {
                array_push($child, $this->childrenCollection->current()->getData());
                $this->childrenCollection->next();
            }
            $data->childrenCollection = $child;
        }

        if (array_search('recursive_children', $includes) !== FALSE) {
            $child = array();
            $this->childrenCollection->first();
            while ($this->childrenCollection->current() != NULL) {
                array_push($child, $this->childrenCollection->current()->getData(array('recursive_children')));
                $this->childrenCollection->next();
            }
            $data->recursiveChildrenCollection = $child;
        }

        if (array_search('user_info', $includes) !== FALSE) {
            $user = array();
            $this->userInfoCollection->first();
            while ($this->userInfoCollection->current() != NULL) {
                array_push($user, $this->userInfoCollection->current()->getData());
                $this->userInfoCollection->next();
            }
            $data->users = $user;
        }

        if (array_search('authorizations', $includes) !== FALSE) {
            $authorization = array();
            $this->departmentAuthorizationCollection->first();
            while ($this->departmentAuthorizationCollection->current() != NULL) {
                array_push($authorization, $this->departmentAuthorizationCollection->current()->getData());
                $this->departmentAuthorizationCollection->next();
            }
            if (!empty($authorization)) {
                $data->authorizations = $authorization;
            }
        }

        if (array_search('parent', $includes) !== FALSE) {
            $data->parent = NULL;
            if ($this->parent != NULL)
                $data->parent = $this->parent->getData();
        }

        if (array_search('parents', $includes) !== FALSE) {
            if ($this->getParent() != NULL) {
                $parents = array('parents');
                $data->parents = $this->getParent()->getData($parents);
            }
        }

        return $data;
    }

    /**
     * @todo authenticating a user to a department taking in consideration recusion
     * @param type $userInfo
     * @return boolean
     */
    public function authenticateUser($userInfo) {
        return FALSE;
    }

    public function __toString() {
        return strval($this->id);
    }

    /**
     * Add departmentAuthorizationCollection
     *
     * @param DepartmentAuthorization $departmentAuthorizationCollection
     *
     * @return DepartmentInfo
     */
    public function addDepartmentAuthorizationCollection(DepartmentAuthorization $departmentAuthorizationCollection) {
        $this->departmentAuthorizationCollection[] = $departmentAuthorizationCollection;

        return $this;
    }

    /**
     * Remove departmentAuthorizationCollection
     *
     * @param DepartmentAuthorization $departmentAuthorizationCollection
     */
    public function removeDepartmentAuthorizationCollection(DepartmentAuthorization $departmentAuthorizationCollection) {
        $this->departmentAuthorizationCollection->removeElement($departmentAuthorizationCollection);
    }

    /**
     * Add quizAuthorizationCollection
     *
     * @param QuizAuthorization $quizAuthorizationCollection
     *
     * @return DepartmentInfo
     */
    public function addQuizAuthorizationCollection(QuizAuthorization $quizAuthorizationCollection) {
        $this->quizAuthorizationCollection[] = $quizAuthorizationCollection;

        return $this;
    }

    /**
     * Remove quizAuthorizationCollection
     *
     * @param QuizAuthorization $quizAuthorizationCollection
     */
    public function removeQuizAuthorizationCollection(QuizAuthorization $quizAuthorizationCollection) {
        $this->quizAuthorizationCollection->removeElement($quizAuthorizationCollection);
    }

    /**
     * Add childrenCollection
     *
     * @param DepartmentInfo $childrenCollection
     *
     * @return DepartmentInfo
     */
    public function addChildrenCollection(DepartmentInfo $childrenCollection) {
        $this->childrenCollection[] = $childrenCollection;

        return $this;
    }

    /**
     * Remove childrenCollection
     *
     * @param DepartmentInfo $childrenCollection
     */
    public function removeChildrenCollection(DepartmentInfo $childrenCollection) {
        $this->childrenCollection->removeElement($childrenCollection);
    }

    public function isAccountDepartment() {

        if ($this->getDescription() === "IS_ACCOUNT_DEPARTMENT") {
            return true;
        }

        return false;
    }

    public function hasQuiz($quiz) {

        foreach ($this->quizAuthorizationCollection as $quizAuthorization) {
            if ($quizAuthorization->getQuiz() === $quiz) {
                return TRUE;
            }
        }

        return FALSE;
    }

    public function validateDepartment($department) {

        if ($this === $department) {
            return true;
        }

        if ($this->getAccountInfo()->hasRole('IS_GOD')) {
            return true;
        }

        if ($this->getAccountInfo()->hasRole('IS_PROVIDER')) {

            if ($this->isAccountDepartment()) {
                if ($this->getAccountInfo() === $department->getAccountInfo()) {
                    return true;
                } else {
                    foreach ($this->isAccountInfo()->getChildrenCollection() as $child) {
                        if ($child->getAccountInfo() === $department->getAccountInfo()) {
                            return true;
                        }
                    }
                }
            } else {
                if ($this->validateParent($department)) {
                    return TRUE;
                }
            }
        }

        if ($this->getAccountInfo()->hasRole('IS_USUAL')) {
            if ($this->validateParent($department)) {
                return true;
            }
        }

        return false;
    }

    public function validateParent($department) {
        
        if ($department->getParent() !== NULL) {
            if ($department->getParent() === $this) {
                return true;
            }

            if ($this->validateParent($department->getParent())) {
                return true;
            }
        }
        
        return FALSE;
    }

}
