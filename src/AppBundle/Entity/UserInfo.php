<?php

namespace AppBundle\Entity;

use AppBundle\Entity\AccountInfo;
use AppBundle\Entity\DepartmentAuthorization;
use AppBundle\Entity\DepartmentInfo;
use AppBundle\Entity\QuizResults;
use AppBundle\Repository\UserInfoRepository;
use DateTime;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use stdClass;
use Symfony\Component\Security\Core\User\AdvancedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @ORM\Table(name="user_info")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\UserInfoRepository")
 * @ORM\HasLifecycleCallbacks
 */
class UserInfo implements AdvancedUserInterface, \Serializable {

    /**
     * @ORM\Column(name="PK_id", type="integer", nullable=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     * @ORM\OneToOne(targetEntity="DepartmentAuthorization", mappedBy="userInfo")
     */
    private $id;

    /**
     * @ORM\Column(name="username", type="string", length=256, nullable=false, unique=true)
     */
    private $username;

    /**
     * @ORM\Column(name="email", type="string", length=256, nullable=true)
     */
    private $email;

    /**
     * @ORM\Column(name="name", type="string", nullable=false)
     */
    private $name;

    /**
     * @ORM\Column(name="first_name", type="string", nullable=false)
     */
    private $firstName;

    /**
     * @ORM\Column(type="string", length=64)
     */
    private $password;

    /**
     * @ORM\Column(name="is_active", type="boolean", nullable=false)
     */
    private $isActive;

    /**
     * @ORM\Column(name="force_change_password", type="boolean", nullable=false)
     */
    private $forcePsw;

    /**
     * @ORM\Column(name="created_on", type="datetime", nullable=false)
     */
    private $createdOn;

    /**
     * @ORM\Column(name="modified_on", type="datetime", nullable=false)
     */
    private $modifiedOn;

    /**
     * @ORM\ManyToOne(targetEntity="AccountInfo", inversedBy="userInfo")
     * @ORM\JoinColumn(name="accountInfo", referencedColumnName="PK_id", nullable=false, onDelete="cascade")
     */
    private $accountInfo;

    /**
     * @ORM\OneToOne(targetEntity="DepartmentAuthorization", mappedBy="userInfo") 
     */
    private $departmentAuthorization;

    /**
     * @ORM\OneToMany(targetEntity="QuizResults", mappedBy="userInfo", cascade={"all"}) 
     */
    private $quizResultsCollection;

    /**
     * @ORM\Column(type="json_array")
     */
    private $roles = array();

    public function __construct() {
        $this->quizResultsCollection = new ArrayCollection();
    }

    public function getId() {
        return $this->id;
    }

    public function setUsername($username) {
        $this->username = $username;

        return $this;
    }

    public function getUsername() {
        return $this->username;
    }

    public function setEmail($email) {
        $this->email = $email;

        return $this;
    }

    public function getEmail() {
        return $this->email;
    }

    public function getName() {
        return $this->name;
    }

    public function setName($name) {
        $this->name = $name;

        return $this;
    }

    public function getFirstName() {
        return $this->firstName;
    }

    public function setFirstame($firstName) {
        $this->firstName = $firstName;

        return $this;
    }

    public function getCreatedOn() {
        return $this->createdOn;
    }

    public function getModifiedOn() {
        return $this->modifiedOn;
    }

    public function setDepartmentAuthorization($departmentAuthorization) {
        $this->departmentAuthorization = $departmentAuthorization;

        return $this;
    }

    public function getDepartmentAuthorization() {
        return $this->departmentAuthorization;
    }
    
    public function getDepartmentInfo() {
        return $this->getDepartmentAuthorization()->getDepartmentInfo();
    }

    public function getQuizResultsCollection() {
        return $this->quizResultsCollection;
    }

    public function getSalt() {
        return null;
    }

    public function getPassword() {
        return $this->password;
    }

    public function getRoles() {
        return $this->roles;
    }

    public function setRoles(array $roles) {
        $this->roles = $roles;

        return $this;
    }

    public function addRole($role) {

        if (!is_int(array_search($role, $this->roles))) {
            array_push($this->roles, $role);
        }

        return $this;
    }

    public function removeRole($role) {

        if (($key = array_search($role, $this->roles)) !== false) {
            unset($this->roles[$key]);
        }

        return $this;
    }

    public function eraseCredentials() {
        
    }

    /** @see \Serializable::serialize() */
    public function serialize() {
        return serialize(array(
            $this->id,
            $this->username,
            $this->isActive,
                // see section on salt below
// $this->salt,
        ));
    }

    /** @see \Serializable::unserialize() */
    public function unserialize($serialized) {
        list (
                $this->id,
                $this->username,
                $this->isActive,
                // see section on salt below
// $this->salt
                ) = unserialize($serialized);
    }

    /** @ORM\PrePersist */
    public function onPrePersist() {
        $this->createdOn = new DateTime();
        $this->modifiedOn = new DateTime();
        $this->isActive = TRUE;
    }

