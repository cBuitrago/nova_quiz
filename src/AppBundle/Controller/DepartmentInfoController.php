<?php

namespace AppBundle\Controller;

use AppBundle\Entity\DepartmentInfo;
use AppBundle\Entity\AccountInfo;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

/**
 * Departmentinfo controller.
 * @Security("has_role('ROLE_ADMIN')")
 * @Route("{account}/{_locale}/groups", 
 *      defaults={"_locale":"fr"},
 *      requirements={
 *          "_locale": "fr|en|es"
 *      })
 */
class DepartmentInfoController extends Controller {

    /**
     * Lists all departmentInfo entities.
     *
     * @Route("/", name="departmentinfo_index")
     * @Method("GET")
     */
    public function indexAction($account) {

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        $em = $this->getDoctrine()->getManager();

        if ($this->get('security.authorization_checker')->isGranted('ROLE_GOD') &&
                $usr->getAccountInfo()->hasRole('IS_GOD')) {
            $departmentInfos = $em->getRepository('AppBundle:DepartmentInfo')
                    ->getAllParentsDepartments();
        }

        if ($usr->getAccountInfo()->hasRole('IS_PROVIDER')) {
            $departmentInfos = [];
            if ($usr->isAccountAdminUser()) {
                array_push($departmentInfos, $usr->getDepartmentAuthorization()->getdepartmentInfo());
                foreach ($usr->getAccountInfo()->getChildrenCollection() as $accountChild) {

                    $department = $em->getRepository('AppBundle:DepartmentInfo')
                            ->getAccountDepartment($accountChild);

                    array_push($departmentInfos, $department);
                }
            } else {
                array_push($departmentInfos, $usr->getDepartmentAuthorization()->getDepartmentInfo());
            }
        }

        if ($usr->getAccountInfo()->hasRole('IS_USUAL')) {
            $departmentInfos = [];
            array_push($departmentInfos, $usr->getDepartmentAuthorization()->getDepartmentInfo());
        }

        if (!isset($departmentInfos)) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        return $this->render('departmentinfo/index.html.twig', array(
                    'departmentInfos' => $departmentInfos,
                    'account' => $account,
        ));
    }

    /**
     * Creates a new departmentInfo entity.
     *
     * @Route("/new", name="departmentinfo_new")
     * @Method({"GET", "POST"})
     */
    public function newAction(Request $request, $account) {

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        $em = $this->getDoctrine()->getManager();

        if (count($request->request) > 0) {

            $departmentInfo = new Departmentinfo();

            $departmentInfoParent = $this->getDoctrine()
                    ->getRepository('AppBundle:DepartmentInfo')
                    ->find(intval($request->request->get('user_department')));
            if (!$departmentInfoParent) {
                throw $this->createNotFoundException('Department Not Found!');
            }

            $departmentInfoConflict = $this->getDoctrine()
                    ->getRepository('AppBundle:DepartmentInfo')
                    ->findOneBy(array('name' => $request->request->get('name'),
                'accountInfo' => $departmentInfoParent->getAccountInfo())
            );

            if ($departmentInfoConflict) {
                throw new ConflictHttpException('User Already Exists!');
            }

            $departmentInfo->setName($request->request->get('name'))
                    ->setDescription('IS_USUAL_DEPARTMENT')
                    ->setParent($departmentInfoParent)
                    ->setAccountInfo($departmentInfoParent->getAccountInfo());

            $em->persist($departmentInfo);
            $em->flush();

            return $this->redirectToRoute('departmentinfo_show', array(
                        'id' => $departmentInfo->getId(),
                        'account' => $account));
        }

        if ($this->get('security.authorization_checker')->isGranted('ROLE_GOD') &&
                $usr->getAccountInfo()->hasRole('IS_GOD')) {
            $departmentInfos = $em->getRepository('AppBundle:DepartmentInfo')
                    ->getAllParentsDepartments();
        }

        if ($usr->getAccountInfo()->hasRole('IS_PROVIDER')) {
            $departmentInfos = [];
            if ($usr->isAccountAdminUser()) {
                array_push($departmentInfos, $usr->getDepartmentAuthorization()->getdepartmentInfo());
                foreach ($usr->getAccountInfo()->getChildrenCollection() as $accountChild) {
                    $department = $em->getRepository('AppBundle:DepartmentInfo')
                            ->getAccountDepartment($accountChild);
                    array_push($departmentInfos, $department);
                }
            } else {
                array_push($departmentInfos, $usr->getDepartmentAuthorization()->getDepartmentInfo());
            }
        }

        if ($usr->getAccountInfo()->hasRole('IS_USUAL')) {
            $departmentInfos = [];
            array_push($departmentInfos, $usr->getDepartmentAuthorization()->getDepartmentInfo());
        }

        if (!isset($departmentInfos)) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        return $this->render('departmentinfo/new.html.twig', array(
                    'account' => $account,
                    'departments' => $departmentInfos
        ));
    }

