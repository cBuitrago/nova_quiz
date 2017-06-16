<?php

namespace AppBundle\Entity;

use AppBundle\Entity\AccountInfo;
use AppBundle\Entity\DepartmentInfo;
use AppBundle\Entity\UserInfo;
use AppBundle\Repository\AccountInfoRepository;
use DateTime;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use stdClass;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="account_info")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\AccountInfoRepository")
 * @ORM\HasLifecycleCallbacks
 */
class AccountInfo {

    /**
     * @ORM\Column(name="PK_id", type="integer", nullable=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\Column(name="is_active", type="boolean", nullable=false)
     */
    private $isActive;

    /**
     * @ORM\Column(name="can_create_quiz", type="boolean", nullable=false)
     */
    private $canCreateQuiz;

    /**
     * @ORM\Column(name="name", type="string", length=512, nullable=false, unique=true)
     */
    private $name;

    /**
     * @ORM\Column(name="description", type="text", length=65535, nullable=false)
     */
    private $description;

    /**
     * @var text
     * @ORM\Column(name="settings", type="text", nullable=false)
     */
    private $settings;

    /**
     * @ORM\Column(name="email_as_username", type="boolean", nullable=false)
     */
    private $emailAsUsername;

    /**
     * @ORM\Column(name="created_on", type="datetime", nullable=false)
     */
    private $createdOn;

    /**
     * @ORM\OneToMany(targetEntity="DepartmentInfo", mappedBy="accountInfo", cascade={"all"})
     * */
    private $departmentInfoCollection;

    /**
     * @ORM\OneToMany(targetEntity="UserInfo", mappedBy="accountInfo", cascade={"all"})
     */
    private $userInfo;

    /**
     * @ORM\OneToMany(targetEntity="Quiz", mappedBy="accountInfo", cascade={"all"})
     */
    private $quiz;

    /**
     * @ORM\OneToMany(targetEntity="QuizAccount", mappedBy="accountInfo", cascade={"all"})
     */
    private $quizAccountCollection;

    /**
     * @ORM\OneToMany(targetEntity="AccountInfo", mappedBy="parent")
     * */
    private $childrenCollection;

    /**
     * @ORM\ManyToOne(targetEntity="AccountInfo", inversedBy="childrenCollection")
     * @ORM\JoinColumn(name="FK_parent", referencedColumnName="PK_id")
     */
    private $parent;

    /**
     * @ORM\Column(type="string", nullable=false, columnDefinition="ENUM('IS_GOD', 'IS_PROVIDER', 'IS_USUAL')")
     */
    private $role;