    /** @ORM\PreUpdate */
    public function onPreUpdate() {
        $this->modifiedOn = new DateTime();
    }

    public function mapPostData($requestData) {
        $this->username = $requestData->username;
        $this->name = $requestData->name;
        $this->firstName = $requestData->firstName;

        return $this;
    }

    public function mergePostData($requestData) {

        if (isset($requestData->username))
            $this->username = $requestData->username;

        if (isset($requestData->name))
            $this->name = $requestData->name;

        if (isset($requestData->firstName))
            $this->firstName = $requestData->firstName;

        return $this;
    }

    public function isAdmin() {

        if (is_int(array_search("ROLE_ADMIN", $this->getRoles()))) {
            return true;
        }

        return false;
    }

    public function isGod() {

        if (is_int(array_search("ROLE_GOD", $this->getRoles()))) {
            return true;
        }

        return false;
    }

    public function isRecursiveUser($userInfo) {

        if (!$this->isAdmin()) {
            return false;
        }

        if ($this->isGod()) {
            return true;
        }

        if ($this->getDepartmentAuthorization()->getDepartmentInfo()->getUserInfoCollection()->contains($userInfo)) {
            return true;
        }

        if ($this->getDepartmentAuthorization()->isRecursive() &&
                count($this->getDepartmentAuthorization()->getDepartmentInfo()->getChildrenCollection() > 0)) {
            if ($this->isRecursiveChildUser($this->getDepartmentAuthorization()->getDepartmentInfo()->getChildrenCollection(), $userInfo)) {
                return true;
            }
        }

        if ($this->getDepartmentAuthorization()->getDepartmentInfo()->isAccountDepartment() &&
                $this->getAccountInfo()->hasRole("IS_PROVIDER")) {
            foreach ($this->getAccountInfo()->getChildrenCollection() as $account) {
                if ($account->getUserInfo()->contains($userInfo)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 
     * @param type DepartmentInfo Collection
     * @param type UserInfo
     * @return boolean
     */
    public function isRecursiveChildUser($departmentInfoCollection, $userInfo) {

        foreach ($departmentInfoCollection as $departmentInfo) {

            if ($departmentInfo->getUserInfoCollection()->contains($userInfo)) {
                return true;
            }

            if (count($departmentInfo->getChildrenCollection()) > 0) {
                if ($this->isRecursiveChildUser($departmentInfo->getChildrenCollection(), $userInfo)) {
                    return true;
                }
            }
        }

        return false;
    }

    public function hasPermission($permission, $accountId = NULL) {

        $this->userAuthorizationCollection->first();
        while ($this->userAuthorizationCollection->current() != NULL) {
            if ($this->userAuthorizationCollection->current()->getUserPermission()->getName() == "is_god")
                return TRUE;

            if ($accountId === NULL) {
                if ($this->userAuthorizationCollection->current()->getUserPermission() == $permission)
                    return TRUE;
            } else {
                if ($this->userAuthorizationCollection->current()->getUserPermission() == $permission && $this->userAuthorizationCollection->current()->getAccountInfo()->getId() == $accountId)
                    return TRUE;
            }
            $this->userAuthorizationCollection->next();
        }

        return FALSE;
    }

    public function getData($includes = NULL) {

        if ($includes === NULL)
            $includes = array();
        $data = new stdClass();

        $data->id = $this->getId();
        $data->username = $this->getUsername();
        $data->name = $this->getName();
        $data->firstName = $this->getFirstName();
        $data->modifiedOn = $this->getModifiedOn()->getTimestamp();
        $data->createdOn = $this->getCreatedOn()->getTimestamp();

        if (array_search('user_account', $includes) !== FALSE) {
            $account = array();
            $this->userAccountCollection->first();
            while ($this->userAccountCollection->current() != NULL) {
                array_push($account, $this->userAccountCollection->current()->getData());
                $this->userAccountCollection->next();
            }
            $data->userAccount = $account;
        }

        if (array_search('account_info', $includes) !== FALSE) {
            $accountInfo = array();
            $this->accountInfoCollection->first();
            while ($this->accountInfoCollection->current() != NULL) {
                array_push($accountInfo, $this->accountInfoCollection->current()->getData());
                $this->accountInfoCollection->next();
            }
            $data->accountInfo = $accountInfo;
        }

        if (array_search('department_info', $includes) !== FALSE) {
            $department = array();
            $this->departmentInfoCollection->first();
            while ($this->departmentInfoCollection->current() != NULL) {
                array_push($department, $this->departmentInfoCollection->current()->getData());
                $this->departmentInfoCollection->next();
            }
            $data->departmentInfo = $department;
        }

        if (array_search('user_permission', $includes) !== FALSE) {
            $permission = array();
            $this->userPermissionCollection->first();
            while ($this->userPermissionCollection->current() != NULL) {
                array_push($permission, $this->userPermissionCollection->current()->getData(NULL));
                $this->userPermissionCollection->next();
            }
            $data->userPermission = $permission;
        }

        if (array_search('user_authorization', $includes) !== FALSE) {
            $authorization = array();
            $this->userAuthorizationCollection->first();
            while ($this->userAuthorizationCollection->current() != NULL) {
                array_push($authorization, $this->userAuthorizationCollection->current()->getData());
                $this->userAuthorizationCollection->next();
            }
            $data->userAuthorization = $authorization;
        }

        if (array_search('quiz_result', $includes) !== FALSE) {
            $quizResult = array();
            $this->quizResultsCollection->first();
            while ($this->quizResultsCollection->current() != NULL) {
                array_push($authorization, $this->quizResultsCollection->current()->getData());
                $this->quizResultsCollection->next();
            }
            $data->quizResults = $quizResult;
        }

        if (array_search('user_authorization_permission', $includes) !== FALSE) {
            $authorizationPermission = array();
            $this->userAuthorizationCollection->first();
            while ($this->userAuthorizationCollection->current() != NULL) {
                $userAuthorization = $this->userAuthorizationCollection->current()->getData();
                $userAuthorization->permissionName = $this->userAuthorizationCollection->current()->getUserPermission()->getName();
                $userAuthorization->permissionIsActive = $this->userAuthorizationCollection->current()->getUserPermission()->getIsActive();
                array_push($authorizationPermission, $userAuthorization);
                $this->userAuthorizationCollection->next();
            }
            $data->userAuthorizationPermission = $authorizationPermission;
        }

        if (array_search('recursive_children', $includes) !== FALSE) {
            $authorizationDepartment = array();
            $this->departmentAuthorizationCollection->first();
            while ($this->departmentAuthorizationCollection->current() != NULL) {
                if ($this->departmentAuthorizationCollection->current()->getIsRecursive() === TRUE) {
                    array_push($authorizationDepartment, $this->departmentAuthorizationCollection->current()->getDepartmentInfo()->getData(array('recursive_children')));
                } else {
                    array_push($authorizationDepartment, $this->departmentAuthorizationCollection->current()->getDepartmentInfo()->getData());
                }
                $this->departmentAuthorizationCollection->next();
            }
            $data->departmentAuthorization = $authorizationDepartment;
        }

        if (array_search('user_authentication', $includes) !== FALSE)
            $data->userAuthentication = $this->userAuthentication->getData();

        return $data;
    }

    public function getDataArray() {

        $data = [];
        $data[] = $this->getId();
        $data[] = $this->getUsername();
        $data[] = $this->getName();
        $data[] = $this->getFirstName();
        $data[] = $this->getCreatedOn()->getTimestamp();
        $data[] = $this->getModifiedOn()->getTimestamp();

        return $data;
    }

    public function __toString() {
        return strval($this->id);
    }

    public function setFirstName($firstName) {
        $this->firstName = $firstName;

        return $this;
    }

    public function setForcePsw($forcePsw) {
        $this->forcePsw = $forcePsw;

        return $this;
    }

    public function getForcePsw() {
        return $this->forcePsw;
    }

    public function setPassword($password) {
        $this->password = $password;

        return $this;
    }

    public function setIsActive($isActive) {
        $this->isActive = $isActive;

        return $this;
    }

    public function getIsActive() {
        return $this->isActive;
    }

    public function setCreatedOn($createdOn) {
        $this->createdOn = $createdOn;

        return $this;
    }

    public function setModifiedOn($modifiedOn) {
        $this->modifiedOn = $modifiedOn;

        return $this;
    }

    public function setAccountInfo(AccountInfo $accountInfo) {
        $this->accountInfo = $accountInfo;

        return $this;
    }

    public function getAccountInfo() {
        return $this->accountInfo;
    }

    public function addQuizResultsCollection(QuizResults $quizResultsCollection) {
        $this->quizResultsCollection[] = $quizResultsCollection;

        return $this;
    }

    public function removeQuizResultsCollection(QuizResults $quizResultsCollection) {
        $this->quizResultsCollection->removeElement($quizResultsCollection);
    }

    public function isAccountNonExpired() {
        return true;
    }

    public function isAccountNonLocked() {
        return true;
    }

    public function isCredentialsNonExpired() {
        return true;
    }

    public function isEnabled() {
        return $this->isActive;
    }

    public function isAccountAdminUser() {

        if (!$this->isAdmin()) {
            return FALSE;
        }

        $department = $this->getDepartmentAuthorization()->getDepartmentInfo();

        if ($department &&
                $department->getDescription() === 'IS_ACCOUNT_DEPARTMENT' &&
                $department->getParent() === NULL &&
                $department->getAccountInfo() === $this->getAccountInfo() &&
                $department->getName() === $this->getAccountInfo()->getName()) {
            return TRUE;
        }

        return FALSE;
    }

    public function getQuizResult($quiz) {

        foreach ($this->quizResultsCollection as $quizResult) {
            if ($quizResult->getQuizID() === $quiz) {
                return $quizResult;
            }
        }

        return FALSE;
    }

}