    /**
     * Finds and displays a departmentInfo entity.
     *
     * @Route("/{id}", name="departmentinfo_show")
     * @Method("GET")
     */
    public function showAction(DepartmentInfo $departmentInfo, $account) {
        $deleteForm = $this->createDeleteForm($departmentInfo, $account);

        return $this->render('departmentinfo/show.html.twig', array(
                    'departmentInfo' => $departmentInfo,
                    'delete_form' => $deleteForm->createView(),
                    'account' => $account,
        ));
    }

    /**
     * Displays a form to edit an existing departmentInfo entity.
     *
     * @Route("/{id}/edit", name="departmentinfo_edit")
     * @Method({"GET", "POST"})
     */
    public function editAction(Request $request, DepartmentInfo $departmentInfo, $account) {

        if ($departmentInfo->isAccountDepartment()) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        $usr = $this->get('security.token_storage')->getToken()->getUser();
        $em = $this->getDoctrine()->getManager();

        if (count($request->request) > 0) {

            $departmentInfoParent = $this->getDoctrine()
                    ->getRepository('AppBundle:DepartmentInfo')
                    ->find(intval($request->request->get('user_department')));
            if (!$departmentInfoParent) {
                throw $this->createNotFoundException('Department Not Found!');
            }

            if ($departmentInfoParent === $departmentInfo) {
                throw new ConflictHttpException('Forbidden!');
            }

            if ($departmentInfoParent->getAccountInfo() !== $departmentInfo->getAccountInfo()) {
                throw new ConflictHttpException('Forbidden!');
            }

            $departmentInfoConflict = $this->getDoctrine()
                    ->getRepository('AppBundle:DepartmentInfo')
                    ->findOneBy(array('name' => $request->request->get('name'),
                'accountInfo' => $departmentInfoParent->getAccountInfo())
            );

            if ($departmentInfoConflict && $departmentInfoConflict !== $departmentInfo) {
                throw new ConflictHttpException('Group Already Exists!');
            }

            $departmentInfo->setName($request->request->get('name'))
                    ->setParent($departmentInfoParent);

            $em->merge($departmentInfo);
            $em->flush();

            return $this->redirectToRoute('departmentinfo_show', array(
                        'id' => $departmentInfo->getId(),
                        'account' => $account));
        }

        if ($this->get('security.authorization_checker')->isGranted('ROLE_GOD') &&
                $usr->getAccountInfo()->hasRole('IS_GOD')) {
            $departmentInfos = $em->getRepository('AppBundle:DepartmentInfo')
                    ->getAllParentsDepartments();
        }

        if ($usr->getAccountInfo()->hasRole('IS_PROVIDER')) {
            $departmentInfos = [];
            if ($usr->isAccountAdminUser()) {
                foreach ($usr->getAccountInfo()->getChildrenCollection() as $accountChild) {
                    $department = $em->getRepository('AppBundle:AccountInfo')
                            ->getAccountDepartment($accountChild);
                    array_push($departmentInfos, $department);
                }
            } else {
                array_push($departmentInfos, $usr->getDepartmentAuthorization()->getDepartmentInfo());
            }
        }

        if ($usr->getAccountInfo()->hasRole('IS_USUAL')) {
            $departmentInfos = [];
            array_push($departmentInfos, $usr->getDepartmentAuthorization()->getDepartmentInfo());
        }

        if (!isset($departmentInfos)) {
            throw $this->createAccessDeniedException('You cannot access this page!');
        }

        $deleteForm = $this->createDeleteForm($departmentInfo, $account);
        return $this->render('departmentinfo/edit.html.twig', array(
                    'departments' => $departmentInfos,
                    'departmentInfo' => $departmentInfo,
                    'delete_form' => $deleteForm->createView(),
                    'account' => $account,
        ));
    }

    /**
     * Deletes a departmentInfo entity.
     *
     * @Route("/{id}", name="departmentinfo_delete")
     * @Method("DELETE")
     */
    public function deleteAction(Request $request, DepartmentInfo $departmentInfo, $account) {
        $form = $this->createDeleteForm($departmentInfo, $account);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->remove($departmentInfo);
            $em->flush();
        }

        return $this->redirectToRoute('departmentinfo_index');
    }

    /**
     * Creates a form to delete a departmentInfo entity.
     *
     * @param DepartmentInfo $departmentInfo The departmentInfo entity
     *
     * @return \Symfony\Component\Form\Form The form
     */
    private function createDeleteForm(DepartmentInfo $departmentInfo, $account) {
        return $this->createFormBuilder()
                        ->setAction($this->generateUrl('departmentinfo_delete', array('id' => $departmentInfo->getId(), 'account' => $account)))
                        ->setMethod('DELETE')
                        ->getForm()
        ;
    }

}
