<?php

namespace AppBundle\Repository;

use Symfony\Bridge\Doctrine\Security\User\UserLoaderInterface;
use Doctrine\ORM\EntityRepository;

class UserInfoRepository extends EntityRepository implements UserLoaderInterface {

    public function loadUserByUsername($username) {

        return $this->createQueryBuilder('u')
                        ->where('u.username = :username OR u.email = :email')
                        ->setParameter('username', $username)
                        ->setParameter('email', $username)
                        ->getQuery()
                        ->getOneOrNullResult();
    }

    public function allUsersByProvider($provider) {

        return $this->createQueryBuilder('u')
                        ->innerJoin('u.accountInfo', 'p')
                        ->where('u.accountInfo = :provider')
                        ->orWhere('p.parent = :provider')
                        ->setParameter('provider', $provider)
                        ->getQuery()
                        ->getResult();
    }

}