    public function __construct() {
        $this->childrenCollection = new ArrayCollection();
        $this->departmentInfoCollection = new ArrayCollection();
        $this->userInfo = new ArrayCollection();
        $this->quizAccountCollection = new ArrayCollection();
        $this->quiz = new ArrayCollection();
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

    public function setSettings($settings) {
        $this->settings = $settings;
        return $this;
    }

    public function getSettings() {
        return $this->settings;
    }

    public function setCreatedOn($createdOn) {
        $this->createdOn = $createdOn;
        return $this;
    }

    public function getCreatedOn() {
        return $this->createdOn;
    }

    public function setParent(AccountInfo $parent = null) {
        $this->parent = $parent;

        return $this;
    }

    public function getParent() {
        return $this->parent;
    }

    public function setRole($role) {
        $this->role = $role;

        return $this;
    }

    public function getRole() {
        return $this->role;
    }

    public function setEmailAsUsername($emailAsUsername) {
        $this->emailAsUsername = $emailAsUsername;

        return $this;
    }

    public function getEmailAsUsername() {
        return $this->emailAsUsername;
    }

    public function setCanCreateQuiz($canCreateQuiz) {
        $this->canCreateQuiz = $canCreateQuiz;

        return $this;
    }

    public function getCanCreateQuiz() {
        return $this->canCreateQuiz;
    }

    public function getDepartmentInfoCollection() {
        return $this->departmentInfoCollection;
    }

    public function getUserInfoCollection() {
        return $this->userInfoCollection;
    }

    /** @ORM\PrePersist */
    public function onPrePersist() {
        $this->setIsActive(TRUE);
        $this->createdOn = new DateTime();
    }

    public function mapPostData($requestData) {
        $this->setName($requestData->name);
        $this->setDescription($requestData->description);

        return $this;
    }

    public function mergePostData($requestData) {
        if (isset($requestData->name))
            $this->setName($requestData->name);

        if (isset($requestData->description))
            $this->setDescription($requestData->description);

        if (isset($requestData->isActive))
            $this->setDescription($requestData->isActive);

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
        $data->settings = json_decode($this->accountAppSettings->getSettings());

        if (array_search('account_app_settings', $includes) !== FALSE)
            $data->accountAppSettings = $this->accountAppSettings->getData();

        if (array_search('department_info', $includes) !== FALSE) {
            $department = array();
            $this->departmentInfoCollection->first();
            while ($this->departmentInfoCollection->current() != NULL) {
                array_push($department, $this->departmentInfoCollection->current()->getData());
                $this->departmentInfoCollection->next();
            }
            $data->departmentInfo = $department;
        }

        if (array_search('user_info', $includes) !== FALSE) {
            $userInfo = array();
            $this->userInfoCollection->first();
            while ($this->userInfoCollection->current() != NULL) {
                array_push($userInfo, $this->userInfoCollection->current()->getData());
                $this->userInfoCollection->next();
            }
            $data->userInfo = $userInfo;
        }


        return $data;
    }

    public function __toString() {
        return strval($this->id);
    }

    public function addDepartmentInfoCollection(DepartmentInfo $departmentInfoCollection) {
        $this->departmentInfoCollection[] = $departmentInfoCollection;

        return $this;
    }

    public function removeDepartmentInfoCollection(DepartmentInfo $departmentInfoCollection) {
        $this->departmentInfoCollection->removeElement($departmentInfoCollection);
    }

    public function addUserInfo(UserInfo $userInfo) {
        $this->userInfo[] = $userInfo;

        return $this;
    }

    public function removeUserInfo(UserInfo $userInfo) {
        $this->userInfo->removeElement($userInfo);
    }

    public function getUserInfo() {
        return $this->userInfo;
    }

    public function addChildrenCollection(AccountInfo $childrenCollection) {
        $this->childrenCollection[] = $childrenCollection;

        return $this;
    }

    public function removeChildrenCollection(AccountInfo $childrenCollection) {
        $this->childrenCollection->removeElement($childrenCollection);
    }

    public function getChildrenCollection() {
        return $this->childrenCollection;
    }

    public function addQuiz(Quiz $quiz) {
        $this->quiz[] = $quiz;

        return $this;
    }

    public function removeQuiz(Quiz $quiz) {
        $this->quiz->removeElement($quiz);
    }

    public function getQuiz() {
        return $this->quiz;
    }

    public function validateAccount($urlAccount) {

        if ($this->hasRole("IS_GOD")) {
            return TRUE;
        }

        if ($this->getName() === $urlAccount)
            return TRUE;

        if ($this->hasRole("IS_PROVIDER")) {
            foreach ($this->childrenCollection as $usualAccount) {
                if ($usualAccount->getName() === $urlAccount) {
                    return TRUE;
                }
            }
        }

        return FALSE;
    }

    public function hasRole($role) {

        if ($this->getRole() === $role)
            return TRUE;

        return FALSE;
    }
    
    /**
     * Verifier Cette function juste pour admin
     * @param type $quiz
     * @return boolean
     */
    public function validateQuizAccount($quiz) {
        
        foreach ($this->quiz as $selfQuiz) {
            if ($selfQuiz === $quiz) {
                return TRUE;
            }
        }
        
        foreach ($this->quizAccountCollection as $quizAccount) {
            if ($quizAccount->getQuiz() === $quiz) {
                return TRUE;
            }
        }
        
        return FALSE;
    }
    
    public function setSettingsDefault() {

        $settings = '{"logo":"logoCompanyDefault.png","colors":{"aside":"#000000","nav":"rgba(250,250,250,0.99)","principal":"#327546","btn_cancel":"#993f44","nav2":"#eeeeee"}}';

        $this->settings = $settings;
        return $this;
    }

}
