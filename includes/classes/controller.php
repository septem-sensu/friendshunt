<?php

declare( strict_types = 1 );

include_once ( __DIR__ . '/../classes/baseObject.php' );
include_once ( __DIR__ . '/../classes/presentation.php' );
include_once ( __DIR__ . '/../classes/player.php' );
include_once ( __DIR__ . '/../classes/game.php' );

/**
 * Controller Class for the Friends Hunt App.
 *
 * This Class represents the Controller Class for the Friends Hunt App with his Properties and Methods.
 * The Controller Class controls all Requests and Response with the App.
 *
 * @category    class
 * @package     Application
 * @subpackage  FriendsHunt
 * @access      public
 * @author      Markus Götz <info@septem-sensu.de>
 * @copyright   2026 Markus Götz <info@septem-sensu.de>
 * @since       2026-06-05
 * @version     0.1.0
 *
 * @example     $objController = new Controller();
 *
*/
class Controller {

/* Class Properties */
  protected string        $resultType;
  protected string        $viewName;
  protected object        $viewObject;
  protected string        $objectId;
  protected string        $className;
  protected array         $actions;
  protected array         $templates;
  protected object        $config;
  protected Presentation  $presentationObject;
  protected string        $role;
  protected object        $object;
  protected object        $response;

/**
 * This Method is the Constructor for this Class
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 * @return     void
 * @example    $objController = new Controller();
 *
*/
  public function __construct() {
    $this->init();

    return;
  }

/**
 * This Method init the Controler Properties.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     void
 *
 * @example    $this->init();
 * @example    $objController->init();
 *
*/
  private function init() : void {
    $this->config             = BaseObject::getConfig();
    $this->presentationObject = new Presentation();
    $this->role               = $this->config->defaultRole;
    $this->response           = new stdClass();
    $this->response->object   = new stdClass();
    $this->response->result   = new stdClass();
    $this->response->errors   = [];
    $this->resultType         = isset( $_GET[ 'result' ] ) && $_GET[ 'result' ] != '' ? $_GET[ 'result' ] : 'content';
    $this->viewName           = isset( $_GET[ 'view' ] ) ? $_GET[ 'view' ] : $this->config->defaultView;
    $this->objectId           = isset( $_GET[ 'id' ] ) ? $_GET[ 'id' ] : '';
    $this->objectId           = $this->objectId == '' && isset( $this->object ) ? $this->object->id() : $this->objectId;

    if( ! file_exists( BaseObject::FILEPATHJSON . 'views/' . $this->viewName . '.json' ) ) {
      header( 'Location: index.php?view=' . $this->config->defaultView );
      return;
    }

    $this->viewObject         = BaseObject::loadFileDeCrypted( BaseObject::FILEPATHJSON . 'views/' . $this->viewName . '.json' );
    $this->className          = $this->viewObject->class;
    $this->templates          = $this->viewObject->templates;
    $this->actions            = $this->viewObject->actions;

    return;
  }

/**
 * This Method is the getter for the Presentation Object.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     Presentation   $objPresentation  The Presentation Object
 *
 * @example    $objPresentation = $this->getPresentationObject();
 * @example    $objPresentation = $objController->getPresentationObject();
 *
*/
  public function getPresentationObject() : Presentation {
    return $this->presentationObject;
  }

/**
 * This Method is the getter for the current View Object.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     object   $objViewObject  The current View Object
 *
 * @example    $objViewObject = $this->getViewObject();
 * @example    $objViewObject = $objController->getViewObject();
 *
*/
  public function getViewObject() : object {
    return $this->viewObject;
  }

/**
 * This Method is the getter for the Ajax Result Type.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     string   $strResultType  The Result Type (json or content)
 *
 * @example    $strResultType = $this->getResultType();
 * @example    $strResultType = $objController->getResultType();
 *
*/
  public function getResultType() : string {
    return $this->resultType;
  }

/**
 * This Method is the setter for the Object to handle.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      object   $objObject The Object to set
 * @return     void
 *
 * @example    $this->setObject( objObject );
 * @example    $objController->setObject( objObject );
 *
*/
  public function setObject( object $objObject ) : void {
    $this->object = $objObject;

    return;
  }

/**
 * This Method is the setter for the System Role of the current User.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string   $strRole  The current User System Role
 * @return     void
 *
 * @example    $this->setRole( strRole );
 * @example    $this->objController( strRole );
 *
*/
  public function setRole( string $strRole ) : void {
    $this->role = $strRole;

    $this->presentationObject->assignTemplateVar( 'role', 'Player', null, $strRole );

    return;
  }

/**
 * This Method is the Main Method of the Controler Class and controls the Requests and the Response.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     mixed    $mixResult    The Result of the Response
 *
 * @example    $mixResult = $this->execute();
 * @example    $mixResult = $objController->execute();
 *
*/
  public function execute() : mixed {
    if( isset( $_GET[ 'result' ] ) ) {
      $this->resultType = 'json';

      return $this->json();
    }

    $this->resultType = 'content';

    return $this->view();
  }

/**
 * This Method controls the Roles for the View Object and set the default Role if the Role undefined.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     void
 *
 * @example    $this->checkRole();
 * @example    $objController->checkRole();
 *
*/
  private function checkRole() : void {
    if( ! file_exists( __DIR__ . '/../json/data/dataPlayer.json' ) ) {
      Presentation::deleteCookie();
      $this->setRole( 'guest' );

      return;
    }

    $strSetRole = $this->config->setRole;
    $strSetRole( $this );

    return;
  }

/**
 * This Method is the View Method for the Response Content.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     string    $strContent    The Response Content
 *
 * @example    $strContent = $this->view();
 * @example    $strContent = $objController->view();
 *
*/
  private function view() : string {
    $this->checkRole();

    if( $this->role !=  $this->config->defaultRole && $this->viewName == $this->config->defaultView ) header( 'Location: index.php?view=' . $this->config->defaultLoginView );

    if( $this->role !=  $this->config->defaultRole && $this->viewName == $this->config->defaultView ) header( 'Location: index.php?view=' . $this->config->defaultLoginView );
    if( ! in_array( $this->role, $this->viewObject->roles ) )  header( 'Location: index.php?view=' . $this->config->defaultView );
    if( file_exists( __DIR__ . '/../json/data/dataPlayer.json' ) ) {
      if( $this->viewName == $this->config->defaultSetupView ) header( 'Location: index.php?view=' . $this->config->defaultView );
    } else {
      if( $this->viewName != $this->config->defaultSetupView ) header( 'Location: index.php?view=' . $this->config->defaultSetupView );
    }

    $this->executeActions();

    return $this->renderView();
  }

/**
 * This Method is the JSON View Method for the Json Content.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     string    $strJsonContent    The Json Content
 *
 * @example    $strJsonContent = $this->json();
 * @example    $strJsonContent = $objController->json();
 *
*/
  private function json() : string {
    $this->checkRole();

    if( ! in_array( $this->role, $this->viewObject->roles )   ) {
        $objError           = new stdClass();
        $objError->message  = 'Zugriff verweigert';
        $objError->redirect = 'index.php?view=' . $this->config->defaultView;

        array_push( $this->response->errors, $objError );

        return json_encode( $this->response );
    }

    //$this->executeActions();
    $this->response->object = $this->savePostData();
    $this->responseData();
    $this->presentationObject->getJsonHeader();

    return json_encode( $this->response );
  }

/**
 * This Method save all Post Data to File and set the Properties of the Request Object.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     object    $objObject    The Result Object
 *
 * @example    $objObject = $this->savePostData();
 * @example    $objObject = $objController->savePostData();
 *
*/
  private function savePostData() {
    $strClass     = isset( $_POST[ 'class' ] ) ? $_POST[ 'class' ] : null;
    $strId        = isset( $_POST[ 'id' ] ) ? $_POST[ 'id' ] : null;
    $strProperty  = isset( $_POST[ 'property' ] ) ? $_POST[ 'property' ] : null;
    $strRedirect  = isset( $_POST[ 'redirect' ] ) ? $_POST[ 'redirect' ] : null;
    $strFile      = isset( $_FILES[ 'files' ] ) ? $_FILES[ 'files' ] : null;
    $strPath      = __DIR__ . '/../files/';

    if( ! isset( $strClass ) || ! isset( $strId ) || ! isset( $strProperty ) || ! isset( $strFile ) ) return;
    if( ! file_exists( $strPath . lcfirst( $strClass ) . '/' ) ) mkdir( $strPath . lcfirst( $strClass ) );
    if( ! file_exists( $strPath . lcfirst( $strClass ) . '/' . $strId ) ) mkdir( $strPath . lcfirst( $strClass ) . '/' . $strId );

    $objObject    = new $strClass( $strId );
    $strPath      = $strPath . lcfirst( $strClass ) . '/' . $strId . '/';
    $strTmpName   = $_FILES[ 'files' ][ 'tmp_name' ];
    $strName      = basename( $_FILES[ 'files' ][ 'name' ] );
    $strName      = $objObject->newId( 'file' ) . '_' . $strName;

    $objObject->set( $strProperty, $strName );

    move_uploaded_file( $strTmpName, $strPath . $strName );

    if( isset( $_POST[ 'method' ] ) ) {
      $_POST[ 'method' ]( $strName );
      $objObject->fillObject();
      $objObject = $objObject->serializeObject();
      if( isset( $strRedirect ) ) $objObject->redirect = $strRedirect;
    }

    return $objObject;
  }

/**
 * This Method checked the System Role of the current User for a Method in a Class.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string   $strClass     The Class Name of the Method
 * @param      string   $strMethod   The Method to check
 * @return     bool     $boolAllowed  True if the User is allowed to call this Method
 *
 * @example    $boolAllowed = $this->checkPermissions( strClass, strMethod );
 * @example    $boolAllowed = $objController->checkPermissions( strClass, strMethod );
 *
*/
  private function checkPermissions( string $strClass, string $strMethod ) : bool {
    $objPermissions = BaseObject::loadFileDeCrypted( BaseObject::FILEPATHDATA . 'dataPermissions.json' );
    $strRole         = $this->role;

    if( ! in_array( $strClass . '::' . $strMethod, $objPermissions->$strRole->methods ) ) {
      $objError           = new stdClass();
      $objError->message  = 'Zugriff verweigert';

      array_push( $this->response->errors, $objError );

      return false;
    }

    return true;
  }

/**
 * This Method handled the Response Object of the Request.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     void
 *
 * @example    $this->responseData();
 * @example    $objController->responseData();
 *
*/
  private function responseData() : void {
    $objRequestObject             = json_decode( file_get_contents( 'php://input' ) );

    if( ! isset( $objRequestObject ) ) return;

    $objRequestObject->controller = $this;
    $strClassName                 = isset( $objRequestObject->class ) && $objRequestObject->class != '' ? $objRequestObject->class : null;
    $strMethod                    = isset( $objRequestObject->method ) && $objRequestObject->method != '' ? $objRequestObject->method : null;
    $strObjectId                  = isset( $objRequestObject->id ) && $objRequestObject->id != '' ? $objRequestObject->id : null;

    if( ! $this->checkPermissions( $strClassName, $strMethod ) ) return;

    if( isset( $strObjectId ) ) {
      $objObject              = new $strClassName( $strObjectId );
      $this->response->result = $objObject->$strMethod( $objRequestObject );
    } else {
      $this->response->result = $strClassName::$strMethod( $objRequestObject );
    }

    return;
  }

/**
 * This Method is rendering the Content and set the Template Variables for the Response.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     string   $strContent   The Content for the Response
 *
 * @example    $strContent = $this->renderView();
 * @example    $strContent = $objController->renderView();
 *
*/
  private function renderView() : string {
    $strContent     = '';

    $this->objectId = isset( $_GET[ 'id' ] ) && $_GET[ 'id' ] != '' ? $_GET[ 'id' ] : '';
    $this->objectId = $this->objectId == '' && isset( $this->object ) ? $this->object->id() : $this->objectId;

    if( isset( $_GET[ 'fields' ] ) && $_GET[ 'fields' ] != '' ) {
      $this->presentationObject->assignTemplateVar( 'fields', $_GET[ 'fields' ], null, json_encode( BaseObject::fields( $_GET[ 'fields' ] ) ) );
    }

    $this->presentationObject->assignTemplateVar( 'fields', 'default', null, json_encode( BaseObject::fields( $this->className ) ) );
    $this->presentationObject->assignTemplateVar( 'view', 'default', null, json_encode( $this->viewObject ) );
    $this->presentationObject->assignTemplateVar( 'class', 'default', null, $this->className );
    $this->presentationObject->assignTemplateVar( 'id', 'default', null, isset( $this->objectId ) ? $this->objectId : '' );

    if( isset( $this->object ) && get_class( $this->object ) == $this->className ) {
      $this->presentationObject->assignTemplateVar( $this->object->serializeObject( $this->object ), $this->className, BaseObject::fields( $this->className ) );
    } else if( isset( $this->className ) && $this->className != '' && isset( $this->objectId ) && $this->objectId != '' ) {
      $this->object = new $this->className( $this->objectId );
      $this->presentationObject->assignTemplateVar( $this->object->serializeObject( $this->object ), $this->className, BaseObject::fields( $this->className ) );
    }

    for( $i = 0; $i < count( $this->templates ); $i++ ) {
      $strContent .= $this->presentationObject->processTemplate( $this->templates[ $i ] );
    }

    return $strContent;
  }

/**
 * This Method execute the Actions before rendering the View Content.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     void
 *
 * @example    $this->executeActions();
 * @example    $objController->executeActions();
 *
*/
  private function executeActions() : void {
    $strObjectId      = isset( $_GET[ 'id' ] ) ? $_GET[ 'id' ] : null;
    $strObjectId      = ( ! isset( $strObjectId ) || $strObjectId == '' ) && isset( $this->object ) ? $this->object->id() : $strObjectId;

    for( $i = 0; $i < count( $this->actions ); $i++ ) {
      $strObjectId    = ( ! isset( $this->objectId ) || $this->objectId == '' ) && isset( $this->object ) ? $this->object->id() : $this->objectId;
      $arrActionParts = explode( '::', $this->actions[ $i ] );

      if( isset( $strObjectId ) && $strObjectId != '' && $arrActionParts[ 0 ] == $this->className ) {
        $objObject        = new $this->className( $strObjectId );
        $strAction        = $arrActionParts[ 1 ];
        $objObject->$strAction( $this );
      } else {
        $this->actions[ $i ]( $this );
      }
    }

    return;
  }

}

// EOF