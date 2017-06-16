<?php

namespace AppBundle\Repository;

use Doctrine\ORM\EntityRepository;

class DepartmentInfoRepository extends EntityRepository {

    public function getAccountDepartment($accountInfo) {

        return $this->createQueryBuilder('u')
                        ->where('u.description = :description')
                        ->AndWhere('u.accountInfo = :accountInfo')
                        ->AndWhere('u.parent is NULL')
                        ->setParameter('description', 'IS_ACCOUNT_DEPARTMENT')
                        ->setParameter('accountInfo', $accountInfo)
                        ->getQuery()
                        ->getOneOrNullResult();
    }

    public function getAllParentsDepartments() {

        return $this->createQueryBuilder('u')
                        ->where('u.parent is NULL')
                        ->getQuery()
                        ->getResult();
    }

}
