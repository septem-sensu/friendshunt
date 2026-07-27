<?php

declare( strict_types = 1 );

require_once ( __DIR__ . '/../classes/baseObject.php' );
require_once ( __DIR__ . '/../classes/presentation.php' );
require_once ( __DIR__ . '/../classes/player.php' );
require_once ( __DIR__ . '/../classes/game.php' );

/**
 * Controller Class for the Friends-Hunt App.
 *
 * This Class represents the Controller Class for the Friends-Hunt App with his Properties and Methods.
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
  protected string        $requestType;
  protected string        $viewName;
  protected object        $viewObject;
  protected string        $objectId;
  protected string        $className;
  protected array         $actions;
  protected array         $templates;
  protected object        $config;
  protected Presentation  $presentationObject;
  protected string        $role;
  protected string        $playerId;
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
 * This Method initializes the Controller Properties.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     void
 *
 * @example    $this->init();
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
    $this->viewName           = isset( $_GET[ 'view' ] ) ? basename( $_GET[ 'view' ] ) : $this->config->defaultView;
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

    if( isset( $_GET[ 'result' ] ) ) {
      $this->resultType  = 'json';
      $this->requestType = empty( $_POST[ 'class' ] ) ? 'json' : 'post';
    } else {
      $this->resultType  = 'content';
      $this->requestType = 'json';
    }

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
 * @example    $objController->setObject( $objObject );
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
 * @example    $objController->setRole( $strRole );
 *
*/
  public function setRole( string $strRole ) : void {
    $this->role = $strRole;

    $this->presentationObject->assignTemplateVar( 'role', 'Player', null, $strRole );

    return;
  }

/**
 * This Method is the setter for the Player Id of the current User.
 *
 * @access     public
 * @since      2026-07-27
 * @version    0.1.0
 *
 * @param      string   $strPlayerId  The current Player Id
 * @return     void
 *
 * @example    $objController->setPlayerId( $strPlayerId );
 *
*/
  public function setPlayerId( string $strPlayerId ) : void {
    $this->playerId = $strPlayerId;

    $this->presentationObject->assignTemplateVar( 'playerId', 'Player', null, $strPlayerId );

    return;
  }

