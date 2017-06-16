<?php

namespace AppBundle\Entity;

use com\novaconcept\entity\DepartmentInfo;
use com\novaconcept\entity\UserInfo;
use DateTime;
use Doctrine\ORM\Mapping as ORM;
use stdClass;

/**
 * @ORM\Table(name="department_authorization")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\DepartmentAuthorizationRepository")
 * @ORM\HasLifecycleCallbacks
 */
class DepartmentAuthorization {

    /**
     * @var UserInfo
     *
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="NONE")
     * @ORM\OneToOne(targetEntity="UserInfo", inversedBy="departmentAuthorization")
     * @ORM\JoinColumn(name="FPK_user_info", referencedColumnName="PK_id", onDelete="cascade")
     */
    private $userInfo;

    /**
     * @var boolean
     * @ORM\Column(name="is_recursive", type="boolean", nullable=false)
     */
    private $isRecursive;

    /**
     * @var DateTime
     * @ORM\Column(name="created_on", type="datetime", nullable=false)
     */
    private $createdOn;

    /**
     * @ORM\ManyToOne(targetEntity="DepartmentInfo", inversedBy="departmentAuthorizationCollection")
     * @ORM\JoinColumn(name="FK_department_info", referencedColumnName="PK_id", nullable=false)
     */
    private $departmentInfo;

    public function setUserInfo($userInfo) {
        $this->userInfo = $userInfo;

        return $this;
    }

    public function getUserInfo() {
        return $this->userInfo;
    }

    public function setIsRecursive($isRecursive) {
        $this->isRecursive = $isRecursive;

        return $this;
    }

    public function getIsRecursive() {
        return $this->isRecursive;
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

    /** @ORM\PrePersist */
    public function onPrePersist() {
        $this->createdOn = new DateTime();
    }

    public function mapPostData($requestData) {
        $this->isRecursive = $requestData->isRecursive;

        return $this;
    }

    public function mergePostData($requestData) {
        if (isset($requestData->isRecursive) === TRUE)
            $this->isRecursive = $requestData->isRecursive;

        return $this;
    }

    public function getData($includes = NULL) {
        if ($includes === NULL)
            $includes = array();
        $data = new stdClass();

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
        return strval($this->userInfo->getId());
    }

    public function isSelfUser($userInfo) {

        if ($this->userInfo === $userInfo) {
            return true;
        }

        return false;
    }

    public function isSameDepartment($departmentInfo) {

        if ($this->departmentInfo === $departmentInfo) {
            return true;
        }

        return false;
    }

}