/**
 * This Method is the Main Method of the Controller Class and controls the Requests and the Response.
 *
 * @access     public
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     mixed    $mixResult    The Result of the Response
 *
 * @example    $mixResult = $objController->execute();
 *
*/
  public function execute() : mixed {
    if( $this->resultType == 'json' ) {
      return $this->requestType == 'json' ? $this->json() : $this->post();
    }

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
 *
*/
  private function view() : string {
    $this->checkRole();

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
 *
*/
  private function json() : string {
    $objRequestObject = json_decode( file_get_contents( 'php://input' ) );
    $strClassName     = isset( $objRequestObject->class ) && $objRequestObject->class != '' ? $objRequestObject->class : null;
    $strMethod        = isset( $objRequestObject->method ) && $objRequestObject->method != '' ? $objRequestObject->method : null;
    $strObjectId      = isset( $objRequestObject->id ) && $objRequestObject->id != '' ? $objRequestObject->id : null;
    $boolHasErrors    = false;

    if( isset( $strClassName ) && isset( $strMethod ) && $strClassName . '::' . $strMethod == $this->config->loginMethod ) {
      $this->object = ( $this->config->loginMethod )( $objRequestObject );
    }

    $this->checkRole();

    if( ! isset( $strClassName ) || ! isset( $strMethod ) ) $boolHasErrors = true;
    if( ! $boolHasErrors && ! in_array( $this->role, $this->viewObject->roles ) ) $boolHasErrors = true;
    if( ! $boolHasErrors && ! $this->checkPermissions( $strClassName, $strMethod, false ) ) $boolHasErrors = true;

    if( $boolHasErrors ) {
      $objError           = new stdClass();
      $objError->message  = 'Zugriff verweigert';
      $objError->redirect = 'index.php?view=' . $this->config->defaultView;

      array_push( $this->response->errors, $objError );

      $this->presentationObject->getJsonHeader();

      return json_encode( $this->response );
    }

    $objRequestObject->controller = $this;

    if( isset( $strObjectId ) ) {
      $objObject              = new $strClassName( $strObjectId );
      $this->response->result = $objObject->$strMethod( $objRequestObject );
    } else {
      $this->response->result = $strClassName::$strMethod( $objRequestObject );
    }

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
 * @return     string  $strJsonContent  The Json Content
 *
 * @example    $strJsonContent = $this->post();
 *
*/
  private function post() : string {
    $strClassName  = isset( $_POST[ 'class' ] ) ? $_POST[ 'class' ] : null;
    $strMethod     = isset( $_POST[ 'method' ] ) ? $_POST[ 'method' ] : null;
    $strId         = isset( $_POST[ 'id' ] ) ? $_POST[ 'id' ] : null;
    $strProperty   = isset( $_POST[ 'property' ] ) ? $_POST[ 'property' ] : null;
    $strRedirect   = isset( $_POST[ 'redirect' ] ) ? $_POST[ 'redirect' ] : null;
    $strFile       = isset( $_FILES[ 'files' ] ) ? $_FILES[ 'files' ] : null;
    $strPath       = __DIR__ . '/../files/';
    $boolHasErrors = false;

    $this->checkRole();

    if( empty( $strClassName ) || empty( $strId ) || empty( $strProperty ) || empty( $strFile ) || empty( $strMethod ) ) $boolHasErrors = true;
    if( ! $boolHasErrors && ! in_array( $this->role, $this->viewObject->roles ) ) $boolHasErrors = true;
    if( ! $boolHasErrors && $strClassName !== 'Player' && $strClassName !== 'Game' ) $boolHasErrors = true;
    if( ! $boolHasErrors && ! $this->checkPermissions( $strClassName, $strMethod, false ) ) $boolHasErrors = true;

    if( $boolHasErrors ) {
      $objError           = new stdClass();
      $objError->message  = 'Zugriff verweigert';
      $objError->redirect = 'index.php?view=' . $this->config->defaultView;

      array_push( $this->response->errors, $objError );

      $this->presentationObject->getJsonHeader();

      return json_encode( $this->response );
    }

    $strTargetPath = realpath( $strPath ) . DIRECTORY_SEPARATOR . lcfirst( $strClassName ) . DIRECTORY_SEPARATOR . $strId;

    if( ! str_starts_with( realpath( $strTargetPath ), realpath( $strPath ) ) ) {
      $objError           = new stdClass();
      $objError->message  = 'Zugriff verweigert';
      $objError->redirect = 'index.php?view=' . $this->config->defaultView;

      array_push( $this->response->errors, $objError );

      $this->presentationObject->getJsonHeader();

      return json_encode( $this->response );
    }

    if( ! file_exists( $strPath . lcfirst( $strClassName ) . '/' ) ) mkdir( $strPath . lcfirst( $strClassName ) );
    if( ! file_exists( $strPath . lcfirst( $strClassName ) . '/' . $strId ) ) mkdir( $strPath . lcfirst( $strClassName ) . '/' . $strId );

    $objObject    = new $strClassName( $strId );
    $strPath      = $strPath . lcfirst( $strClassName ) . '/' . $strId . '/';
    $strTmpName   = $_FILES[ 'files' ][ 'tmp_name' ];
    $strName      = basename( $_FILES[ 'files' ][ 'name' ] );
    $strName      = $objObject->newId( 'file' ) . '_' . $strName;

    move_uploaded_file( $strTmpName, $strPath . $strName );

    $objObject->set( $strProperty, $strName );
    $objObject->$strMethod( $strName );

    $this->response->object = $objObject->serializeObject();

    if( ! empty( $strRedirect ) ) $this->response->object->redirect = $strRedirect;

    $this->presentationObject->getJsonHeader();

    return json_encode( $this->response );
  }

/**
 * This Method checked the System Role of the current User for a Method in a Class.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @param      string   $strClass      The Class Name of the Method
 * @param      string   $strMethod     The Method to check
 * @param      bool     $boolAddError  Specifies whether an error should be pushed into the response if the permission check is incorrect
 * @return     bool     $boolAllowed   True if the User is allowed to call this Method
 *
 * @example    $boolAllowed = $this->checkPermissions( $strClass, $strMethod, $boolAddError );
 *
*/
  private function checkPermissions( string $strClass, string $strMethod, bool $boolAddError ) : bool {
    $objPermissions = BaseObject::loadFileDeCrypted( BaseObject::FILEPATHDATA . 'dataPermissions.json' );
    $strRole         = $this->role;

    if( ! in_array( $strClass . '::' . $strMethod, $objPermissions->$strRole->methods ) ) {
      if( $boolAddError ) {
        $objError           = new stdClass();
        $objError->message  = 'Zugriff verweigert';

        array_push( $this->response->errors, $objError );
      }

      return false;
    }

    return true;
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
 *
*/
  private function renderView() : string {
    $strContent     = '';
    $strPlayerTheme = Presentation::getCookieProperty( 'themes' );
    $strTheme       = isset( $strPlayerTheme ) ? $strPlayerTheme : 'default';

    $this->objectId = isset( $_GET[ 'id' ] ) && $_GET[ 'id' ] != '' ? $_GET[ 'id' ] : '';
    $this->objectId = $this->objectId == '' && isset( $this->object ) ? $this->object->id() : $this->objectId;

    if( isset( $_GET[ 'fields' ] ) && $_GET[ 'fields' ] != '' ) {
      $this->presentationObject->assignTemplateVar( 'fields', $_GET[ 'fields' ], null, json_encode( BaseObject::fields( $_GET[ 'fields' ] ) ) );
    }

    $this->presentationObject->assignTemplateVar( 'configuration', 'default', null, json_encode( $this->config ) );
    $this->presentationObject->assignTemplateVar( 'fields', 'default', null, json_encode( BaseObject::fields( $this->className ) ) );
    $this->presentationObject->assignTemplateVar( 'titles', 'default', null, json_encode( BaseObject::loadFileDeCrypted( __DIR__ . '/../json/data/dataTitles.json' ) ) );
    $this->presentationObject->assignTemplateVar( 'view', 'default', null, json_encode( $this->viewObject ) );
    $this->presentationObject->assignTemplateVar( 'class', 'default', null, $this->className );
    $this->presentationObject->assignTemplateVar( 'id', 'default', null, isset( $this->objectId ) ? $this->objectId : '' );
    $this->presentationObject->assignTemplateVar( 'theme', 'default', null, $strTheme );
    $this->presentationObject->assignTemplateVar( 'themes', 'default', null, json_encode( Presentation::getFileNamesFromDirectory( __DIR__ . '/../css/themes/', true ) ) );

    if( isset( $this->object ) && get_class( $this->object ) == $this->className ) {
      $this->presentationObject->assignTemplateVar( $this->object->serializeObject( $this->object ), $this->className, BaseObject::fields( $this->className ) );
      $this->presentationObject->assignTemplateVar( 'object', 'default', null, json_encode( $this->object->serializeObject( $this->object ) ) );
    } else if( isset( $this->className ) && $this->className != '' && isset( $this->objectId ) && $this->objectId != '' ) {
      $this->object = new $this->className( $this->objectId );
      $this->presentationObject->assignTemplateVar( $this->object->serializeObject( $this->object ), $this->className, BaseObject::fields( $this->className ) );
      $this->presentationObject->assignTemplateVar( 'object', 'default', null, json_encode( $this->object->serializeObject( $this->object ) ) );
    } else {
      $this->presentationObject->assignTemplateVar( 'object', 'default', null, json_encode( new stdClass() ) );
    }

    foreach( $this->templates as $strTemplate ) {
      $strContent .= $this->presentationObject->processTemplate( $strTemplate );
    }

    return $strContent;
  }

/**
 * This Method executes the Actions before rendering the View Content.
 *
 * @access     private
 * @since      2026-06-05
 * @version    0.1.0
 *
 * @return     void
 *
 * @example    $this->executeActions();
 *
*/
  private function executeActions() : void {
    $strObjectId      = isset( $_GET[ 'id' ] ) ? $_GET[ 'id' ] : null;
    $strObjectId      = ( ! isset( $strObjectId ) || $strObjectId == '' ) && isset( $this->object ) ? $this->object->id() : $strObjectId;

    foreach( $this->actions as $strAction ) {
      $strObjectId    = ( ! isset( $this->objectId ) || $this->objectId == '' ) && isset( $this->object ) ? $this->object->id() : $this->objectId;
      $arrActionParts = explode( '::', $strAction );

      if( ! $this->checkPermissions( $arrActionParts[ 0 ], $arrActionParts[ 1 ], true ) ) continue;

      if( isset( $strObjectId ) && $strObjectId != '' && $arrActionParts[ 0 ] == $this->className ) {
        $objObject        = new $this->className( $strObjectId );
        $strAction        = $arrActionParts[ 1 ];
        $objObject->$strAction( $this );
      } else {
        $strAction( $this );
      }
    }

    return;
  }

}

// EOF